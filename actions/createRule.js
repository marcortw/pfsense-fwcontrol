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

            var defaults = {
                ruleid: '',
                type: 'pass',
                interface: '',
                ipprotocol: 'inet',
                proto: 'tcp',
                srctype: '',
                src: '',
                srcbeginport: '',
                srcbeginport_cust: '',
                srcendport: '',
                srcendport_cust: '',
                dsttype: '',
                dst: '',
                dstbeginport: '',
                dstendport: '',
                descr: '',
                Submit: 'Save',
                os: '',
                dscp: '',
                tag: '',
                tagged: '',
                max: '',
                'max-src-nodes': '',
                'max-src-conn': '',
                'max-src-states': '',
                'max-src-conn-rate': '',
                'max-src-conn-rates': '',
                statetimeout: '',
                statetype: '',
                vlanprio: '',
                vlanprioset: '',
                sched: '',
                gateway: '',
                dnpipe: '',
                pdnpipe: '',
                ackqueue: '',
                defaultqueue: '',
                l7container: '',
                referer: '',
                after: ''
            };

            _.defaults(rule.params, defaults);

            if (rule.params.descr.length > 52) {
                callback('Description too long. Maximum of 52 chars');
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