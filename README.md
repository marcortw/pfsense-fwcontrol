# pfsense-fwcontrol
A simple proof of concept to control pfSense's firewall. There are not a lot of useful APIs around to control iptables, so I implemented this quick and dirty piece of software to manipulate a pfSense firewall through their admin UI. It has been tested with the community edition version 2.2.6. It can only create and delete firewall rules for the moment.

## Usage

This is a basic example which creates a rule:
``` js
var fwcontrol = require('pfsense-fwcontrol');

var addRule = {
    action: 'create',
    params: {
        type: 'pass',
        interface: 'lan',
        ipprotocol: 'inet',
        proto: 'tcp',
        srctype: 'single',
        src: '192.168.100.1',
        srcbeginport: '',
        srcbeginport_cust: '',
        srcendport: '',
        srcendport_cust: '',
        dsttype: 'single',
        dst: '192.168.200.2',
        dstbeginport: '53',
        dstendport: '53',
        descr: 'This must be a unique identifier which references a rule'
    }
};

fwcontrol.start({
    baseUrl: 'http://192.168.2.122/',
    username: 'admin',
    password: 'pfsense',
    proxy: 'http://localhost:8888' // proxy is optional
}, [addRule], function (err, result) {
    if (err) {
        console.log(err);
    } else {
        console.log(result);
    }
});
```
