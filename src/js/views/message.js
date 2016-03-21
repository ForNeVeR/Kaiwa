/*global $*/
"use strict";

var _ = require('underscore');
var HumanView = require('human-view');

var message = require('../../jade/templates/includes/message.jade');

module.exports = HumanView.extend({
    template: message,
    initialize: function (opts) {
        this.render();
    },
    classBindings: {
        mine: '.message',
        receiptReceived: '.message',
        pending: '.message',
        delayed: '.message',
        edited: '.message',
        meAction: '.message'
    },
    textBindings: {
        body: '.body',
        formattedTime: '.timestamp'
    },
    render: function () {
        this.renderAndBind({message: this.model});
        return this;
    }
});
