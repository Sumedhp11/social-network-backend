"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addPostController = void 0;
const dbConfig_1 = __importDefault(require("../config/dbConfig"));
const ErrorClass_1 = require("../utils/ErrorClass");
const uploadToCloudinary_1 = require("../utils/uploadToCloudinary");
const addPostValidation_1 = require("../validators/addPostValidation");
const zod_1 = require("zod");
const addPostController = async (req, res, next) => {
    try {
        const { body, file } = (0, addPostValidation_1.validateRequest)(req);
        if (!file)
            return next(new ErrorClass_1.ErrorHandler("Content Not provided", 400));
        const content_url = await (0, uploadToCloudinary_1.uploadFilesToCloudinary)([file]);
        if (!content_url || content_url.length === 0) {
            return next(new Error("Error while uploading content"));
        }
        const newPost = await dbConfig_1.default.post.create({
            data: {
                user_id: Number(body.user_id),
                description: body.description,
                content: content_url[0],
            },
        });
        return res.status(200).json({
            success: true,
            message: "Posted successfully",
            data: newPost,
        });
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            return res.status(422).json({
                success: false,
                message: "Invalid data input",
                errors: error.issues.map((e) => ({
                    [e.path[0]]: e.message,
                })),
            });
        }
        return next(new ErrorClass_1.ErrorHandler("Internal Server Error", 500));
    }
};
exports.addPostController = addPostController;
