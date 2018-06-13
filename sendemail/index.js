var axios = require('axios');

module.exports = function(context, req) {
    context.log('Node.js HTTP trigger function processed a request. RequestUri=%s', req.originalUrl);

    if (req.body && req.body.email) {

        var API_KEY = process.env.SG_APIKEY;

        var data = JSON.stringify({
            "personalizations": [
              {
                "to": [
                  {
                    "email": req.body.email
                  }
                ],
                "subject": "VERIFY YOU INTEREST in Advanced Algos",
                "substitutions": {
                  "-aaverifylink-": "https://aacorporatesitedevelop.azurewebsites.net/"
                }
              }
            ],
            "from": {
              "email": "feedback@advanvedalgso.net",
              "name": "Advanced Algos Team"
            },
            "reply_to": {
              "email": "feedback@advanvedalgso.net",
              "name": "Advanced Algos Team"
            },
            "template_id": "46e31787-38e1-420e-9170-beaf34035670"
          });

        var sendEmail = axios({
            method: 'post',
            url: 'https://api.sendgrid.com/v3/mail/send',
            data: data,
            headers:{
                'content-type': 'application/json',
                'authorization': 'Bearer ' + API_KEY
            }
        })
        .then(function (response) {
            context.res = {
                body: "Success: Added " + response.email + ' to General List \n'
            };
            return;
        })
        .catch(function (error) {
            context.res = {
                status: 400,
                body: "Add Contact Error: " + error
            };
            return error;
        });
        return subscribe;
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass an email address in the request body" + context.res
        };
    }
    JSON.parse(JSON.stringify(context.res));
    context.done();
};

