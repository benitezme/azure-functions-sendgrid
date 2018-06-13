var axios = require('axios');

module.exports = function(context, req) {
    context.log('Node.js HTTP trigger function processed a request. RequestUri=%s', req.originalUrl);

    if (req.body && req.body.email) {

        var API_KEY = process.env.SG_APIKEY;

        axios.post({
            method: 'post',
            url: 'https://api.sendgrid.com/v3/contactdb/recipients',
            data: {
                email: req.body.email
            },
            headers:{
                'content-type': 'application/json',
                'authorization': 'Bearer' + API_KEY
            }
        })
        .then(function (response) {
            response.persisted_recipients.toString();
            context.res = {
                // status defaults to 200 */
                body: "Success: Added " + req.body.email + response.persisted_recipients
            };

            return context.res;
        })
        .catch(function (error) {
            error.errors.toString();
            context.res = {
                status: 400,
                body: "Error: " + error.errors
            };
            return context.res;
        });
        return context.res;
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass an email address in the request body" + context.res
        };
    }
    context.done();
};

