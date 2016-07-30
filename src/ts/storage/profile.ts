// SCHEMA
//    jid: string
//    name: string
//    avatarID: string
//    status: string
//    rosterVer: string

export default class ProfileStorage {
    constructor(public storage) {}

    setup (db) {
        if (db.objectStoreNames.contains('profiles')) {
            db.deleteObjectStore('profiles');
        }
        const store = db.createObjectStore('profiles', {
            keyPath: 'jid'
        });
    }

    transaction (mode) {
        const trans = this.storage.db.transaction('profiles', mode);
        return trans.objectStore('profiles');
    }

    set (profile, cb) {
        cb = cb || function () {};
        const request = this.transaction('readwrite').put(profile);
        request.onsuccess = function () {
            cb(false, profile);
        };
        request.onerror = cb;
    }

    get (id, cb) {
        cb = cb || function () {};
        if (!id) {
            return cb('not-found');
        }
        const request = this.transaction('readonly').get(id);
        request.onsuccess = function (e) {
            const res = request.result;
            if (res === undefined) {
                return cb('not-found');
            }
            cb(false, request.result);
        };
        request.onerror = cb;
    }

    remove (id, cb) {
        cb = cb || function () {};
        const request = this.transaction('readwrite')['delete'](id);
        request.onsuccess = function (e) {
            cb(false, request.result);
        };
        request.onerror = cb;
    }

    value = ProfileStorage;
}
