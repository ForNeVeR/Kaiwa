import { Component } from 'react'

export class Utils extends Component<{}, {}> {

    public static requireAuth (nextState, replace) {
        if(!Utils.isLoggedIn())
            replace('/login');
    }

    public static isLoggedIn () : boolean {
        return !!localStorage.getItem("session");
    }

}
