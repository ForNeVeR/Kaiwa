interface Window {
    SERVER_CONFIG: {
        isDev: boolean;
        name: string;
        baseUrl: string;
        domain: string;
        port: number;
        wss: string;
        sasl: string;
        securePasswordStorage: boolean;
        muc: string;
        startup: string;
        admin: string;
        keepalive: {
            interval: number;
            timeout: number;
        }
    }
}
