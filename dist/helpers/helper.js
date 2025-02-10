"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractImagePublicId = void 0;
exports.generateToken = generateToken;
exports.getSockets = getSockets;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const socket_1 = require("../socket");
function generateToken(payload, ttl = "30d", isRefresh = true) {
    const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
        expiresIn: ttl,
    });
    return token;
}
function getSockets({ users }) {
    const sockets = users.map((user) => socket_1.userSocketIDs.get(user));
    return sockets;
}
const extractImagePublicId = (data) => {
    const parts = data.split("/");
    return parts.slice(-2, -1) + "/" + parts.slice(-1)[0].split(".")[0];
};
exports.extractImagePublicId = extractImagePublicId;
