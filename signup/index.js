module.exports = function(context, req) {
    context.log('Node.js HTTP trigger function processed a request. RequestUri=%s', req.originalUrl);

    

    if (req.body && req.body.email) {
        var data = JSON.stringify([
        {
            "email": req.body.email
        }
        ]);
        var API_KEY = GetEnvironmentVariable("SG_APIKEY");

        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;
        
        xhr.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {
            console.log(this.responseText);
        }
        });
        
        xhr.open("POST", "https://api.sendgrid.com/v3/contactdb/recipients");
        xhr.setRequestHeader("authorization", "Bearer" + API_KEY);
        xhr.setRequestHeader("content-type", "application/json");
        
        xhr.send(data);

        context.res = {
            // status defaults to 200 */
            body: "Success: Added " + req.body.email
        };
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass an email address in the request body" + context.res
        };
    }
    context.done();
};

