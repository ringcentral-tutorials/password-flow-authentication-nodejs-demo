const rc_auth = require('./rc_authenticate.js')

function read_account_extensions(){
    var auth = new rc_auth.RC_Authentication()
    auth.get_platform(function(err, platform){
        if (err){
            console.log(err)
        }else{
            var endpoint = "/restapi/v1.0/account/~/extension";
            platform.get(endpoint, {})
            .then(function(resp){
                var jsonObj = resp.json()
                console.log(jsonObj)
            })
            .catch(function(e){
                console.log(e)
            })
        }
    })
}

read_account_extensions()
