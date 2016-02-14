var login = require('./login');
var logout = require('./logout');
var createRule = require('./createRule');
var activateRules = require('./activateRules');
var deleteRule = require('./deleteRule');
var searchRule = require('./searchRule');

module.exports = {

    login: function (useropts, callback) {
        login.login(useropts, callback);
    },

    logout: function (session, useropts, callback) {
        logout.logout(session, useropts, callback);
    },

    createRule: function (session, useropts, rule, callback) {
        createRule.createRule(session, useropts, rule, callback);
    },

    activateRule: function (session, useropts, callback) {
        activateRules.activateRules(session, useropts, callback);
    },

    deleteRule: function (session, useropts, rule, callback) {
        deleteRule.deleteRule(session, useropts, rule, callback);
    },

    searchRule: function (session, useropts, rule, callback) {
        searchRule.searchRule(session, useropts, rule, callback);
    }

};