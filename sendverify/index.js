var jwt = require('jsonwebtoken');
var axios = require('axios');

module.exports = function(context, req) {
    context.log('Node.js HTTP trigger function processed a request. RequestUri=%s', req.originalUrl);

    context.log(req);
    var email = '';
    var dev = false;

    if(req.method === 'GET'){
      email = req.params.email;
      dev = req.params.dev;
    }
    if(req.method === 'POST'){
      email = req.body.email;
      dev = req.body.dev;
    }

    if (email != '') {

        var API_KEY = process.env.SG_APIKEY2;
        var token = jwt.sign({ email:email }, API_KEY, { expiresIn: '1d' });
        var origin = 'https://aacorporatesitedevelop.azurewebsites.net';
        var params = '/email-verification.shtml?token=';
        if (dev){
          origin = 'http://localhost:4000';
        }

        var headers = {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin' : origin,
          'Access-Control-Allow-Credentials': 'true'
        };

        var data = JSON.stringify({
            "personalizations": [
              {
                "to": [
                  {
                    "email": email
                  }
                ],
                "subject": "VERIFY YOUR INTEREST in Advanced Algos",
                "substitutions": {
                  "-aaverifylink-": origin + params + token
                }
              }
            ],
            "from": {
              "email": "feedback@advancedalgos.net",
              "name": "Advanced Algos Team"
            },
            "reply_to": {
              "email": "feedback@advancedalgos.net",
              "name": "Advanced Algos Team"
            },
            "template_id": "46e31787-38e1-420e-9170-beaf34035670"
          });

        var sendVerify = axios({
            method: 'post',
            url: 'https://api.sendgrid.com/v3/mail/send',
            data: data,
            headers:{
                'content-type': 'application/json',
                'authorization': 'Bearer ' + API_KEY
            }
        })
        .then(function (response) {
            if (response.status >= 200 && response.status < 300) {
                context.res = {
                    status: response.status,
                    body: "Email verification sent \n",
                    headers
                };
                return context;
            } else {
                throw response.data.errors[0].message;
            }
        })
        .catch(function (error) {
            context.res = {
                status: 400,
                body: "Verification email send error: " + error.response.data.errors[0].message,
                headers
            };
            return error.status;
        });
        return sendVerify;
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass an email address in the request body" + context.res,
            headers
        };
    }
    context.done();
};
