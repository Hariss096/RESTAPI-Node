/*
 * Server-related tasks
 */

 // Dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');
var handlers = require('./handlers');
var helpers = require('./helpers');
var path = require('path');
var util = require('util');
var debug = util.debuglog('server');

// Instantiating the server module object
var server = {};

// Instantiating the HTTP Server
server.httpServer = http.createServer(function(req, res){
    server.unifiedServer(req, res);
    
});


// Instantiating the HTTPS Server
server.httpsServerOptions = {
    'key' : fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
    'cert': fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
};
server.httpsServer = https.createServer(server.httpsServerOptions, function(req, res){
    server.unifiedServer(req, res);
});




// All the server logic for both the http and https
server.unifiedServer = function(req, res){

    // create an object that contains meta data of the requested url
    var parsedUrl = url.parse(req.url, true);

    // retrieving just the path e.g., if the url is www.google.com/blah/bloo/blee/?query=string the path will be blah/bloo/blee
    var path = parsedUrl.pathname;
    // console.log(   `parsedUrl : ${parsedUrl} but the original url was this : ${req.url} and the path is this : ${path}`);

    // trimming extra slashes from path
    var trimmedPath = path.replace(/^\/+|\/*$/g, '');

    // parsing query string from the request if there is any 
    var queryStringObject = parsedUrl.query;
    
    // getting HTTP method from the request and converting it to uppercase for consistency
    var method = req.method.toUpperCase();
    
    // setting headers
    var headers = req.headers;

    // get the payloads , if any
    var decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data', function(data){
        buffer += decoder.write(data);
        //console.log(data);
    });
    req.on('end',function(){
        buffer += decoder.end();

        // choose the handler the request should go to, if the request is not found, go to not found handler
        var chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

        // construct a data object to send to the object
        var data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject' : queryStringObject,
            'method' : method,
            'headers' : headers,
            'payload' : helpers.parseJsonToObject(buffer)
        };

        // route the request to the handler specified in the router
        chosenHandler(data, function(statusCode, payload){
            // use the status code called back by the handler, or default to 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            // use the payload called back by the handler, or default to an empty object
            payload = typeof(payload) == 'object' ? payload : {};

            // convert the payload to a string
            var payloadString = JSON.stringify(payload);

            // return the response
            res.setHeader('Content-Type', 'application/json');  // converting response to json
            res.writeHead(statusCode); // return status code
            res.end(payloadString); // return payload string
        
            // If the response is 200, print green otherwise print red
            if(statusCode == 200){
                debug('\x1b[32m%s\x1b[0m', method.toUpperCase() + ' /'+trimmedPath+' '+statusCode);
            } else {
                debug('\x1b[31m%s\x1b[0m', method.toUpperCase() + ' /'+trimmedPath+' '+statusCode);
            }

        });
        
    });
};

// Defining a request router

server.router = {
    'ping': handlers.ping,
    'users': handlers.users,
    'tokens': handlers.tokens,
    'checks': handlers.checks
}

// Init script
server.init = function(){
    // Start the HTTP server
    server.httpServer.listen(config.httpPort, function(){
        console.log('\x1b[36m%s\x1b[0m', `server is listening at port ${config.httpPort} in ${config.envName} now `);

    });

    // Start the HTTPS server
    server.httpsServer.listen(config.httpsPort, function(){
        console.log('\x1b[35m%s\x1b[0m', `server is listening at port ${config.httpsPort} in ${config.envName} now `);
    });

}

// Export the module
module.exports = server;