NodeBB Plugin AmazonS3
======================

[![Dependency Status](https://david-dm.org/wladiston/nodebb-plugin-amazons3.png)](https://david-dm.org/wladiston/nodebb-plugin-amazons3)

| Dependency     | Version Requirement     |
| -------------- |:-----------------------:|
| NodeBB         | >= 0.6.0 |

A plugin for NodeBB to store files on Amazon Webservice S3.

Configuration
-------------

You can configure this plugin via *environment variables*

Asset host and asset path are optional. If you leave these blank your URL must be: **//mybucket.s3.amazonaws.com/123456.jpg**

Or else it will be: **//mybucket.myhost.com.se/mypath/123456.jpg**

Just use this commands to configure your plugin:

    export AWS_ACCESS_KEY_ID="your_access_key_id"
    export AWS_SECRET_ACCESS_KEY="your_secret_key"
    export AMAZONS3_BUCKET="your_bucket"
    export AMAZONS3_HOST="your_host"
    export AMAZONS3_PATH="your_website_path"

*** There is a bug in the Node v10.34 about certification [#8894](https://github.com/joyent/node/issues/8894)**