global.Buffer = global.Buffer || require('buffer').Buffer;

// TODO: Uncomment these. ~ F
//import ApplicationView from './views/appView'
import { render } from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import { Utils }        from './views/utils';
import { Login }        from './views/login';
import { App }          from './views/app';
import { Home }         from './views/home';
import { Settings }     from './views/settings';
import { Chat }         from './views/chat';
import { GroupChat }    from './views/groupchat';
import { Logout }       from './views/logout';

render((
    <Router history={browserHistory}>
        <Route path="/login" component={Login} />
        <Route path="/" component={App} onEnter={Utils.requireAuth} >
            <IndexRoute component={Home} />
            <Route path="settings" component={Settings} />
            <Route path="chat/:jid" component={Chat} />
            <Route path="groupchat/:jid" component={GroupChat} />
            <Route path="logout" component={Logout} />
        </Route>
    </Router>
), document.getElementById("root"));

//$(() =>
//    render((
//        <Router history={hashHistory}>
//            <Route path="/" component={Login} />
//        </Router>
//    ), document.getElementById('application'))); // TODO: There should be path="/" component={App} here ~ F
// TODO: Uncomment these. ~ F
//import App from './models/app'
//
//const application = new App()
//
//$(() => renderDOM(<ApplicationView app={application}/>, document.getElementById("application")))
