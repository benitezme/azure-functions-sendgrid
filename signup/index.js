module.exports = function(context, req) {
    context.log('Node.js HTTP trigger function processed a request. RequestUri=%s', req.originalUrl);

    if (req.body && req.body.email) {
        context.res = {
            // status defaults to 200 */
            body: "Hello " + (req.body.email)
        };
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass an eamil on the query string or in the request body"
        };
    }
    context.done();
};
