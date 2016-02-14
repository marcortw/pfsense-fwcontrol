var async = require('async');
var scrape = require('../lib/scrapers');
var search = require('./searchRule');

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
                        callback('Rule cannot be created. Rule already exists.');
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

            // some defaults
            var params = {};
            params.ruleid = '';
            params.type = 'pass';
            params.interface = '';
            params.ipprotocol = 'inet';
            params.proto = '';
            params.srctype = '';
            params.src = '';
            params.srcbeginport = '';
            params.srcbeginport_cust = '';
            params.srcendport = '';
            params.srcendport_cust = '';
            params.dsttype = '';
            params.dst = '';
            params.dstbeginport = '';
            params.dstendport = '';
            params.descr = '';
            params.Submit = 'Save';
            params.after = '';
            params.os = '';
            params.dscp = '';
            params.tag = '';
            params.tagged = '';
            params.max = '';
            params['max-src-nodes'] = '';
            params['max-src-conn'] = '';
            params['max-src-states'] = '';
            params['max-src-conn-rate'] = '';
            params['max-src-conn-rates'] = '';
            params.statetimeout = '';
            params.statetype = '';
            params.vlanprio = '';
            params.vlanprioset = '';
            params.sched = '';
            params.gateway = '';
            params.dnpipe = '';
            params.pdnpipe = '';
            params.ackqueue = '';
            params.defaultqueue = '';
            params.l7container = '';
            params.referer = '';
            params.after = '';

            // overwrite the defaults with the supplied params
            params = rule.params;

            // add the CSRF token
            params[token.csrftoken_key] = token.csrftoken_value;

            // prepare the http request
            addRuleRequest.form = params;

            // fire the request
            session(addRuleRequest, function (error, response, html) {
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
                            callback(null, {'ruledesc': rule.params.descr, 'status': 'created'});
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
    createRule: createRule
};