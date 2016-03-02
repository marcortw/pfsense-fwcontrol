var async = require('async');
var scrape = require('../lib/scrapers');
var search = require('./searchRule');
var _ = require('lodash');

// create a rule
var createRule = function (session, useropts, rule, callback) {
    async.waterfall([
        // get a token
        function (callback) {
            var tokenRequest = {
                url: useropts.baseUrl + 'firewall_rules_edit.php?if=' + rule.params.interface,
                method: 'GET'
            };
            session(tokenRequest, function (error, response, html) {
                if (error) {
                    callback(error);
                } else {
                    if (response.statusCode >= 400) {
                        callback(new Error('HTTP Error: ' + response.statusCode));
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
                        callback(new Error('Rule cannot be created. Rule already exists.'));
                    } else {
                        callback(null, token)
                    }
                }
            });
        },

        // perform the rule creation
        function (token, callback) {
            // add the rule
            var addRuleRequest = {
                url: useropts.baseUrl + 'firewall_rules_edit.php',
                method: 'POST'
            };

            if (rule.params.descr.length > 52) {
                callback(new Error('Description too long. Maximum of 52 chars'));
            } else {

                // add the CSRF token
                rule.params[token.csrftoken_key] = token.csrftoken_value;

                // prepare the http request
                addRuleRequest.form = rule.params;

                // fire the request
                session(addRuleRequest, function (error, response, html) {
                    if (error) {
                        callback(error);
                    } else {
                        if (response.statusCode >= 400) {
                            callback(new Error('HTTP Error: ' + response.statusCode));
                        } else {
                            var ruleerror = scrape.getInputErrors(html);
                            if (ruleerror) {
                                callback(ruleerror)
                            } else {
                                callback(null, {'ruledesc': rule.params.descr, 'status': 'created'});
                            }
                        }
                    }
                });
            }
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
    createRule: createRule
};