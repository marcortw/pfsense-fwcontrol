var _ = require('lodash');

var normalizeParams = function (params, callback) {
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

    _.defaults(params, defaults);

    params = _.transform(params, function (result, value, key) {
        if (key == 'descr') {
            result[key] = value;
        } else {
            result[key] = _.isString(value) ? value.toLowerCase() : value
        }
    }, {});

    callback(null, params);
};

module.exports = {
    normalizeParams: normalizeParams
};

