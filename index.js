(function (plugin) {
    "use strict";

    var Package = require("./package.json"),
        AWS = require('aws-sdk'),
        mime = require("mime"),
        uuid = require("uuid").v4,
        fs = require('fs'),
        path = require('path'),
        async = require('async'),
        util = require('util'),
        posts = module.parent.require('./posts'),
        winston = module.parent.require('winston'),
        db = module.parent.require('./database'),
        constants = {
            'name': "AmazonS3",
            'admin': {
                'api': '',
                'icon': 'fa-picture-o'
            },
            config: {
                env: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
                    bucket: process.env.AMAZONS3_BUCKET || "",
                    host: process.env.AMAZONS3_HOST || "",
                    path: process.env.AMAZONS3_PATH || ""
                },
                db: {
                    accessKeyId: "",
                    secretAccessKey: "",
                    bucket: "",
                    host: "",
                    path: ""
                }
            }
        },
        s3bucket;

    function log(type, message) {
        winston.log(type, '[plugins/%s] %s', Package.name, message);
    }

    function uploadToAmazon(path, file, callback) {
        var buffer = fs.createReadStream(file.path);
        var filename = uuid() + '_' + file.originalFilename.replace(/[ \(\)]/g, '_');;
        var fullpath = "useruploads/" + path + "/";
        var params = {
            ACL: "public-read",
            Bucket: constants.config.env.bucket || constants.config.db.bucket,
            Key: fullpath + filename,
            Body: buffer,
            ContentLength: buffer.length,
            ContentType: mime.lookup(file.name),
            StorageClass: 'REDUCED_REDUNDANCY'
        };

        s3bucket.putObject(params, function (err) {
            if (err) {
                return callback(err);
            }
        });

        // Use protocol-less urls so that both HTTP and HTTPS work:
        var url = util.format("//%s.%s/%s%s",
            constants.config.env.bucket || constants.config.db.bucket,
            constants.config.env.host || constants.config.db.host ? constants.config.env.host || constants.config.db.host : "s3.amazonaws.com",
            constants.config.env.path || constants.config.db.path ? constants.config.env.path || constants.config.db.path + "/" : "",
            fullpath + encodeURIComponent(filename)
        );

        callback(null, {
            name: file.name,
            url: url
        });

        //async.series([
        //        function(callback){
        //            s3bucket.putObject(params, function (err) {
        //                if (err) {
        //                    return callback(err);
        //                }
        //                callback(null);
        //            });
        //        }
        //    ],
        //    function(err, results){
        //        if (err) {
        //            return callback(err);
        //        }
        //
        //        // Use protocol-less urls so that both HTTP and HTTPS work:
        //        var url = util.format("//%s.%s/%s%s",
        //            constants.config.env.bucket || constants.config.db.bucket,
        //            constants.config.env.host || constants.config.db.host ? constants.config.env.host || constants.config.db.host : "s3.amazonaws.com",
        //            constants.config.env.path || constants.config.db.path ? constants.config.env.path || constants.config.db.path + "/" : "",
        //            fullpath + encodeURIComponent(filename)
        //        );
        //
        //        callback(null, {
        //            name: file.name,
        //            url: url
        //        });
        //    });
    }

    function save(settings, res, next) {
        var data = {
            accessKeyId: settings.body.accessKeyId,
            bucket: settings.body.bucket,
            host: settings.body.host,
            path: settings.body.path,
            secretAccessKey: settings.body.secretAccessKey
        };

        db.setObject(Package.name, data, function (err) {
            if (err) {
                log('error', err.message);
                return next(err);
            }

            constants.config.db = data;
            updateSettings();

            log('info', 'Saved!');
            res.json('Saved!');
        });
    }

    function validate() {
        return !(constants.config.env.bucket &&
            constants.config.env.accessKeyId &&
            constants.config.env.secretAccessKey) &&
            !(constants.config.db.bucket &&
            constants.config.db.accessKeyId &&
            constants.config.db.secretAccessKey);
    }

    function updateSettings(){
        s3bucket = new AWS.S3({
            accessKeyId: constants.config.env.accessKeyId || constants.config.db.accessKeyId,
            secretAccessKey: constants.config.env.secretAccessKey || constants.config.db.secretAccessKey
        });
    }


    plugin.exports = {
        load: function (params, callback) {
            function render(req, res, next) {
                constants.config.csrf = req.csrfToken();
                res.render('admin/plugins/info', constants.config);
            }

            db.getObjectFields(Package.name, Object.keys(constants.config.env), function (err, result) {
                if (err) {
                    log('error', err.message);
                }
                else {
                    constants.config.db.accessKeyId = result.accessKeyId;
                    constants.config.db.secretAccessKey = result.secretAccessKey;
                    constants.config.db.bucket = result.bucket;
                    constants.config.db.host = result.host;
                    constants.config.db.path = result.path;

                    updateSettings();
                }
            });

            params.router.get('/admin/plugins/amazons3', params.middleware.applyCSRF, params.middleware.admin.buildHeader, render);
            params.router.get('/api/admin/plugins/amazons3', params.middleware.applyCSRF, render);
            params.router.post('/api/admin/plugins/amazons3/save', params.middleware.applyCSRF, save);
            log('info', 'Settings loaded');

            callback();
        },
        uploadImage: function (data, callback) {
            log('info', 'Starting upload image...');

            if (validate()) {
                return callback(new Error('AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY or AMAZONS3_BUCKET'));
            }

            var image = data.image;

            if (!image) {
                return callback(new Error('invalid image'));
            }

            var type = image.url ? 'url' : 'file';

            if (type === 'file' && !image.path) {
                return callback(new Error('invalid image path'));
            }

            var imageData = type === 'file' ? fs.createReadStream(image.path) : image.url;

            var uploadType;
            winston.info(data);
            if (type === 'file' && typeof data.image.fieldName != 'undefined') {
                uploadType = data.image.fieldName.replace("[]", "");
            }
            if (data.image.name === 'profileCover'){
                uploadType = 'profileCover'
                data.image.originalFilename = 'coverImage.png'
            }

            uploadToAmazon(data.uid + "/" + uploadType, image, callback);
        },
        uploadFile: function (data, callback) {
            log('info', 'Starting upload file...');

            if (validate()) {
                return callback(new Error('AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY or AMAZONS3_BUCKET'));
            }

            var file = data.file;

            if (!file) {
                return callback(new Error('invalid file'));
            }

            if (!file.path) {
                return callback(new Error('invalid file path'));
            }

            uploadToAmazon(data.uid + "/files", file, callback);
        },
        delete: function (pid) {
            posts.getPostField(pid, 'content', function (err, content) {
                if (!err) {
                    var url = util.format("//%s.%s/%s",
                        constants.config.env.bucket || constants.config.db.bucket,
                        constants.config.env.host || constants.config.db.host ? constants.config.env.host || constants.config.db.host : "s3.amazonaws.com",
                        constants.config.env.path || constants.config.db.path ? constants.config.env.path || constants.config.db.path + "/" : ""
                    );

                    var regex = new RegExp(url.replace(/\./g, "\\.") + '([\\w-]||/)+\\.[\\w]+', 'g');
                    var path = content.match(regex);
                    
                    if (path) {
                        var files = path.map(function (a) { return { "Key": a.replace(url, "") }; });
    
                        s3bucket.deleteObjects({
                            Bucket: constants.config.env.bucket || constants.config.db.bucket,
                            Delete: {
                                Objects: files
                            }
                        }, function (err, data) {
                            if (err) {
                                log('error', err);
                            }
    
                            log('info', data);
                        });
                    }
                }
            });
        },
        // Section ADMIN
        admin: {
            menu: function (custom_header, callback) {
                custom_header.plugins.push({
                    "route": '/plugins/amazons3',
                    "icon": constants.admin.icon,
                    "name": constants.name
                });

                callback(null, custom_header);
            }
        }
    };
})(module);
