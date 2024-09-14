"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFilesToCloudinary = exports.getBase64 = void 0;
const cloudinaryConfig_1 = require("../config/cloudinaryConfig");
const uuid_1 = require("uuid");
// Function to convert file to base64
const getBase64 = (file) => `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
exports.getBase64 = getBase64;
// Function to upload files to Cloudinary
const uploadFilesToCloudinary = async (files = []) => {
    const uploadPromises = files.map((file) => {
        return new Promise((resolve, reject) => {
            cloudinaryConfig_1.cloudinary.uploader.upload((0, exports.getBase64)(file), { resource_type: "auto", public_id: (0, uuid_1.v4)() }, (error, result) => {
                if (error)
                    return reject(error);
                resolve(result);
            });
        });
    });
    try {
        const results = await Promise.all(uploadPromises);
        const formattedResult = results.map((result) => {
            return result.secure_url;
        });
        return formattedResult;
    }
    catch (error) {
        console.error("Error Uploading Files to Cloudinary:", error);
        throw new Error("Error Uploading Files to Cloudinary");
    }
};
exports.uploadFilesToCloudinary = uploadFilesToCloudinary;
