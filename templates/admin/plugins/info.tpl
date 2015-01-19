<h1>
    <img title="aws-icons_15_amazon-s3" alt="aws-icons_15_amazon-s3" src="//d0.awsstatic.com/logos/Services/aws-icons_15_amazon-s3.png">
    AmazonS3</h1>
<hr />
 
<div class="row">
    <div class="col-sm-7">
        <div class="panel panel-default">
            <div class="panel-heading">Your environment variables</div>
            <div class="panel-body">
                <form class="form-horizontal" role="form">
                    <div class="form-group">
                        <label class="control-label col-sm-5">AWS_ACCESS_KEY_ID:</label>
                        <div class="col-sm-7">
                            <p class="form-control-static">{env.accessKeyId}</p>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="control-label col-sm-5">AWS_SECRET_ACCESS_KEY:</label>
                        <div class="col-sm-7">
                            <p class="form-control-static">{env.secretAccessKey}</p>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="control-label col-sm-5">AMAZONS3_BUCKET:</label>
                        <div class="col-sm-7">
                            <p class="form-control-static">{env.bucket}</p>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="control-label col-sm-5">AMAZONS3_HOST:</label>
                        <div class="col-sm-7">
                            <p class="form-control-static">{env.host}</p>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="control-label col-sm-5">AMAZONS3_PATH:</label>
                        <div class="col-sm-7">
                            <p class="form-control-static">{env.path}</p>
                        </div>
                    </div>
                </form>
                <p>&nbsp;</p>
            </div>
        </div>
    </div>
    <div class="col-sm-5">
        <div class="panel panel-default">
            <div class="panel-heading">Help</div>
            <div class="panel-body">
                <p>You can configure this plugin via <em>environment variables</em>.</p>
 
                <p>
                    Asset host and asset path are optional. If you leave these blank your URL must be:<br />
                    <code>//mybucket.s3.amazonaws.com/123456.jpg</code><br />
                </p>
 
                <p>
                    Or else it will be:<br />
                    <code>//mybucket.myhost.com.se/mypath/123456.jpg</code><br />
                </p>
 
                <pre>export AWS_ACCESS_KEY_ID="your_access_key_id"
export AWS_SECRET_ACCESS_KEY="your_secret_key"
export AMAZONS3_BUCKET="your_bucket"
export AMAZONS3_HOST="your_host"
export AMAZONS3_PATH="your_website_path"</pre>
            </div>
        </div>
    </div>
</div>


<div class="row">
    <div class="col-sm-12">
        <div class="panel-group" id="accordion" role="tablist" aria-multiselectable="true">
            <div class="panel" style="max-width:none">
                <div class="panel-heading" role="tab" id="headingDB">
                    <h4 class="panel-title">
                        <a class="collapsed" data-toggle="collapse" data-parent="#accordion" href="#DBSetting" aria-expanded="false" aria-controls="DBSetting">Database settings
                        </a>
                    </h4>
                </div>
                <div id="DBSetting" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingDB">
                    <div class="panel-body">
                        <p>This option to configure the plugin is for who uses the NodeBB SaaS service. We don't recommend to use this option if you are not using the NodeBB SaaS because you shouldn't be able to keep a different bucket for your development environment.</p>
                        <form id="amazons3-db-settings" class="form-horizontal" role="form">
                            <div class="form-group">
                                <label class="control-label col-sm-3">ACCESS_KEY_ID:</label>
                                <div class="col-sm-9">
                                    <input type="text" class="form-control" id="accessKeyId" name="accessKeyId" placeholder="accessKeyId" value="{db.accessKeyId}" />
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="control-label col-sm-3">SECRET_ACCESS_KEY:</label>
                                <div class="col-sm-9">
                                    <input type="text" class="form-control" id="secretAccessKey" name="secretAccessKey" placeholder="secretAccessKey" value="{db.secretAccessKey}" />
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="control-label col-sm-3">BUCKET:</label>
                                <div class="col-sm-9">
                                    <input type="text" class="form-control" id="bucket" name="bucket" placeholder="bucket" value="{db.bucket}" />
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="control-label col-sm-3">HOST:</label>
                                <div class="col-sm-9">
                                    <input type="text" class="form-control" id="host" name="host" placeholder="host" value="{db.host}" />
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="control-label col-sm-3">PATH:</label>
                                <div class="col-sm-9">
                                    <input type="text" class="form-control" id="path" name="path" placeholder="path" value="{db.path}" />
                                </div>
                            </div>
                            <div class="form-group">
                                <div class="col-sm-offset-3 col-sm-9">
                                    <button type="submit" class="btn btn-default">Save</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<input id="csrf_token" type="hidden" value="{csrf}" />
 
<script>
    $("#amazons3-db-settings").on("submit", function (e) {
        e.preventDefault();
 
        var data = {
            _csrf: $('#csrf_token').val()
        };
        var x = $(this).serializeArray();

        for(var i = 0; i < x.length; i++)
        {
            data[x[i].name] = x[i].value;
        }

        $.post('/api/admin/plugins/amazons3/save', data)
            .done(function (response) {
                if (response.error) {
                    app.alertError(response.message);
                } else {
                    app.alertSuccess(response.message);
                }
            });
    });
</script>