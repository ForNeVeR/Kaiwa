/*global $, app, me*/
"use strict";

var _ = require('underscore');
var HumanView = require('human-view');

var mucListItem = require('../../jade/templates/includes/mucListItem.jade');

module.exports = HumanView.extend({
    template: mucListItem,
    classBindings: {
        activeContact: '',
        hasUnread: '',
        joined: '',
        persistent: ''
    },
    textBindings: {
        displayName: '.name',
        displayUnreadCount: '.unread'
    },
    events: {
        'click': 'handleClick',
        'click .join': 'handleJoinRoom',
        'click .remove': 'handleLeaveRoom'
    },
    render: function () {
        this.renderAndBind({contact: this.model});
        return this;
    },
    handleClick: function (e) {
        app.navigate('groupchat/' + encodeURIComponent(this.model.jid));
    },
    handleJoinRoom: function (e) {
        this.model.join();
    },
    handleLeaveRoom: function (e) {
        var  muc = this.model;
	muc.leave();
    }
});
