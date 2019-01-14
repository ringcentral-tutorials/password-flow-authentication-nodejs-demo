const authentication = require('./auth_rcsdk')

function read_account_extensions(){
    var auth = new authentication.Authentication()
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
