var async = require('async');
var scrape = require('../lib/scrapers');

//activate
var activate = function (session, useropts, callback) {
    async.waterfall([
        // get a token
        function (callback) {
            var tokenRequest = {
                url: useropts.baseUrl + 'firewall_rules.php',
                method: 'GET'
            };
            session(tokenRequest, function (error, response, html) {
                if (error) {
                    callback(error);
                } else {
                    if (response.statusCode >= 400) {
                        callback('HTTP Error: ' + response.statusCode);
                    } else {
                        var token = scrape.getCsrfToken(html);
                        callback(null, token);
                    }
                }
            })
        },

        // activate the rules
        function (token, callback) {
            var activateRulesRequest = {
                url: useropts.baseUrl + 'firewall_rules.php',
                method: 'POST'
            };
            var params = {};
            params[token.csrftoken_key] = token.csrftoken_value;
            params.apply = 'Apply changes';
            activateRulesRequest.form = params;

            session(activateRulesRequest, function (error, response, html) {
                if (error) {
                    callback(error);
                } else {
                    if (response.statusCode >= 400) {
                        callback('HTTP Error: ' + response.statusCode);
                    } else {
                        callback(null, {'rules': 'all', 'status': 'activated'});
                    }
                }
            });
        }
    ], function (err, result) {
        if (err) {
            if (callback) callback(err);
        } else {
            if (callback) callback(null, result);
        }
    });
};

module.exports = {
    activateRules: activate
};