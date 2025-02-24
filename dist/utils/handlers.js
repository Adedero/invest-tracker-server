"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailHandler = exports.changePasswordHandler = exports.countHandler = exports.deleteHandler = exports.putHandler = exports.postHandler = exports.getHandler = exports.createNotification = void 0;
const database_config_1 = require("../config/database.config");
const repository_1 = __importDefault(require("./repository"));
const helpers_1 = require("./helpers");
const argon = __importStar(require("argon2"));
const logger_1 = __importDefault(require("./logger"));
const notification_model_1 = require("../models/notification.model");
const mail_1 = require("./mail");
const zod_1 = require("zod");
const account_model_1 = require("../models/account.model");
const emails_1 = require("./emails");
const createNotification = (data, manager) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const notifications = yield (0, repository_1.default)('Notification');
        let repo;
        if (manager) {
            repo = manager.withRepository(notifications.model);
        }
        else {
            repo = notifications.model;
        }
        const notification = new notification_model_1.Notification();
        notification.userId = data.userId;
        notification.title = data.title;
        notification.description = data.description;
        notification.isRead = (_a = data.isRead) !== null && _a !== void 0 ? _a : false;
        if (data.icon)
            notification.icon = data.icon;
        if (data.user)
            notification.user = data.user;
        yield repo.save(notification);
        return null;
    }
    catch (error) {
        const err = error;
        return err;
    }
});
exports.createNotification = createNotification;
const getHandler = (model, hooks) => {
    return (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const repository = yield (0, repository_1.default)(model);
        const { key, limit, skip, relation, field, sort, where } = req.query;
        // Determine the correct ID field
        const idField = key ? key.toString() : 'id';
        const id = (_a = req.params[idField]) !== null && _a !== void 0 ? _a : req.params.id;
        // Initialize the query object
        let query = id
            ? { [idField]: id }
            : undefined;
        // Process the `where` parameter if it exists
        if (where) {
            const whereParams = Array.isArray(where) ? where : [where]; // Ensure `where` is always an array
            whereParams.forEach((w) => {
                const [key, rawValue] = w.toString().split(',');
                if (key && rawValue) {
                    let value = rawValue.trim();
                    // Attempt to convert the value to the appropriate type
                    if (value === 'true' || value === 'false') {
                        value = value === 'true'; // Convert to boolean
                    }
                    else if (!isNaN(Number(value))) {
                        value = Number(value); // Convert to number if it's numeric
                    }
                    // Merge the parsed condition into the query object
                    const condition = { [key.trim()]: value };
                    query = query ? Object.assign(Object.assign({}, query), condition) : condition;
                }
            });
        }
        // Parse relations
        const parsedRelation = relation ? relation.toString().split(',') : [];
        const selectedRelations = parsedRelation.length
            ? Object.fromEntries(parsedRelation.map((rel) => [rel, true]))
            : undefined;
        // Parse selected fields
        const selectedFields = field ? field.toString().split(',') : undefined;
        // Handle sorting
        const sortOrder = {};
        if (sort) {
            const sortParams = Array.isArray(sort) ? sort : [sort];
            sortParams.forEach((s) => {
                const [sortField, order] = s.toString().split(',');
                if (sortField &&
                    ((order === null || order === void 0 ? void 0 : order.toUpperCase()) === 'ASC' || (order === null || order === void 0 ? void 0 : order.toUpperCase()) === 'DESC')) {
                    sortOrder[sortField] = order.toUpperCase();
                }
            });
        }
        // Fetch data from the repository
        const [error, result] = yield repository[id ? 'findOne' : 'findAll']({
            where: query,
            take: id ? 1 : limit ? parseInt(limit.toString(), 10) : undefined,
            skip: skip ? parseInt(skip.toString(), 10) : undefined,
            relations: selectedRelations,
            select: selectedFields,
            order: Object.keys(sortOrder).length ? sortOrder : undefined
        });
        if (error) {
            (0, helpers_1.sendResponse)(res, 500, error.message);
            return;
        }
        if (!result) {
            (0, helpers_1.sendResponse)(res, 404, 'Data not found');
            return;
        }
        if (hooks === null || hooks === void 0 ? void 0 : hooks.onBeforeEnd) {
            yield hooks.onBeforeEnd(req, res);
        }
        (0, helpers_1.sendResponse)(res, 200, { data: result });
        return;
    });
};
exports.getHandler = getHandler;
const postHandler = (model, hooks) => {
    return (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { data, addUserRelation } = req.body;
        if (!data || Object.keys(data).length === 0) {
            (0, helpers_1.sendResponse)(res, 400, 'No data provided');
            return;
        }
        const { dataSource } = yield (0, database_config_1.initDataSource)();
        try {
            yield dataSource.manager.transaction((manager) => __awaiter(void 0, void 0, void 0, function* () {
                var _a, _b;
                // Fetch the repository dynamically using your utility
                const repository = yield (0, repository_1.default)(model);
                const repositoryInstance = manager.withRepository(repository.model);
                // Create and save the record
                const created = repositoryInstance.create(data);
                if (model === 'User') {
                    const account = new account_model_1.Account();
                    created['account'] = account;
                    created.password = yield argon.hash((_a = data.password) !== null && _a !== void 0 ? _a : '');
                }
                yield manager.save(created);
                if (addUserRelation) {
                    // Fetch the User repository dynamically
                    const userRepository = yield (0, repository_1.default)('User');
                    const userInstance = manager.withRepository(userRepository.model);
                    // Find the related user
                    const user = yield userInstance.findOne({
                        where: { id: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id }
                    });
                    if (!user) {
                        throw new Error('User not found');
                    }
                    // Add the user relation
                    created['user'] = user;
                    // Save the record with the new relation
                    yield manager.save(created);
                }
                if (hooks === null || hooks === void 0 ? void 0 : hooks.onBeforeEnd) {
                    yield hooks.onBeforeEnd(req, res);
                }
                // Send a successful response with the created data
                (0, helpers_1.sendResponse)(res, 201, { data: created });
            }));
        }
        catch (error) {
            logger_1.default.error('Transaction failed:', error);
            (0, helpers_1.sendResponse)(res, 500, `Failed to create ${model}: ${error.message}`);
        }
    });
};
exports.postHandler = postHandler;
const putHandler = (model, hooks) => {
    return (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const ctx = { req, res };
        const { data } = req.body;
        if (!data || Object.keys(data).length === 0) {
            (0, helpers_1.sendResponse)(res, 400, 'No data provided');
            return;
        }
        const { id } = req.params;
        const { where } = req.query;
        if (!id && !where) {
            (0, helpers_1.sendResponse)(res, 400, 'Invalid request query');
            return;
        }
        let query = id ? { id: id } : {};
        // Process the `where` parameter if it exists
        if (where) {
            const whereParams = Array.isArray(where) ? where : [where]; // Ensure `where` is always an array
            whereParams.forEach((w) => {
                const [key, rawValue] = w.toString().split(',');
                if (key && rawValue) {
                    let value = rawValue.trim();
                    // Attempt to convert the value to the appropriate type
                    if (value === 'true' || value === 'false') {
                        value = value === 'true'; // Convert to boolean
                    }
                    else if (!isNaN(Number(value))) {
                        value = Number(value); // Convert to number if it's numeric
                    }
                    // Merge the parsed condition into the query object
                    const condition = { [key.trim()]: value };
                    query = query ? Object.assign(Object.assign({}, query), condition) : condition;
                }
            });
        }
        const { dataSource } = yield (0, database_config_1.initDataSource)();
        try {
            yield dataSource.manager.transaction((manager) => __awaiter(void 0, void 0, void 0, function* () {
                // Fetch the repository dynamically using your utility
                const repository = yield (0, repository_1.default)(model);
                const repositoryInstance = manager.withRepository(repository.model);
                let updatedData = data;
                if (hooks === null || hooks === void 0 ? void 0 : hooks.onBeforeUpdate) {
                    const result = yield hooks.onBeforeUpdate(ctx, data);
                    if (result) {
                        updatedData = result;
                    }
                }
                // Create and save the record
                const updated = yield repositoryInstance.update(query, updatedData);
                // Send a successful response with the updated data
                if (hooks === null || hooks === void 0 ? void 0 : hooks.onBeforeEnd) {
                    yield hooks.onBeforeEnd(req, res);
                }
                (0, helpers_1.sendResponse)(res, 201, { data: updated });
            }));
        }
        catch (error) {
            logger_1.default.error('Transaction failed:', error);
            (0, helpers_1.sendResponse)(res, 500, `Failed to create ${model}: ${error.message}`);
        }
    });
};
exports.putHandler = putHandler;
const deleteHandler = (model, hooks) => {
    return (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const { where } = req.query;
        if (!id && !where) {
            (0, helpers_1.sendResponse)(res, 400, 'Invalid request query');
            return;
        }
        let query = id ? { id: id } : {};
        // Process the `where` parameter if it exists
        if (where) {
            const whereParams = Array.isArray(where) ? where : [where]; // Ensure `where` is always an array
            whereParams.forEach((w) => {
                const [key, rawValue] = w.toString().split(',');
                if (key && rawValue) {
                    let value = rawValue.trim();
                    // Attempt to convert the value to the appropriate type
                    if (value === 'true' || value === 'false') {
                        value = value === 'true'; // Convert to boolean
                    }
                    else if (!isNaN(Number(value))) {
                        value = Number(value); // Convert to number if it's numeric
                    }
                    // Merge the parsed condition into the query object
                    const condition = { [key.trim()]: value };
                    query = query ? Object.assign(Object.assign({}, query), condition) : condition;
                }
            });
        }
        const repository = yield (0, repository_1.default)(model);
        try {
            const result = yield repository.model.delete(query);
            const msg = result.affected === 1 ? 'Item' : 'Items';
            if (hooks === null || hooks === void 0 ? void 0 : hooks.onBeforeEnd) {
                yield hooks.onBeforeEnd(req, res);
            }
            (0, helpers_1.sendResponse)(res, 200, `${result.affected} ${msg} deleted.`);
        }
        catch (error) {
            logger_1.default.error('Failed to delete item', error);
            (0, helpers_1.sendResponse)(res, 500, `Failed to create ${model}: ${error.message}`);
        }
    });
};
exports.deleteHandler = deleteHandler;
const countHandler = (model) => {
    return (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { where } = req.query;
        // Initialize the query object
        let query = {};
        // Process the `where` parameter if it exists
        if (where) {
            const whereParams = Array.isArray(where) ? where : [where]; // Ensure `where` is always an array
            whereParams.forEach((w) => {
                const [key, rawValue] = w.toString().split(',');
                if (key && rawValue) {
                    let value = rawValue.trim();
                    // Attempt to convert the value to the appropriate type
                    if (value === 'true' || value === 'false') {
                        value = value === 'true'; // Convert to boolean
                    }
                    else if (!isNaN(Number(value))) {
                        value = Number(value); // Convert to number if it's numeric
                    }
                    // Merge the parsed condition into the query object
                    const condition = { [key.trim()]: value };
                    query = query ? Object.assign(Object.assign({}, query), condition) : condition;
                }
            });
        }
        const repository = yield (0, repository_1.default)(model);
        try {
            const result = yield repository.model.count({
                where: query
            });
            (0, helpers_1.sendResponse)(res, 200, { count: result });
        }
        catch (error) {
            logger_1.default.error('Failed to count items', error);
            (0, helpers_1.sendResponse)(res, 500, `Failed to count items: ${error.message}`);
        }
    });
};
exports.countHandler = countHandler;
const changePasswordHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { data } = req.body;
    if (!data || Object.keys(data).length === 0) {
        (0, helpers_1.sendResponse)(res, 400, 'No data provided');
        return;
    }
    const { id } = req.params;
    if (!id) {
        (0, helpers_1.sendResponse)(res, 400, 'No id provided');
        return;
    }
    try {
        const users = yield (0, repository_1.default)('User');
        const user = yield users.model.findOne({
            where: { id },
            select: ['id', 'password']
        });
        if (!user) {
            (0, helpers_1.sendResponse)(res, 404, 'User not found');
            return;
        }
        const { p1, p2, p3 } = data;
        if (p2 === p1) {
            (0, helpers_1.sendResponse)(res, 400, 'Your new password cannot be the same with your current password.');
            return;
        }
        const isMatch = yield argon.verify(user.password, p1);
        if (!isMatch) {
            (0, helpers_1.sendResponse)(res, 400, 'Incorrect old password. Enter the correct password and try again');
            return;
        }
        if (p2.length < 8) {
            (0, helpers_1.sendResponse)(res, 400, 'Your new password must contain at least 8 characters');
            return;
        }
        if (p3 !== p2) {
            (0, helpers_1.sendResponse)(res, 400, 'Passwords do not match. Please, confirm your new password and try again.');
            return;
        }
        const hash = yield argon.hash(p2);
        user.password = hash;
        yield users.model.save(user);
        yield (0, exports.createNotification)({
            userId: user.id,
            title: 'Change of password',
            description: 'Your password was changed successfully. If you did not do this or you suspect your account has been compromised, please contact support immediately.',
            user: user
        });
        (0, helpers_1.sendResponse)(res, 200, 'Password changed successfully.');
    }
    catch (error) {
        (0, helpers_1.sendResponse)(res, 500, `Failed to change password: ${error.message}`);
    }
});
exports.changePasswordHandler = changePasswordHandler;
const emailHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, text, data } = req.body;
    if (!email || (!text && !data)) {
        (0, helpers_1.sendResponse)(res, 400, 'Email, subject, and content are required');
        return;
    }
    const { subject, name, info, intro, outro, footer } = data;
    if (data) {
        const Schema = zod_1.z.object({
            email: zod_1.z
                .string({ message: 'Email is required' })
                .email({ message: 'Invalid email provided' }),
            subject: zod_1.z.string({ message: 'Email Subject is required' }),
            name: zod_1.z.string({ message: "User's name is required" }),
            intro: zod_1.z.string({ message: 'Email content is required' })
        });
        const result = Schema.safeParse({ email, subject, name, intro, outro });
        if (!result.success) {
            (0, helpers_1.sendResponse)(res, 400, result.error.errors[0].message);
            return;
        }
    }
    const error = yield (0, mail_1.sendEmail)({
        toEmail: email,
        subject,
        text,
        html: (0, emails_1.emailTemplate)({ subject, name, intro, info, outro, footer })
    });
    if (error) {
        (0, helpers_1.sendResponse)(res, 400, error.message);
        return;
    }
    (0, helpers_1.sendResponse)(res, 200, 'Email sent successfully');
});
exports.emailHandler = emailHandler;
