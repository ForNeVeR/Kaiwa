/*global $, app, me*/
"use strict";

var _ = require('underscore');
var HumanView = require('human-view');

var mucRosterItem = require('../../jade/templates/includes/mucRosterItem.jade');

module.exports = HumanView.extend({
    template: mucRosterItem,
    events: {
        'click': 'handleClick'
    },
    classBindings: {
        show: '',
        chatState: '',
        idle: ''
    },
    textBindings: {
        mucDisplayName: '.name'
    },
    render: function () {
        this.renderAndBind({contact: this.model});
        return this;
    },
    handleClick: function (e) {
        this.parent.trigger('rosterItemClicked', this.model.mucDisplayName);
    }
});
