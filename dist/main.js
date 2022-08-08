"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serveS3Logger = exports.serveFSLogger = exports.serveDebugger = void 0;
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const regexEscape = (str) => {
    return str.replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\-]', 'g'), '\\$&');
};
const serveDebugger = (debuggerUrlPath = '/debug', debuggerBuildPath = './build') => {
    router.use(debuggerUrlPath, express_1.default.static(debuggerBuildPath));
    return router;
};
exports.serveDebugger = serveDebugger;
const serveFSLogger = (logsApiUrl = '/logs', logsPath = './logs') => {
    return router;
};
exports.serveFSLogger = serveFSLogger;
const serveS3Logger = (logsApiUrl, bucket = '', path = '') => {
    return router;
};
exports.serveS3Logger = serveS3Logger;
