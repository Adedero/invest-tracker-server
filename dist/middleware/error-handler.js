"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
function default_1(err, req, res, next) {
    const message = err.message; //IS_PRODUCTION_ENV ? 'Something went wrong' : err.message
    res.status(500).json({ success: false, message });
    return;
}
