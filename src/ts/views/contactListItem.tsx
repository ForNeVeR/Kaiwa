import React = require('react');

export interface ContactListItemProperties {
    contact: any;
    remove: () => Promise<any>;
    navigate: () => Promise<any>;
}

export default class ContactListItem extends React.Component<ContactListItemProperties, {}> {
    render() {
        return (
            <li className='contact joined' onClick={this.props.navigate}>
                <div className='wrap'>
                    <i className='remove fa fa-times-circle' onClick={this.props.remove} />
                    <i className='presence fa fa-circle' />
                    <div className='user'>
                        <img className='avatar' src={this.props.contact.avatar} />
                        <span className='name'>{this.props.contact.displayName}</span>
                        <span className='idleTime'>{this.props.contact.idleSince}</span>
                    </div>
                    <div className='unread'>{this.props.contact.unreadCount}</div>
                </div>
            </li>
        );
    }
}

// module.exports = HumanView.extend({
//     template: templates.includes.contactListItem,
//     classBindings: {
//         show: '',
//         subscription: '',
//         chatState: '',
//         activeContact: '',
//         hasUnread: '',
//         idle: '',
//         persistent: ''
//     },
//     textBindings: {
//         displayName: '.name',
//         displayUnreadCount: '.unread'
//     },
//     srcBindings: {
//         avatar: '.avatar'
//     },
//     events: {
//         'click': 'handleClick',
//         'click .remove': 'handleRemoveContact'
//     },
//     render: function () {
//         this.renderAndBind({contact: this.model});
//         return this;
//     },
//     handleClick: function () {
//         if (me.contacts.get(this.model.jid)) {
//             app.navigate('chat/' + encodeURIComponent(this.model.jid));
//         }
//     },
//     handleRemoveContact: function() {
//         var question = "Remove "
//             + (this.model.name ?
//                 (this.model.name + " (" +  this.model.jid + ")")
//                     : this.model.jid)
//             + " from contact list?";
//         if(!confirm(question)) return;
//         me.removeContact(this.model.jid);
//         if (app.history.fragment === 'chat/' + encodeURIComponent(this.model.jid)) {
//             app.navigate('/');
//         }
//     }
// });
