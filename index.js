(function(module) {
    "use strict";

    var constants = Object.freeze({
        'name': "AmazonS3",
        'admin': {
            'route': '/plugins/amazons3',
            'icon': 'fa-picture-o'
        },
        config: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
            bucket: process.env.AMAZONS3_BUCKET || "",
            host: process.env.AMAZONS3_HOST || "",
            path: process.env.AMAZONS3_PATH || ""
        }
    });

    var Package = require("./package.json"),
        AWS = require('aws-sdk'),
        mime = require("mime"),
        uuid = require("uuid").v4,
        fs = require('fs'),
        path = require('path'),
        util = require('util'),
        posts = module.parent.require('./posts'),
        winston = module.parent.require('winston'),
        s3bucket = new AWS.S3({ params: { Bucket: constants.config.bucket || "" } }),
        app;


    var AmazonS3 = {};

    AmazonS3.load = function(params, callback) {
        function render(req, res, next) {
            res.render('admin/plugins/info', constants.config);
        }

        params.router.get('/admin' + constants.admin.route, params.middleware.admin.buildHeader, render);
        params.router.get('/api/admin' + constants.admin.route, render);
        winston.info('[plugins/' + Package.name + '] Settings loaded');

        callback();
    };

    AmazonS3.uploadImage = function (data, callback) {
        winston.log('info', '[plugins/%s] %s', Package.name, 'starting upload image...');

        if (!constants.config.bucket || !constants.config.accessKeyId || !constants.config.secretAccessKey) {
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

        uploadToAmazon(image, callback);
    };

    AmazonS3.uploadFile = function (data, callback) {
        winston.log('info', '[plugins/%s] %s', Package.name, 'starting upload file...');

        if (!constants.config.bucket || !constants.config.accessKeyId || !constants.config.secretAccessKey) {
            return callback(new Error('AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY or AMAZONS3_BUCKET'));
        }

        var file = data.file;

        if (!file) {
            return callback(new Error('invalid file'));
        }

        if (!file.path) {
            return callback(new Error('invalid file path'));
        }

        uploadToAmazon(file, callback);
    };

    function uploadToAmazon(file, callback) {
        var buffer = fs.createReadStream(file.path);
        var params = {
            ACL: "public-read",
            Key: uuid() + "/" + file.originalFilename,
            Body: buffer,
            ContentLength: buffer.length,
            ContentType: mime.lookup(file.name),
            StorageClass: 'REDUCED_REDUNDANCY'
        };

        s3bucket.putObject(params, function (err) {
            if (err) {
                return callback(err);
            }

            // Use protocol-less urls so that both HTTP and HTTPS work:
            var url = util.format("//%s.%s/%s%s",
                constants.config.bucket,
                constants.config.host ? constants.config.host : "s3.amazonaws.com",
                constants.config.path ? constants.config.path + "/" : "",
                params.Key
            );

            callback(null, {
                name: file.name,
                url: url
            });
        });
    }

    AmazonS3.delete = function(pid){
        posts.getPostField(pid, 'content', function(err, content) {
            if (!err) {
                var url = util.format("//%s.%s/%s",
                    constants.config.bucket,
                    constants.config.host ? constants.config.host : "s3.amazonaws.com",
                    constants.config.path ? constants.config.path + "/" : ""
                );

                var regex = new RegExp(url.replace(/\./g, "\\.") + '([\\w-]||/)+\\.[\\w]+', 'g');
                var path = content.match(regex);
                var files = path.map(function(a){ return { "Key": a.replace(url, "") }; });

                s3bucket.deleteObjects({
                    Delete: {
                        Objects: files
                    }
                }, function(err, data) {
                    if (err){
                        winston.error('[plugins/%s] %s', Package.name, err);
                    }

                    winston.info('[plugins/%s] %s', Package.name, data);
                })
            }
        });
    };

    // Section ADMIN
    AmazonS3.admin = {
        menu: function(custom_header, callback) {
            custom_header.plugins.push({
                "route": constants.admin.route,
                "icon": constants.admin.icon,
                "name": constants.name
            });

            callback(null, custom_header);
        }
    };

    module.exports = AmazonS3;
}(module));
