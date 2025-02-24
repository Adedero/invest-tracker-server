"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getRepository;
const database_config_1 = require("../config/database.config");
function getRepository(modelName) {
    return __awaiter(this, void 0, void 0, function* () {
        const { dataSource, model } = yield (0, database_config_1.initDataSource)();
        const repository = model[modelName];
        if (!repository) {
            throw new Error(`Repository ${modelName} not found`);
        }
        return {
            DataSource: dataSource,
            model: repository,
            findAll(options) {
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        const result = yield repository.find(options);
                        return [null, result];
                    }
                    catch (error) {
                        return [error, null];
                    }
                });
            },
            findOne(options) {
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        const result = yield repository.findOne(options);
                        return [null, result];
                    }
                    catch (error) {
                        return [error, null];
                    }
                });
            },
            findAndCount(options) {
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        const result = yield repository.findAndCount(options);
                        return [null, result];
                    }
                    catch (error) {
                        return [error, null];
                    }
                });
            },
            create(object) {
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        const newObject = repository.create(object);
                        yield repository.save(newObject);
                        return [null, newObject];
                    }
                    catch (error) {
                        return [error, null];
                    }
                });
            },
            save(entity, options) {
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        const result = yield repository.save(entity, options);
                        return [null, result];
                    }
                    catch (error) {
                        return [error, null];
                    }
                });
            },
            //remove and soft remove
            remove(options_1) {
                return __awaiter(this, arguments, void 0, function* (options, soft = false) {
                    try {
                        if (soft) {
                            const result = yield repository.softRemove(options);
                            return [null, result];
                        }
                        const result = yield repository.remove(options);
                        return [null, result];
                    }
                    catch (error) {
                        return [error, null];
                    }
                });
            },
            recover(options) {
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        const result = yield repository.recover(options);
                        return [null, result];
                    }
                    catch (error) {
                        return [error, null];
                    }
                });
            },
            insert(options) {
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        const result = yield repository.insert(options);
                        return [null, result];
                    }
                    catch (error) {
                        return [error, null];
                    }
                });
            },
            update(options, data) {
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        const result = yield repository.update(options, data);
                        return [null, result];
                    }
                    catch (error) {
                        return [error, null];
                    }
                });
            },
            upsert(data, options) {
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        const result = yield repository.upsert(data, options);
                        return [null, result];
                    }
                    catch (error) {
                        return [error, null];
                    }
                });
            },
            delete(options_1) {
                return __awaiter(this, arguments, void 0, function* (options, soft = false) {
                    try {
                        if (soft) {
                            const result = yield repository.softDelete(options);
                            return [null, result];
                        }
                        const result = yield repository.delete(options);
                        return [null, result];
                    }
                    catch (error) {
                        return [error, null];
                    }
                });
            },
            restore(options) {
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        const result = yield repository.restore(options);
                        return [null, result];
                    }
                    catch (error) {
                        return [error, null];
                    }
                });
            }
        };
    });
}
