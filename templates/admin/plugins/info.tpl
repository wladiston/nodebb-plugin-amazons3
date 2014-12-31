<h1><img title="aws-icons_15_amazon-s3" alt="aws-icons_15_amazon-s3" src="//d0.awsstatic.com/logos/Services/aws-icons_15_amazon-s3.png"> AmazonS3</h1>
<hr />

<div class="row">
  <div class="col-sm-7">
      <div class="panel panel-default">
          <div class="panel-heading">Your configuration</div>
          <div class="panel-body">
            <form class="form-horizontal" role="form">
                <div class="form-group">
                  <label class="control-label col-sm-5" for="email">AWS_ACCESS_KEY_ID:</label>
                  <div class="col-sm-7">
                    <p class="form-control-static">{accessKeyId}</p>
                  </div>
                </div>
                <div class="form-group">
                  <label class="control-label col-sm-5" for="email">AWS_SECRET_ACCESS_KEY:</label>
                  <div class="col-sm-7">
                    <p class="form-control-static">{secretAccessKey}</p>
                  </div>
                </div>
                <div class="form-group">
                  <label class="control-label col-sm-5" for="email">AMAZONS3_BUCKET:</label>
                  <div class="col-sm-7">
                    <p class="form-control-static">{bucket}</p>
                  </div>
                </div>
                <div class="form-group">
                  <label class="control-label col-sm-5" for="email">AMAZONS3_HOST:</label>
                  <div class="col-sm-7">
                    <p class="form-control-static">{host}</p>
                  </div>
                </div>
                <div class="form-group">
                  <label class="control-label col-sm-5" for="email">AMAZONS3_PATH:</label>
                  <div class="col-sm-7">
                    <p class="form-control-static">{path}</p>
                  </div>
                </div>
              </form>
          </div>
      </div>
  </div>
  <div class="col-sm-5">
        <div class="panel panel-default">
            <div class="panel-heading">Help</div>
            <div class="panel-body">
                <p>You can configure this plugin via <em>environment variables</em>.</p>

                <p>
                Asset host and asset path are optional. If you leave these blank your URL must be:<br/>
                <code>//mybucket.s3.amazonaws.com/123456.jpg</code><br/></p>

                <p>
                Or else it will be:<br/>
                <code>//mybucket.myhost.com.se/mypath/123456.jpg</code><br/></p>

              <pre>export AWS_ACCESS_KEY_ID="your_access_key_id"
export AWS_SECRET_ACCESS_KEY="your_secret_key"
export AMAZONS3_BUCKET="your_bucket"
export AMAZONS3_HOST="your_host"
export AMAZONS3_PATH="your_website_path"</pre>
            </div>
        </div>
    </div>
</div>
