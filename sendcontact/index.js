var jwt = require('jsonwebtoken');
var axios = require('axios');

module.exports = function(context, req) {
    context.log('Node.js HTTP trigger function processed a request. RequestUri=%s', req.originalUrl);

    context.log(req);
    var name = '';
    var email = '';
    var message = '';
    var recaptcha = '';
    var dev = false;

    if(req.method === 'GET'){
      name = decodeURI(req.params.name);
      email = decodeURI(req.params.email);
      message = decodeURI(req.params.message);
      recaptcha = decodeURI(req.params.recaptcha);
      dev = req.params.dev;
      var dePeriod = message.replace(/\[PERIOD\]/g, '.');
      message = dePeriod.replace(/\[FORWARDSLASH\]/g, '/');
    }
    if(req.method === 'POST'){
      name = req.body.name;
      email = req.body.email;
      message = req.body.message;
      recaptcha = req.body.recaptcha;
      dev = req.body.dev;
      var dePeriod = message.replace(/[PERIOD]/g, '.');
      message = dePeriod.replace(/[FORWARDSLASH]/g, '/');
    }
    context.log('params: ',name, email, message, recaptcha, dev)
    if (email != '') {

        var API_KEY = process.env.SG_APIKEY2;
        var origin = 'https://advancedalgos.net';
        if (dev){
          origin = 'http://localhost:4000';
        }
        var headers = {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin' : origin,
          'Access-Control-Allow-Credentials': 'true'
        };

        var toEmail = (!dev) ? 'feedback@advancedalgos.net' : 'bearcanrun@gmail.com';

        var data = JSON.stringify({
            "personalizations": [
              {
                "to": [
                  {
                    "email": toEmail,
                    "name": "Advanced Algos Team"
                  }
                ],
                "subject": "AA Corporate Site Contact - Message from " + name,
                "substitutions": {
                  "-aacontactname-": name,
                  "-aacontactemail-": email,
                  "-aacontactbody-": message
                }
              }
            ],
            "from": {
              "email": email,
              "name": name
            },
            "reply_to": {
              "email": email,
              "name": name
            },
            "template_id": process.env.SG_EMAILID2
          });

          var checkCaptcha = axios({
              method: 'post',
              url: 'https://www.google.com/recaptcha/api/siteverify',
              params: {
                secret: process.env.RECAPTCHA,
                response: recaptcha
              }
          })
          .then(function (response) {
                context.log('recaptcha response: ', response.data, response.data.success);
                if (response.status >= 200 && response.status < 300 && response.data.success) {
                    var sendVerify = axios({
                    method: 'post',
                    url: 'https://api.sendgrid.com/v3/mail/send',
                    data: data,
                    headers:{
                        'content-type': 'application/json',
                        'authorization': 'Bearer 1' + API_KEY
                    }
                })
                .then(function (response) {
                    context.log('sendgrid response: ', response)
                    if (response.status >= 200 && response.status < 300 && response.data.success) {
                        context.res = {
                            status: response.status,
                            body: "Contact email sent \n",
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
                        body: "Contact email send error: " + error.response.data.errors[0].message,
                        headers
                    };
                    return error.status;
                });
                return sendVerify;
              }else{
                  throw new Error({
                      status: 400,
                      response: response.message
                  });
              }
          })
          .catch(function (error) {
              context.res = {
                  status: 400,
                  body: "reCaptcha error: " + error.response.data.errors[0].message,
                  headers
              };
              context.done();
              return false;
          });
      }
    context.done();
};
