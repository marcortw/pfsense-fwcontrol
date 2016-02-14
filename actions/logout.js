var async = require('async');
var request = require('request');
var scrape = require('../lib/scrapers');

var logout = function (session, useropts, callback) {

    // logout doesn't need a csrf token
    var logoutAction = {
        url: useropts.baseUrl + 'index.php',
        qs: {logout: ''}, //Query string data
        method: 'GET'
    };


    session(logoutAction, function (error, response, html) {
        if (error) {
            callback(error);
        } else {
            callback(null);
        }
    });
};

module.exports = {
    logout: logout
};
