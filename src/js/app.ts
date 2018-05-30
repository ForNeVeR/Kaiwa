/// <reference path="../../typings/tsd.d.ts" />
'use strict';

global.Buffer = global.Buffer || require('buffer').Buffer;

declare const SERVER_CONFIG: any
declare const client: any
declare const me: any

interface Storage {}
interface StorageConstructor {
    new(): Storage
    prototype: Storage
}

var $: JQueryStatic = require('jquery')
var _: _.LoDashStatic = require('lodash')
var Backbone = require('backbone')

Backbone.$ = $
const asyncjs: Async = require('async')
var StanzaIO = require('stanza.io')

var AppState = require('./models/state')
var MeModel = require('./models/me')
const MainView = require('./views/main')
var Router = require('./router')
var Storage: StorageConstructor = require('./storage')
var xmppEventHandlers = require('./helpers/xmppEventHandlers')
var pushNotifications = require('./helpers/pushNotifications')
var shareMedia = require('./helpers/shareMedia')
const Notify = require('notify.js')
var Desktop = require('./helpers/desktop')
var AppCache = require('./helpers/cache')
const url = require('url')

var SoundEffectManager = require('sound-effect-manager')
let app = null

class App {
    launch() {
        function parseConfig(json) {
            var config = JSON.parse(json)
            var credentials = config.credentials
            if (!credentials) return config

            for (var property in credentials) {
                if (!credentials.hasOwnProperty(property)) continue

                var value = credentials[property]
                if (value.type === 'Buffer') {
                    credentials[property] = new Buffer(value)
                }
            }

            return config
        }

        var self = window['app'] = this
        var config = localStorage['config']

        if (!config) {
            console.log('missing config')
            window.location = <any>'login.html'
            return
        }

        app.config = parseConfig(config)
        app.config.useStreamManagement = false // Temporary solution because this feature is bugged on node 4.0

        if (SERVER_CONFIG.sasl) {
            app.config.sasl = SERVER_CONFIG.sasl
        }

        _.extend(this, Backbone.Events)

        var profile = {}
        asyncjs.series([
            function (cb) {
                app.notifications = new Notify()
                app.soundManager = new SoundEffectManager()
                app.desktop = new Desktop()
                app.cache = new AppCache()
                app.storage = new Storage()
                app.storage.open(cb)
                app.composing = {}
                app.timeInterval = 0
                app.mucInfos = []
            },
            function (cb) {
                app.storage.profiles.get(app.config.jid, function (err, res) {
                    if (res) {
                        profile = res
                        profile['jid'] = {full: app.config.jid, bare: app.config.jid}
                        app.config.rosterVer = res.rosterVer
                    }
                    cb()
                })
            },
            function (cb) {
                app.state = new AppState()
                app.me = window['me'] = new MeModel(profile)

                window.onbeforeunload = function () {
                    if (app.api.sessionStarted) {
                        app.api.disconnect()
                    }
                }

                self.api = window['client'] = StanzaIO.createClient(app.config)
                client.use(pushNotifications)
                client.use(shareMedia)
                xmppEventHandlers(self.api, self)

                self.api.once('session:started', function () {
                    app.state.hasConnected = true
                    cb()
                })
                self.api.connect()
            },
            function (cb) {
                app.soundManager.loadFile('sounds/ding.wav', 'ding')
                app.soundManager.loadFile('sounds/threetone-alert.wav', 'threetone-alert')
                cb()
            },
            function (cb) {
                app.whenConnected(function () {
                    function getInterval() {
                        if (client.sessionStarted) {
                            client.getTime(self.id, function (err, res) {
                                if (err) return
                                self.timeInterval = res.time.utc - Date.now()
                            })
                            setTimeout(getInterval, 600000)
                        }
                    }
                    getInterval()
                })
                cb()
            },
            function (cb) {
                app.whenConnected(function () {
                    me.publishAvatar()
                })

                function start() {
                    // start our router and show the appropriate page
                    var baseUrl = url.parse(SERVER_CONFIG.baseUrl) 
                    app.history.start({pushState: false, root: baseUrl.pathname})
                    if (app.history.fragment == '' && SERVER_CONFIG.startup)
                        app.navigate(SERVER_CONFIG.startup)
                    cb()
                }

                new Router()
                app.history = Backbone.history
                app.history.on("route", function(route, params) {
                    app.state.pageChanged = params
                })

                self.view = new MainView({
                    model: app.state,
                    el: document.body
                })
                self.view.render()

                if (me.contacts.length) {
                    start()
                } else {
                    me.contacts.once('loaded', start)
                }
            }
        ])
    }
    whenConnected(func) {
        if (app.api.sessionStarted) {
            func()
        } else {
            app.api.once('session:started', func)
        }
    }
    navigate(page) {
        var url = (page.charAt(0) === '/') ? page.slice(1) : page
        app.state.markActive()
        app.history.navigate(url, true)
    }
    renderPage(view, animation) {
        var container = $('#pages')

        if (app.currentPage) {
            app.currentPage.hide(animation)
        }
        // we call render, but if animation is none, we want to tell the view
        // to start with the active class already before appending to DOM.
        container.append(view.render(animation === 'none').el)
        view.show(animation)
    }
    serverConfig() {
        return SERVER_CONFIG
    }
    // TODO: add typings
    private view: any
    private api: any
    private id: any
    private timeInterval: any
} 
app = new App()
module.exports = app

$(()=> app.launch())
