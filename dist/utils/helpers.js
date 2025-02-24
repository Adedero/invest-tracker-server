"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.atob = exports.btoa = exports.toTitleCase = exports.sendResponse = void 0;
exports.isWithinOneHour = isWithinOneHour;
const constants_1 = require("./constants");
const sendResponse = (res, status, data) => {
    const success = status < 400;
    const payload = data
        ? typeof data === 'string'
            ? { message: data }
            : data
        : {};
    if (status >= 500 && constants_1.IS_PRODUCTION_ENV) {
        payload.message =
            "Something went wrong and we're wroking to fix it. Please, try again later";
    }
    res.status(status).json(Object.assign({ success }, payload));
    return;
};
exports.sendResponse = sendResponse;
function isWithinOneHour(date) {
    const parsedDate = new Date(date);
    const now = new Date();
    const oneHourAgo = now.getTime() - 60 * 60 * 1000;
    return (parsedDate.getTime() >= oneHourAgo && parsedDate.getTime() <= now.getTime());
}
const toTitleCase = (text) => {
    if (!text) {
        return '';
    }
    const parts = text.split(' ');
    return parts
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
};
exports.toTitleCase = toTitleCase;
const btoa = (str) => Buffer.from(str, 'binary').toString('base64');
exports.btoa = btoa;
const atob = (b64Encoded) => Buffer.from(b64Encoded, 'base64').toString('binary');
exports.atob = atob;
