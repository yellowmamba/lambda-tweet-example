exports.handler = function (event, context) {
    var AWS = require('aws-sdk');
    var s3Client = new AWS.S3();
    var s3Event = event.Records[0].s3;
    var params = {
        Bucket: s3Event.bucket.name,
        Key: s3Event.object.key
    };

    var html, cheerio = require('cheerio');
    var $, title;

    s3Client.getObject(params, function (err, data) {
        if (err) {
            console.log(err, err.stack);
        } else {
            html = data.Body.toString();
            $ = cheerio.load(html);
            title = $('title').text();
            
            // if your site uses a custom domain, e.g. example.com, you can ignore the "s3.amazonaws.com" part
            // as your bucket name would need to be the domain name itself.
            var link = 'https://s3.amazonaws.com/' + s3Event.bucket.name + '/' + s3Event.object.key;
            
            var Twitter = require('twitter');

            // First create a Twitter app, then filling the following keys and secrets
            var client = new Twitter({
              consumer_key: '<consumer_key>',
              consumer_secret: '<consumer_secret>',
              access_token_key: '<access_token_key>',
              access_token_secret: '<access_token_secret>'
            });

            client.post('statuses/update', {status: 'New post: ' + title + ' ' + link}, function(error, tweet, response){
                if (!error) {
                    console.log(tweet);
                } else {
                    console.log(error);
                }
                context.done(null, 'lambda completed');
            });
        }
    }); 
}
