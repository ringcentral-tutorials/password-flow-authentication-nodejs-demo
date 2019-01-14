const authentication = require('./auth_native')
var https = require('https');

function read_account_extensions(access_token){
    var endpoint = "/restapi/v1.0/account/~/extension";
    var url = process.env.RC_SERVER_URL.replace("https://", "")
    var headers = {
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + access_token
          }

    var options = {
        host: url,
        path: endpoint,
        method: 'GET',
        headers: headers
        };

    var get_req = https.request(options, function(res) {
          res.setEncoding('utf8');
          var response = ""
          res.on('data', function (chunk) {
            response += chunk
          });
          res.on("end", function(){
            var jsonObj = JSON.parse(response)
            console.log(jsonObj)
          });
      });
    get_req.end();
}

var auth = new authentication.Authentication()
auth.get_token(function(err, access_token){
  if (err)
    console.log(err)
  else {
    read_account_extensions(access_token)
  }
})
