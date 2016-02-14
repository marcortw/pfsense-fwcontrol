var async = require('async');
var request = require('request');
var scrape = require('../lib/scrapers');

var login = function (useropts, callback) {
    var requestSettings = {jar: true, followAllRedirects: true};
    if (useropts.proxy) {
        requestSettings.proxy = useropts.proxy;
    }
    var session = request.defaults(requestSettings);
    var baseUrl = useropts.baseUrl;

    async.waterfall([
        // get the csrf token
        function (callback) {
            session(baseUrl, function (error, response, html) {
                if (error) {
                    callback(error);
                } else {
                    if (response.statusCode >= 400) {
                        callback('HTTP Error: ' + response.statusCode);
                    } else {
                        var options = scrape.getCsrfToken(html);
                        callback(null, options);
                    }
                }
            });
        },

        //login
        function (options, callback) {
            var loginRequest = {
                url: baseUrl + 'index.php',
                method: 'POST'
            };
            var bodyparams = {};
            bodyparams[options.csrftoken_key] = options.csrftoken_value;
            bodyparams['usernamefld'] = useropts.username;
            bodyparams['passwordfld'] = useropts.password;
            bodyparams['login'] = 'Login';
            loginRequest.form = bodyparams;

            //perform the actual login
            session(loginRequest, function (error, response, html) {
                if (error) {
                    callback(error);
                } else {
                    // return the session if it did work
                    // check in the html if the login was unsuccessful
                    var loginerror = scrape.getInputError(html);
                    if (loginerror) {
                        callback(loginerror)
                    } else {
                        callback(null, session);
                    }
                }
            });
        }
    ], function (err, session) {
        if (err) {
            if (callback) callback(err);
        } else {
            if (callback) callback(null, session);
        }
    });
};

module.exports = {
    login: login
};
