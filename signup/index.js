var axios = require('axios');

module.exports = function(context, req) {
    context.log('Node.js HTTP trigger function processed a request. RequestUri=%s', req.originalUrl);

    if (req.body && req.body.email) {

        var API_KEY = process.env.SG_APIKEY;

        var subscribe = axios({
            method: 'post',
            url: 'https://api.sendgrid.com/v3/contactdb/recipients',
            data: [{"email":req.body.email}],
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
                        return {"email": req.body.email,"recipientId": recipients[0]};
                    } else {
                        throw response.data.errors[0].message;
                    }
                })
                .catch(function (error) {
                    context.res = {
                        status: 400,
                        body: "Add to List Error: " + error
                    };
                    return error;
                });
                return addToList;
            } else{
                throw response.data.errors[0].message;
            }
            
        })
        .then(function (response) {
            context.res = {
                body: "Success: Added " + response.email + ' to General List \n'
            };
            return response.status;
        })
        .catch(function (error) {
            context.res = {
                status: 400,
                body: "Add Contact Error: " + error
            };
            return error.status;
        });
        return subscribe;
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass an email address in the request body" + context.res
        };
        return;
    }
    context.done();
    return;
};

