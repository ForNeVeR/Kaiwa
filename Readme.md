Kaiwa [![Build Status](https://travis-ci.org/ForNeVeR/kaiwa.svg?branch=develop)](https://travis-ci.org/ForNeVeR/kaiwa)
=====
Kaiwa is an open source web client for XMPP.  

Our production server is http://chat.jabber.ru

Alpha version is always hosted on http://kaiwa.fornever.me (**warning: there may
be highly unstable code there, you're recommended to use test accounts with this
server**).

Kaiwa is a fork of [Otalk][otalk], a prototype application created by &yet.

## Warning

**We're rewriting project in React and TypeScript right now. It's not in a
usable state yet. If you want a stable version, please use the [master][]
branch.**

## Features

![Screenshot](http://getkaiwa.com/assets/img/header.png)

Kaiwa comes with support for:

### Message History Syncing

Using Message Archive Management (MAM,
[XEP-0313](http://xmpp.org/extensions/xep-0313.html)), your conversations can be
archived by your server and pulled down by the Kaiwa client on demand.

### Active Chat Syncing

Ever used multiple IM clients at once, or swapped clients, and end up with
disjointed conversations? Using Message Carbons
[(XEP-0280)](http://xmpp.org/extensions/xep-0280.html) all of your active
conversations will be synced to your Kaiwa client (and vice versa if you other
clients support carbons too).

### Reliable Connections

Sometimes you just lose your Internet connection, but with Stream Mangagement
[XEP-0198](http://xmpp.org/extensions/xep-0198.html) your current session can be
instantly resumed and caught up once you regain connection. Your messages will
show as gray until they've been confirmed as received by your server.

### Message Correction

Made a typo in a message? Using Message Correction
[XEP-0308](http://xmpp.org/extensions/xep-0308.html) you can just double tap the
up arrow to edit and send a corrected version. In other clients that support
correction, your last message will be updated in place and marked as edited.

### Timezone Indications

Working with someone in a different timezone? If the other person is using Kaiwa
or another client that supports Entity Time
([XEP-0202](http://xmpp.org/extensions/xep-0202.html)) you'll see a reminder
that they're 9 hours away where it's 4am and they're not likely to respond.

## Installing

First of all, clone the repository, install the dependencies and configure the
application:

```console
$ git clone https://github.com/ForNeVeR/kaiwa.git
$ cd kaiwa
$ npm install
$ cp config.example.json config.json # and edit the file
```

After that compile the application:

```console
$ npm run webpack # or `npm run deploy` if you want optimized version
```

And start the server:

```console
$ npm start
```

For the development purposes you may use

```console
$ npm run devel
```

It will continously monitor the `src` directory for changes and recompile
application on any change.

It you want to publish the compiled application somewhere else, feel free to
drop the `public` directory to any web server. You could need to setup MIME
types, please consult `src/server.js` if you need to.

*Note:* If you're running your own XMPP server, and aren't using something like
HAProxy to terminate SSL, then you might get errors in certain browsers trying
to establish a WebSocket connection because the XMPP server is requesting an
optional client certificate which makes the browser terminate the socket. To
resolve that, visit the XMPP over Websocket URL directly (eg,
`example.com:5281/xmpp-websocket` for Prosody) so that a client cert choice can
be made. After that, the Kaiwa client should connect fine.

## Configuration

Application configuration is taken from `config.json` file. Server configuration
is an object stored in the `server` property; correspondingly, the configuration
accessible from the client side goes to the `client` property.

`sasl` is optional parameter that can be used to configure the authentication
scheme. It can be a single string or a priority list. The default priorities as
defined by [stanza.io][] are `['external', 'scram-sha-1', 'digest-md5', 'plain',
'anonymous']`.

You may enable XMPP pings by setting the `keepalive.interval` (time between ping
attempts) and `server.keepalive.timeout` (timeout to close the connection if
pong was not received); both of these are in seconds. If `server.keepalive` is
not defined, then XMPP ping will use the default settings (with interval of 5
minutes).

Set `securePasswordStorage` to `false` if you want the users to save their
*passwords* in the browser local storage. In secure mode with SCRAM
authentication enabled Kaiwa will try to save only salted data. The secure mode
*will not work* with `digest-md5` authentication.

## Troubleshooting

Feel free to [report an issue][issues] or contact the maintainer directly
through [email][fornever-email] or [XMPP][fornever-xmpp].

## Contributing

Please note that we're using [tslint][] here. All the contributions should pass
the lint. Execute `npm run lint` to check current code.

[fornever-email]: mailto:friedrich@fornever.me
[fornever-xmpp]: xmpp:fornever@codingteam.org.ru
[issues]: https://github.com/ForNeVeR/kaiwa/issues
[master]: https://github.com/ForNeVeR/kaiwa/tree/master
[otalk]: https://github.com/otalk
[stanza.io]: https://github.com/otalk/stanza.io
