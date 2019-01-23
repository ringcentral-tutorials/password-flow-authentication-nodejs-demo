var RC = require('ringcentral')
var fs = require('fs')

require('dotenv').load();
var tokens_file = "tokens_"
if (process.env.ENVIRONMENT == "sandbox") {
  require('dotenv').config({path: "./environment/.env-sandbox"});
  tokens_file += "sb.txt"
} else {
  require('dotenv').config({path: "./environment/.env-production"});
  tokens_file += "pd.txt"
}

function RC_Authentication() {}
exports.RC_Authentication = RC_Authentication

RC_Authentication.prototype = {
    get_sdk: function() {
        var rcsdk = new RC({
          server:process.env.RC_SERVER_URL,
          appKey: process.env.RC_CLIENT_ID,
          appSecret:process.env.RC_CLIENT_SECRET
        })
        return rcsdk
    },
    get_platform: function(callback){
        var rcsdk = this.get_sdk()
        var platform = rcsdk.platform()
        if (fs.existsSync(tokens_file)) {
          var saved_tokens = fs.readFileSync(tokens_file, 'utf8');
          var tokensObj = JSON.parse(saved_tokens)
          platform.auth().setData(tokensObj)
          if (platform.loggedIn()){
            console.log("already logged in")
            return callback(null, platform)
          }
        }
        console.log("login/relogin")
        platform.login({
          username:process.env.RC_USERNAME,
          password:process.env.RC_PASSWORD
        })
        .then(function(resp){
          fs.writeFile(tokens_file, JSON.stringify(platform.auth().data()), function(err) {
              if(err)
                console.log(err);
            })
          return callback(null, platform)
        })
        .catch(function(e){
          return callback(e, null)
        })
    }
}
