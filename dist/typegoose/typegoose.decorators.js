"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InjectModel = void 0;
const common_1 = require("@nestjs/common");
const typegoose_utils_1 = require("./typegoose.utils");
const InjectModel = (model) => common_1.Inject(typegoose_utils_1.getModelToken(model.name));
exports.InjectModel = InjectModel;
