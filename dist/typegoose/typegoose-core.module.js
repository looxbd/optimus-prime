"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var TypegooseCoreModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypegooseCoreModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const typegoose_1 = require("@typegoose/typegoose");
const data_1 = require("@typegoose/typegoose/lib/internal/data");
const mongoose = require("mongoose");
const typegoose_constants_1 = require("./typegoose.constants");
const typegoose_utils_1 = require("./typegoose.utils");
let TypegooseCoreModule = TypegooseCoreModule_1 = class TypegooseCoreModule {
    constructor(connectionName, moduleRef) {
        this.connectionName = connectionName;
        this.moduleRef = moduleRef;
    }
    static forRoot(uri, options = {}) {
        const connectionName = typegoose_utils_1.getConnectionToken(options.connectionName);
        const connectionNameProvider = {
            provide: typegoose_constants_1.TYPEGOOSE_CONNECTION_NAME,
            useValue: connectionName,
        };
        const connectionProvider = {
            provide: connectionName,
            useFactory: () => mongoose.createConnection(uri, options),
        };
        return {
            module: TypegooseCoreModule_1,
            providers: [connectionProvider, connectionNameProvider],
            exports: [connectionProvider],
        };
    }
    static forRootAsync(options) {
        const connectionName = typegoose_utils_1.getConnectionToken(options.connectionName);
        const connectionNameProvider = {
            provide: typegoose_constants_1.TYPEGOOSE_CONNECTION_NAME,
            useValue: connectionName,
        };
        const connectionProvider = {
            provide: connectionName,
            useFactory: (typegooseModuleOptions) => {
                const { uri } = typegooseModuleOptions, typegooseOptions = __rest(typegooseModuleOptions, ["uri"]);
                return mongoose.createConnection(uri, typegooseOptions);
            },
            inject: [typegoose_constants_1.TYPEGOOSE_MODULE_OPTIONS],
        };
        const asyncProviders = this.createAsyncProviders(options);
        return {
            module: TypegooseCoreModule_1,
            imports: options.imports,
            providers: [
                ...asyncProviders,
                connectionProvider,
                connectionNameProvider,
            ],
            exports: [connectionProvider],
        };
    }
    static createAsyncProviders(options) {
        if (options.useExisting || options.useFactory) {
            return [this.createAsyncOptionsProvider(options)];
        }
        return [
            this.createAsyncOptionsProvider(options),
            {
                provide: options.useClass,
                useClass: options.useClass,
            },
        ];
    }
    static createAsyncOptionsProvider(options) {
        if (options.useFactory) {
            return {
                provide: typegoose_constants_1.TYPEGOOSE_MODULE_OPTIONS,
                useFactory: options.useFactory,
                inject: options.inject || [],
            };
        }
        return {
            provide: typegoose_constants_1.TYPEGOOSE_MODULE_OPTIONS,
            useFactory: (optionsFactory) => __awaiter(this, void 0, void 0, function* () { return yield optionsFactory.createTypegooseOptions(); }),
            inject: [options.useExisting || options.useClass],
        };
    }
    onApplicationShutdown() {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = this.moduleRef.get(this.connectionName);
            if (connection) {
                yield connection.close();
                [...data_1.models.entries()]
                    .reduce((array, [key, model]) => {
                    if (model.db === connection) {
                        array.push(key);
                    }
                    return array;
                }, [])
                    .forEach(typegoose_1.deleteModel);
            }
        });
    }
};
TypegooseCoreModule = TypegooseCoreModule_1 = __decorate([
    common_1.Global(),
    common_1.Module({}),
    __param(0, common_1.Inject(typegoose_constants_1.TYPEGOOSE_CONNECTION_NAME)),
    __metadata("design:paramtypes", [String, core_1.ModuleRef])
], TypegooseCoreModule);
exports.TypegooseCoreModule = TypegooseCoreModule;
