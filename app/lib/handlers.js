/*
*
* Request Handlers
*
*
*/

// Dependencies
var _data = require('./data');



// Define the handlers
var handlers = {};

// Users
handlers.users = function(data, callback){
    var acceptableMethods = ['POST', 'GET', 'PUT', 'DELETE'];
    if (acceptableMethods.indexOf(data.method) > -1){
        handlers._users[data.method](data, callback);
    } else {
        callback(405);
    }
};

// Container for the user submethods
handlers._users = {};

// Users - POST
// Required Data: firstName, lastName, phone, password, tosAgreement
// Optional Data: none
handlers._users.post = function(data, callback) {
    // Check that all required fields are filled out
    var firstName = typeof(data.payload.firstName) =='string' && data.payload.firstName.trim().length> 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof(data.payload.lastName) =='string' && data.payload.lastName.trim().length> 0 ? data.payload.lastName.trim() : false;
    var phone = typeof(data.payload.phone) =='string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    var password = typeof(data.payload.password) =='string' && data.payload.password.trim().length> 0 ? data.payload.password.trim() : false;
    var tosAgreement = typeof(data.payload.tosAgreement) =='boolean' && data.payload.tosAgreement == true ? true : false;

    if (firstName && lastName && phone && password && tosAgreement) {
        // Make sure that the user doesn't already exist
        _data.read('users', phone, function(err, data){
            if (err) {

            } else {
                // User already exist
                callback(400, {'Error' : 'A user with that phone number already exists'});
            }
        })
    } else {
        callback(400, {'Error' : 'Missing required fields'});
    }

}

// Users - GET
handlers._users.get = function(data, callback) {
    
}

// Users - PUT
handlers._users.put = function(data, callback) {
    
}

// Users - DELETE
handlers._users.delete = function(data, callback) {
    
}

// ping handler
handlers.ping = function(data, callback) {
    callback(200);
}

// // sample handler
// handlers.sample = function(data, callback){
//     //callback HTTP status code and a payload object
//     callback(406,{'name' : 'sample handler'});
// };

// not found handler
handlers.notFound = function(data, callback){
    callback(404);
};

// Export the handlers
module.exports = handlers;

