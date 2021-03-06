var jwt = require('jsonwebtoken');
var axios = require('axios');

module.exports = function(context, req) {
    context.log('Node.js HTTP trigger function processed a request. RequestUri=%s', req.originalUrl);

    context.log(req);
    var token = '';
    var dev = false;

    if(req.method === 'GET'){
      token = req.params.token;
      dev = req.params.dev;
    }
    if(req.method === 'POST'){
      token = req.body.token;
      dev = req.body.dev;
    }

    if (token != '') {

        var API_KEY = process.env.SG_APIKEY;
        var API_KEY2 = process.env.SG_APIKEY2;
        var origin = 'https://advancedalgos.net';
        if (dev){
          origin = 'http://localhost:4000';
        }
        var headers = {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin' : origin,
          'Access-Control-Allow-Credentials': 'true'
        };

        var token;
        try {
            token = jwt.verify(token, API_KEY2, {maxAge: '1d'});
        } catch(err) {
            if (err.name === "TokenExpiredError"){
                context.res = {
                    status: 400,
                    body: "Error: Token Expired. Please resubmit email address.",
                    headers
                };
                context.done();
                return;
            } else {
                context.res = {
                    status: 400,
                    body: "Error: " + err.message,
                    headers
                };
                context.done();
                return;
            }
        }

        context.log(token.email);
        var email = token.email;

        var subscribe = axios({
            method: 'post',
            url: 'https://api.sendgrid.com/v3/contactdb/recipients',
            data: [{"email":email}],
            headers:{
                'content-type': 'application/json',
                'authorization': 'Bearer ' + API_KEY
            }
        })
        .then(function (response) {
            var recipients = response.data.persisted_recipients;

            if (recipients.length > 0 ){
                var addToList = axios({
                    method: 'post',
                    url: 'https://api.sendgrid.com/v3/contactdb/lists/4068018/recipients/' + recipients[0],
                    headers:{
                        'content-type': 'application/json',
                        'authorization': 'Bearer ' + API_KEY
                    }
                })
                .then(function (response) {
                    if (response.status >= 200 && response.status < 300) {
                      context.res = {
                          status: response.status,
                          body: {"email": email,"recipientId": recipients[0]},
                          headers
                      };
                      return context.res;
                    } else {
                        throw response.data.errors[0].message;
                    }
                })
                .catch(function (error) {
                    context.res = {
                        status: 400,
                        body: "Add to List Error: " + error,
                        headers
                    };
                    return error;
                });
                return addToList;
            } else{
                return response.data.errors[0].message;
            }

        })
        .then(function (response) {
            context.res = {
                status: response.status,
                body: "Success: Added " + response.body.email + ' to General List \n',
                headers
            };
            context.log("success: ", context)
            return context;
        })
        .catch(function (error) {
            context.res = {
                status: error.status,
                body: "Add Contact Error: " + error.response.data.errors[0].message,
                headers
            };
            return context;
        });
        return subscribe;
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass an email address in the request body" + context.res,
            headers
        };
        return context;
    }
    context.done();
    return;
};
