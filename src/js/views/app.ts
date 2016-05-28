import { Component } from 'react'

export class App extends Component<{}, {}> {

    public loggedIn () : boolean {
        return !!localStorage.user;
    }

}
