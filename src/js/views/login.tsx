import { browserHistory } from 'react-router';
import { Component, StatelessComponent } from 'react';

class Field extends Component<{
    type?: string;
    id: string;
    label?: string;
    placeholder?: string;
    tabIndex?: number;
    autoFocus?: boolean;
    title?: string;
    value?: any;
    onChange?: any;
}, {}> {
    static defaultProps = {
        id: '',
        type: 'text',
        autoFocus: false
    }

    render () {
        const props = this.props;
        const isCheckBox = props.type === 'checkbox';
        const className = 'fieldContainer' + (isCheckBox ? ' checkbox' : '');
        const label = <label key="label" htmlFor={props.id}>{props.label}</label>;
        const input = <input key="input"
                             type={props.type}
                             id={props.id}
                             placeholder={props.placeholder}
                             tabIndex={props.tabIndex}
                             autoFocus={props.autoFocus}
                             value={props.value}
                             onChange={props.onChange} />;
        const components = isCheckBox ? [ input, label ] : [ label, input ];

        return (
            <div className={className} title={props.title}>
                {components}
            </div>
        );
    }
}

export class Login extends Component<{}, {
    jid?: string;
    password?: string;
    server?: string;
    connURL?: string;
    wsURL?: string;
    boshURL?: string;
    transport?: string;
}> {

    constructor () {
        super();
        this.state = {};
    }

    handleSubmit (event) {
        event.preventDefault();

        console.log(this, this.state);

        if(window.SERVER_CONFIG.domain && this.state.jid.indexOf('@') == -1)
            this.state.jid += "@" + window.SERVER_CONFIG.domain;

        if(window.SERVER_CONFIG.wss)
            this.state.connURL = window.SERVER_CONFIG.wss;

        if (this.state.connURL.indexOf('http') === 0) {
            this.state.boshURL = this.state.connURL;
            this.state.transport = 'bosh';
        } else if (this.state.connURL.indexOf('ws') === 0) {
            this.state.wsURL = this.state.connURL;
            this.state.transport = 'websocket';
        }

        localStorage.setItem("session", JSON.stringify(this.state));

        browserHistory.push('/');
    }

    handleChange (event) {
        this.setState({ [event.target.id]: event.target.value });
    }

    render () {
        const showWssSelector = !window.SERVER_CONFIG.wss;
        return (
            <section className="loginbox content box">
                <div className="head">
                    <h2>Log in</h2>
                </div>
                <div className="content">
                    <form id="login-form" onSubmit={e => this.handleSubmit(e)}>
                        <Field id="jid"
                               label="Username"
                               placeholder="you"
                               tabIndex={1}
                               autoFocus={true}
                               value={this.state.jid}
                               onChange={e => this.handleChange(e)} />
                        <Field id="password"
                               type="password"
                               label="Password"
                               placeholder="••••••••"
                               tabIndex={2}
                               value ={this.state.password}
                               onChange={e => this.handleChange(e)} />
                        {showWssSelector
                            ? <Field id="connURL"
                                     label="WebSocket or BOSH URL"
                                     placeholder="wss://aweso.me:5281/xmpp-websocket"
                                     tabIndex={3}
                                     value={this.state.connURL}
                                     onChange={e => this.handleChange(e)} />
                            : null}
                        <Field id="public-computer"
                               label="Public computer"
                               type="checkbox"
                               tabIndex={4}
                               title="Do not remember password" />

                        <button type="submit" tabIndex={5} className="primary">Go!</button>
                    </form>
                </div>
            </section>
        );
    }

}

/* TODO:
block scripts
    script(src="js/login.js")
~ F */
