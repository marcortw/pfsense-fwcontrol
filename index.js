var async = require('async');
var pfSense = require('./actions/all');
var normalize = require('./lib/normalizers');

var start = function (connection, tasks, callback) {
    var useropts = connection;
    var resultArr = [];

    async.waterfall([
        // login
        function (callback) {
            pfSense.login(useropts, function (err, session) {
                if (err) {
                    resultArr.push({'status': 'error', 'errormessage': err});
                    callback(err);
                } else {
                    callback(null, session);
                }
            })
        },

        // execute each task
        function (session, callback) {
            async.eachSeries(tasks, function (task, callback) {
                normalize.normalizeParams(task.params, function (err, params) {
                    task.params = params;
                    switch (task.action) {
                        case 'create':
                            pfSense.createRule(session, useropts, task, function (err, result) {
                                if (err) {
                                    resultArr.push({
                                        'ruledesc': task.params.descr,
                                        'status': 'error',
                                        'errormessage': err
                                    });
                                    callback();
                                } else {
                                    resultArr.push(result);
                                    pfSense.activateRule(session, useropts, function (err, result) {
                                        callback();
                                    });
                                }
                            });
                            break;
                        case 'delete':
                            pfSense.deleteRule(session, useropts, task, function (err, result) {
                                if (err) {
                                    resultArr.push({
                                        'ruledesc': task.params.descr,
                                        'status': 'error',
                                        'errormessage': err
                                    });
                                    callback();
                                } else {
                                    resultArr.push(result);
                                    pfSense.activateRule(session, useropts, function (err, result) {
                                        callback();
                                    });
                                }
                            });
                            break;
                        case 'search':
                            pfSense.searchRule(session, useropts, task, function (err, result) {
                                if (err) {
                                    resultArr.push({
                                        'ruledesc': task.params.descr,
                                        'status': 'error',
                                        'errormessage': err
                                    });
                                    callback();
                                } else {
                                    resultArr.push(result);
                                    pfSense.activateRule(session, useropts, function (err, result) {
                                        callback();
                                    });
                                }
                            });
                            break;
                        default:
                            callback();
                    }
                })
            }, function (err) {
                // one of the series had an error, we will nevertheless continue to properly logout
                if (err) {
                    callback(null, session);
                } else {
                    callback(null, session);
                }
            })

        },

        // logout
        function (session, callback) {
            pfSense.logout(session, useropts, function (err, result) {
                if (err) {
                    callback(err);
                } else {
                    callback(null);
                }
            })
        }
    ], function (err, result) {
        if (err) {
            if (callback) callback(err, resultArr);
        } else {
            if (callback) callback(null, resultArr);
        }
    });
};

module.exports = {
    start: start
};

