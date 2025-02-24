"use strict";
/**
- Environment variable utility module.
-
- This module loads environment variables from a .env file using dotenv,
- and provides methods for getting, setting, and checking the existence of
- environment variables.
-
- @module env
*/
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
/**
- Load environment variables from a .env file.
-
*/
(0, dotenv_1.config)();
/**
- Environment variable utility object.
-
- @typedef {Object} Env
- @property {Function} get - Get the value of an environment variable.
- @property {Function} set - Set the value of an environment variable.
- @property {Function} has - Check if an environment variable exists.
*/
const env = {
    /**
  - Get the value of an environment variable.
  -
  - If the variable is not set, returns the provided default value.
  -
  - @param {string} key - The name of the environment variable.
  - @param {*} [defaultValue] - The default value to return if the variable is not set.
  - @returns {*} The value of the environment variable, or the default value.
  */
    get: (key, defaultValue) => { var _a, _b; return (_b = (_a = process.env[key]) !== null && _a !== void 0 ? _a : defaultValue) !== null && _b !== void 0 ? _b : ''; },
    /**
  - Set the value of an environment variable.
  -
  - @param {string} key - The name of the environment variable.
  - @param {*} value - The value to set for the environment variable.
  */
    set: (key, value) => {
        process.env[key] = value;
    },
    /**
  - Check if an environment variable exists.
  -
  - @param {string} key - The name of the environment variable.
  - @returns {boolean} True if the variable exists, false otherwise.
  */
    has: (key) => Object.prototype.hasOwnProperty.call(process.env, key)
};
exports.default = env;
