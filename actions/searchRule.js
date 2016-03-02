var async = require('async');
var scrape = require('../lib/scrapers');

// search a rule
var searchRule = function (session, useropts, rule, callback) {
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
            var description = rule.params.descr;
            var ruleId = scrape.getRuleByDescription(html, description);
            callback(null, ruleId, token);
        },

        // perform the rule analysis
        function (ruleid, token, callback) {
            if (ruleid) {
                callback(null, {'ruledesc': rule.params.descr, 'status': 'exists', 'id': ruleid})
            } else {
                callback(null, {'ruledesc': rule.params.descr, 'status': 'unknown'})
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
    searchRule: searchRule
};