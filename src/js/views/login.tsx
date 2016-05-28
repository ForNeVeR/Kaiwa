import { Component, StatelessComponent } from 'react'

class Field extends Component<{
    type?: string;
    id: string;
    label?: string;
    placeholder?: string;
    tabIndex?: number;
    autoFocus?: boolean;
    title?: string;
}, {}> {
    static defaultProps = {
        id: '',
        type: 'text',
        autoFocus: false
    }

    render() {
        const props = this.props;
        const isCheckBox = props.type === 'checkbox';
        const className = 'fieldContainer' + (isCheckBox ? ' checkbox' : '');
        const label = <label key="label" htmlFor={props.id}>{props.label}</label>;
        const input = <input key="input"
                             type={props.type}
                             id={props.id}
                             placeholder={props.placeholder}
                             tabIndex={props.tabIndex}
                             autoFocus={props.autoFocus} />;
        const components = isCheckBox ?[ input, label ] : [ label, input ];

        return (
            <div className={className} title={props.title}>
                {components}
            </div>
        );
    }
}

export class Login extends Component<{}, {}> {
    render() {
        const showWssSelector = !window.SERVER_CONFIG.wss;
        return (
            <section className="loginbox content box">
                <div className="head">
                    <h2>Log in</h2>
                </div>
                <div className="content">
                    <form id="login-form">
                        <Field id="jid" label="Username" placeholder="you" tabIndex={1} autoFocus={true} />
                        <Field id="password"
                               type="password"
                               label="Password"
                               placeholder="••••••••"
                               tabIndex={2} />
                        {showWssSelector
                            ? <Field id="connURL" label="WebSocket or BOSH URL" placeholder="wss://aweso.me:5281/xmpp-websocket" tabIndex={3} />
                            : null}
                        <Field id="public-computer" label="Public computer" type="checkbox" tabIndex={4} title="Do not remember password" />

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
