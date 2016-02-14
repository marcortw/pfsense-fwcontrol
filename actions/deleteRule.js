var async = require('async');
var scrape = require('../lib/scrapers');
var search = require('./searchRule');

// delete a rule
var deleteRule = function (session, useropts, rule, callback) {
    async.waterfall([
        // get a token
        function (callback) {
            var tokenRequest = {
                url: useropts.baseUrl + 'firewall_rules.php?if=' + rule.params.interface,
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
                        callback(null, token, html);
                    }
                }
            })
        },

        // search for the rule
        function (token, html, callback) {
            search.searchRule(session, useropts, rule, function (err, result) {
                if (err) {
                    if (callback) callback(err);
                } else {
                    if (result.status == 'exists') {
                        callback(null, result.id, token)
                    } else {
                        callback('Rule cannot be deleted. Rule does not exist.');
                    }
                }
            });
        },

        // perform the rule deletion (surprisingly we don't need a CSRF token here)
        function (ruleid, token, callback) {
            var delRuleRequest = {
                url: useropts.baseUrl + 'firewall_rules.php',
                qs: {act: 'del', if: rule.params.interface, id: ruleid}, //Query string data
                method: 'GET'
            };

            session(delRuleRequest, function (error, response, html) {
                if (error) {
                    callback(error);
                } else {
                    if (response.statusCode >= 400) {
                        callback('HTTP Error: ' + response.statusCode);
                    } else {
                        var ruleerror = scrape.getInputErrors(html);
                        if (ruleerror) {
                            callback(ruleerror)
                        } else {
                            callback(null, {'ruledesc': rule.params.descr, 'status': 'deleted'});
                        }
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
    deleteRule: deleteRule
};