/*global me, app, client*/
"use strict";

var _ = require('underscore'),
    async = require('async'),
    crypto = require('crypto'),
    bows = require('bows'),
    uuid = require('node-uuid'),
    HumanModel = require('human-model'),
    Contact = require('../models/contact'),
    Resource = require('../models/resource'),
    Message = require('../models/message'),
    Call = require('../models/call'),
    StanzaIo = require('stanza.io'),

    log = bows('Otalk'),
    ioLogIn = bows('<< in'),
    ioLogOut = bows('>> out'),

    discoCapsQueue = async.queue(function (pres, cb) {
        var jid = pres.from,
            caps = pres.caps;

        log.info('Checking storage for ' + caps.ver);

        var contact = me.getContact(jid),
            resource = contact ? contact.resources.get(jid) : false;

        app.storage.disco.get(caps.ver, function (err, existing) {
            if (existing) {
                log.info('Already found info for ' + caps.ver);
                if (resource) resource.discoInfo = existing;
                return cb();
            }

            log.info('getting info for ' + caps.ver + ' from ' + jid);

            client.getDiscoInfo(
                jid,
                caps.node + '#' + caps.ver,
                function (err, result) {
                    if (err || !result.discoInfo.features) {
                        log.info('Couldnt get info for ' + caps.ver);
                        return cb();
                    }
                    if (client.verifyVerString(result.discoInfo, caps.hash,
                            caps.ver)) {
                        log.info('Saving info for ' + caps.ver);
                        var data = result.discoInfo;
                        app.storage.disco.add(caps.ver, data, function () {
                            if (resource) resource.discoInfo = data;
                            cb();
                        });
                    } else {
                        log.info('Couldnt verify info for ' + caps.ver
                                + ' from ' + jid);
                        cb();
                    }
                }
            );
        });
    });


module.exports = function (client, app) {

    client.on('*', function (name, data) {
        if (name === 'raw:incoming') {
            ioLogIn.debug(data.toString());
        } else if (name === 'raw:outgoing') {
            ioLogOut.debug(data.toString());
        }
    });

    client.on('credentials:update', function (creds) {
        client.config.credentials = creds;
        if (!client.config.saveCredentials) {
            delete localStorage.config;
            return;
        }

        if (SERVER_CONFIG.securePasswordStorage) {
            if (creds.clientKey && creds.serverKey) {
                delete creds.password;
                delete creds.saltedPassword;
            } else if (creds.saltedPassword) {
                delete creds.password;
            }
        } else {
            creds = {
                password: creds.password
            };
        }

        localStorage.config = JSON.stringify({
            jid: client.config.jid.bare,
            server: client.config.server,
            wsURL: client.config.wsURL,
            transports: client.config.transports,
            saveCredentials: client.config.saveCredentials,
            credentials: creds
        });
    });

    client.on('disconnected', function (err) {
        app.state.connected = false;
        if (err) {
            console.error(err);
        }
        if (!app.state.hasConnected) {
            window.location = 'login.html';
        }
    });

    client.on('auth:failed', function () {
        log.warn('auth failed');
        localStorage.authFailed = true;
        window.location = 'login.html';
    });

    client.on('stream:management:resumed', function () {
        app.state.connected = true;
    });

    client.on('session:started', function (jid) {
        me.updateJid(jid);

        app.state.connected = true;
        window.readyForDeviceID = true;

        client.getRoster(function (err, resp) {
            if (resp.roster && resp.roster.items && resp.roster.items.length) {
                app.storage.roster.clear(function () {
                    me.contacts.reset();
                    me.rosterVer = resp.roster.ver;

                    _.each(resp.roster.items, function (item) {
                        me.setContact(item, true);
                    });
                });
            }

            var caps = client.updateCaps();
            app.storage.disco.add(caps.ver, caps.discoInfo, function () {
                client.sendPresence({
                    status: me.status,
                    caps: client.disco.caps
                });
                client.enableCarbons();
            });

            me.mucs.fetch();
        });

        var keepalive = SERVER_CONFIG.keepalive;
        if (keepalive) {
            client.enableKeepAlive(keepalive);
        }
    });

    client.on('roster:update', function (iq) {
        var items = iq.roster.items,
            contact;

        me.rosterVer = iq.roster.ver;

        
        _.each(items, function (item) {
            contact = me.getContact(item.jid);

            if (item.subscription === 'remove') {
                if (contact) {
                    me.removeContact(item.jid);
                }
                return;
            }

            me.setContact(item, true);
        });
    });

    client.on('subscribe', function (pres) {
        me.contactRequests.add({
            jid: pres.from.bare
        });
    });

    client.on('available', function (pres) {
        var contact = me.getContact(pres.from);
        if (contact) {
            delete pres.id;
            pres.show = pres.show || '';
            pres.status = pres.status || '';
            pres.priority = pres.priority || 0;


            var resource = contact.resources.get(pres.from);
            if (resource) {
                pres.from = pres.from.full;
                // Explicitly set idleSince to null to clear
                // the model's value.
                if (!pres.idleSince) {
                    pres.idleSince = null;
                }
                resource.set(pres);
            } else {
                resource = new Resource(pres);
                resource.id = pres.from.full;
                contact.resources.add(resource);

                if (!pres.caps) {
                    resource.fetchDisco();
                }
                resource.fetchTimezone();
            }

            var muc = pres.muc || {};
            if (muc.codes && muc.codes.indexOf('110') >= 0) {
                contact.joined = true;
            }
        }
    });

    client.on('unavailable', function (pres) {
        var contact = me.getContact(pres.from);
        if (contact) {
            var resource = contact.resources.get(pres.from.full);
            if (resource) {
                if (resource.id === contact.lockedResource) {
                    contact.lockedResource = '';
                }

                if (contact.resources.length === 1) {
                    contact.offlineStatus = pres.status;
                }
                contact.resources.remove(resource);
            }

            var muc = pres.muc || {};
            if (muc.codes && muc.codes.indexOf('110') >= 0) {
                contact.joined = false;
            }
        }
    });

    client.on('avatar', function (info) {
        var contact = me.getContact(info.jid) || me.isMe(info.jid);
        if (!contact) {
            return;
        }

        var id = '',
            type = 'image/png';
        // kaiwa_avatars.png
        if (info.avatars.length > 0) {
            id = info.avatars[0].id;
            type = info.avatars[0].type || type;
        }

        if (contact.type === 'muc') {
            var resource = contact.resources.get(info.jid.full);
            if (resource) {
                resource.setAvatar(id, type, info.source);
            }
        }

        if (contact.setAvatar) {
            contact.setAvatar(id, type, info.source);
        }
    });

    client.on('chatState', function (info) {
        var contact = me.getContact(info.from);
        if (contact) {
            var resource = contact.resources.get(info.from.full);
            if (resource) {
                resource.chatState = info.chatState;
                contact.lockedResource = (info.chatState === 'gone') ?
                    undefined : info.from.full;
            }
        } else if (me.isMe(info.from)) {
            if (info.chatState === 'active' || info.chatState === 'composing') {
                contact = me.getContact(info.to);
                if (contact) {
                    contact.unreadCount = 0;
                }
            }
        }
    });

    client.on('chat', function (msg) {
        msg.mid = msg.id;
        delete msg.id;

        var contact = me.getContact(msg.from, msg.to);
        if (contact && !msg.replace) {
            var message = new Message(msg);

            if (msg.archived) {
                msg.archived.forEach(function (archived) {
                    if (me.isMe(archived.by)) {
                        message.archivedId = archived.id;
                    }
                });
            }

            if (msg.carbon)
                msg.delay.stamp = new Date(Date.now() + app.timeInterval);

            message.acked = true;
            var localTime = new Date(Date.now() + app.timeInterval),
                notify = Math.round((localTime - message.created) / 1000) < 5;
            contact.addMessage(message, notify);
            if (msg.from.bare == contact.jid.bare) {
                contact.lockedResource = msg.from.full;
            }
        }
    });

    client.on('groupchat', function (msg) {
        msg.mid = msg.id;
        delete msg.id;

        var contact = me.getContact(msg.from, msg.to);
        if (contact && !msg.replace) {
            var message = new Message(msg);
            message.acked = true;
            var localTime = new Date(Date.now() + app.timeInterval),
                notify = Math.round((localTime - message.created) / 1000) < 5;
            contact.addMessage(message, notify);
        }
    });

    client.on('muc:subject', function (msg) {
        var contact = me.getContact(msg.from, msg.to);
        if (contact) {
            contact.subject = msg.subject === 'true' ? '' : msg.subject;
        }
    });

    client.on('replace', function (msg) {
        msg.mid = msg.id;
        delete msg.id;

        var contact = me.getContact(msg.from, msg.to);
        if (!contact) return;

        var original = Message.idLookup(
            msg.from[msg.type === 'groupchat' ? 'full' : 'bare'],
            msg.replace
        );

        if (!original) return;

        original.correct(msg);
    });

    client.on('receipt', function (msg) {
        var contact = me.getContact(msg.from, msg.to);
        if (!contact) return;

        var original = Message.idLookup(
            msg.to[msg.type === 'groupchat' ? 'full' : 'bare'],
            msg.receipt
        );

        if (!original) return;

        original.receiptReceived = true;
    });

    client.on('message:sent', function (msg) {
        if (msg.carbon) {
            msg.delay.stamp = new Date(Date.now() + app.timeInterval);

            client.emit('message', msg);
        }
    });

    client.on('disco:caps', function (pres) {
        if (pres.caps.hash) {
            log.info('Caps from ' + pres.from + ' ver: ' + pres.caps.ver);
            discoCapsQueue.push(pres);
        }
    });

    client.on('stanza:acked', function (stanza) {
        if (stanza.body) {
            var contact = me.getContact(stanza.to, stanza.from);
            if (contact) {
                var msg = Message.idLookup(me.jid.bare, stanza.id);
                if (msg) {
                    msg.acked = true;
                }
            }
        }
    });

    client.on('jingle:incoming', function (session) {
        var contact = me.getContact(session.peer);
        if (!contact) {
            contact = new Contact({ jid: new StanzaIo.JID(session.peer).bare });
            contact.resources.add({id: session.peer});
            me.contacts.add(contact);
        }

        var call = new Call({
            contact: contact,
            state: 'incoming',
            jingleSession: session
        });
        contact.jingleCall = call;
        contact.callState = 'incoming';
        me.calls.add(call);
        // FIXME: send directed presence if not on roster
    });

    client.on('jingle:outgoing', function (session) {
        var contact = me.getContact(session.peer),
            call = new Call({
                contact: contact,
                state: 'outgoing',
                jingleSession: session
            });
        contact.jingleCall = call;
        me.calls.add(call);
    });

    client.on('jingle:terminated', function (session) {
        var contact = me.getContact(session.peer);
        contact.callState = '';
        contact.jingleCall = null;
        contact.onCall = false;
        if (me.calls.length == 1) { // this is the last call
            client.jingle.stopLocalMedia();
            client.jingle.localStream = null;
        }
    });

    client.on('jingle:accepted', function (session) {
        var contact = me.getContact(session.peer);
        contact.callState = 'activeCall';
        contact.onCall = true;
    });

    client.on('jingle:localstream:added', function (stream) {
        me.stream = stream;
    });

    client.on('jingle:localstream:removed', function () {
        me.stream = null;
    });

    client.on('jingle:remotestream:added', function (session) {
        var contact = me.getContact(session.peer);
        if (!contact) {
            contact.resources.add({id: session.peer});
            me.contacts.add(contact);
        }
        contact.stream = session.streams[0];
    });

    client.on('jingle:remotestream:removed', function (session) {
        var contact = me.getContact(session.peer);
        contact.stream = null;
    });

    client.on('jingle:ringing', function (session) {
        var contact = me.getContact(session.peer);
        contact.callState = 'ringing';
    });
};
