"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const registerSchema = zod_1.z.object({
    email: zod_1.z
        .string({ message: "Email is Required" })
        .email({ message: "Incorrect Email Format" }),
    username: zod_1.z
        .string({
        message: "Username is Required",
    })
        .min(3, "Username Should more than 3 characters"),
    password: zod_1.z.string({ message: "Password is Required" }),
    bio: zod_1.z
        .string()
        .min(3, { message: "Bio should be more than 3 characters" })
        .optional(),
});
exports.default = registerSchema;
