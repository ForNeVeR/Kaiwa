"use strict";

module.exports = function (client, stanzas) {
    var types = stanzas.utils;
    let jxt = require('jxt').createRegistry();
    jxt.use(require('jxt-xmpp-types'));
    jxt.use(require('jxt-xmpp'));
    let helpers = jxt.utils;

    let UPLOAD_NS = 'urn:xmpp:http:upload:0';   

    var shareMedia = stanzas.define({
        name: 'request',
        element: 'request',
        namespace: 'urn:xmpp:http:upload:0',
        fields: {           
           size: types.attribute('size'),
            filename: types.attribute('filename'),
            'content-type': types.text()
            
        }      
    });
    stanzas.withIq(function (Iq) {
        stanzas.extend(Iq, shareMedia);
    });

    var uploadMediaData = stanzas.define({
        name: 'uploadMediaData',
        namespace: 'urn:xmpp:push:0',
        element: 'request',
        fields: {
            data: types.text()
        }
    });    

    stanzas.withIq(function (Iq) {
        stanzas.extend(Iq, uploadMediaData);
    });

    client.uploadMedia = function (message) {        
        return client.sendIq(message);
    };

    let UploadSlot = jxt.define({
        name: 'uploadSlot',
        namespace: UPLOAD_NS,
        element: 'slot',
        fields: {
            get: helpers.subAttribute(UPLOAD_NS, 'get', 'url'),
            put: helpers.subAttribute(UPLOAD_NS, 'put', 'url')
        }
    });

    jxt.extendIQ(UploadSlot);

    client.mediaPushService = function (message, cb) {
        return client.sendIq( message, cb );
    }; 
    
};