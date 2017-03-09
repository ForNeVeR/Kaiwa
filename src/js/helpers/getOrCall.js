"use strict";

// get a property that's a function or direct property
module.exports = function (obj, propName) {
    return (obj[propName] instanceof Function) ?
        obj[propName]() : obj[propName] || '';
};
