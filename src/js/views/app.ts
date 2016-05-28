import { Component } from 'react';

const StanzaIO = require('stanza.io');

export class App extends Component<{}, any> {

    constructor () {
        super();

        console.log("Init App");

        this.state.session = JSON.parse(localStorage.getItem("session"));

    }

    render () {
        return null;
    }

}
