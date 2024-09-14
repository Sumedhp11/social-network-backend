"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userLoginValidation = void 0;
const zod_1 = require("zod");
exports.userLoginValidation = zod_1.z.object({
    username: zod_1.z
        .string({ message: "Username is Required" })
        .min(3, { message: "Username should be atleast 3 characters" }),
    password: zod_1.z
        .string({ message: "Password is Required" })
        .min(6, { message: "Password should be atleast 6 characters" }),
});
