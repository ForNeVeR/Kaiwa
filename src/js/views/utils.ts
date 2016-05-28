import { Component } from 'react'

export class Utils extends Component<{}, {}> {

    public static requireAuth (nextState, replace) {
        if(!nextState.components[0].loggedIn())
            replace('/login');
    }

}
