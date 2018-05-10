"use strict";

module.exports = function (client, stanzas) {
    var types = stanzas.utils;
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

    let UploadSlot = stanzas.define({
        name: 'uploadSlot',
        namespace: UPLOAD_NS,
        element: 'slot',
        fields: {
            get: types.subAttribute(UPLOAD_NS, 'get', 'url'),
            put: types.subAttribute(UPLOAD_NS, 'put', 'url')
        }
    });

    stanzas.extendIQ(UploadSlot);

    client.mediaPushService = function (message, cb) {
        return client.sendIq( message, cb );
    }; 
    
};