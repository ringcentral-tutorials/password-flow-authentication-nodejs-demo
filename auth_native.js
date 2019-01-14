var querystring = require('querystring');
var https = require('https');
var fs = require('fs')

require('dotenv').load();
if (process.env.ENVIRONMENT == "sandbox") {
  require('dotenv').config({path: "./environment/.env-sandbox"});
  var tokens_file = "tokens_sb.txt"
} else {
  require('dotenv').config({path: "./environment/.env-production"});
  var tokens_file = "tokens_pd.txt"
}

function Authentication() {}

Authentication.prototype.get_token = function(callback) {
    var endpoint = "/restapi/oauth/token";
    var url = process.env.RC_SERVER_URL.replace("https://", "")
    var post_data = querystring.stringify({
          'grant_type' : 'password',
          'username' : encodeURIComponent(process.env.RC_USERNAME),
          'password' : process.env.RC_PASSWORD
    });

    if (fs.existsSync(tokens_file)) {
      var saved_tokens = fs.readFileSync(tokens_file, 'utf8');
      var tokensObj = JSON.parse(saved_tokens)
      var date = new Date()
      var timestamp = date.getTime()  / 1000
      timestamp -= tokensObj.timestamp
      if (tokensObj.tokens.expires_in > timestamp){
        console.log("access token is still valid")
        return callback(null, tokensObj.tokens.access_token)
      }else{
        if (tokensObj.tokens.refresh_token_expires_in > timestamp){
          console.log("refresh_token not expired")
          post_data = querystring.stringify({
              'grant_type' : 'refresh_token',
              'refresh_token' : tokensObj.tokens.refresh_token
          });
        }
      }
    }
    var basic = process.env.RC_CLIENT_ID + ":" + process.env.RC_CLIENT_SECRET;
    var encoded = Buffer.from(basic).toString('base64')
    var headers = {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept': 'application/json',
        'Authorization': 'Basic ' + encoded
      };
    var options = {
        host: url,
        path: endpoint,
        method: 'POST',
        headers: headers
        };

    var post_req = https.request(options, function(res) {
        res.setEncoding('utf8');
        var response = ""
        res.on('data', function (chunk) {
            response += chunk
        });
        res.on("end", function(){
          var jsonObj = JSON.parse(response)
          var timestamp = new Date().getTime()
          var tokens = {
            'tokens' : jsonObj,
            'timestamp' : timestamp / 1000
          }
          fs.writeFile(tokens_file, JSON.stringify(tokens), function(err) {
              if(err)
                console.log(err);
                return callback(err, null)
              })
              return callback(null, jsonObj.access_token)
        });
    });

    post_req.on('error', function (e) {
        return callback(e, null)
    });

    post_req.on('timeout', function () {
        post_req.abort();
        return callback("timeout", null)
    });

    post_req.write(post_data);
    post_req.end();
}

exports.Authentication=Authentication
