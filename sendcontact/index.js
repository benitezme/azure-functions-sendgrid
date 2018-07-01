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

        var toEmail = 'feedback@advancedalgos.net';

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
                    context.log('presend SendGrid');
                    return axios({
                        method: 'post',
                        url: 'https://api.sendgrid.com/v3/mail/send',
                        data: data,
                        headers:{
                            'content-type': 'application/json',
                            'authorization': 'Bearer ' + API_KEY
                        }
                    })
                    .then(function (response) {
                        context.log('sendgrid response: ', response)
                        if (response.status >= 200 && response.status < 300) {
                            context.res = {
                                status: response.status,
                                body: "Contact email sent",
                                headers
                            };
                        } else {
                            throw response.data.errors[0].message;
                        }
                        return context.res;
                    })
                    .catch(function (error) {
                        context.log('sendgrid Error: ', error);
                        context.res = {
                            status: 400,
                            body: "Contact email send error: " + error.response.data.errors[0].message,
                            headers
                        };
                        throw error.status;
                    });
              }else{
                  context.log('error recaptcha: ', response.data);
                  context.res ={
                      status: 400,
                      response: response.data
                  };
                  throw context.res;
              }
          })
          .then(function(response){
              context.log('context done: ', response);
              return context.done();
          })
          .catch(function (error) {
              context.log('function error: ', error, JSON.stringify(error.Error));
              context.res = {
                  status: 400,
                  body: "contact error: " + JSON.stringify(error.response),
                  headers
              };
              context.log('context error: ', checkCaptcha, context.res);
              return context.res;
          });
      }
      return;
};
