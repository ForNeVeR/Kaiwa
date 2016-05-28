window.SERVER_CONFIG = {
    "name": "Kaiwa",
    "domain": "example.com",
    "port": 8000,
    "wss": "wss://example.com:5281/xmpp-websocket/",
    "sasl": "scram-sha-1",
    "securePasswordStorage": true,
    "muc": "chat.example.com",
    "startup": "groupchat/room%40chat.example.com",
    "admin": "admin",
    "keepalive": {
        "interval": 45,
        "timeout": 15
    }
};
