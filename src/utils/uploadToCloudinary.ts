import { cloudinary } from "../config/cloudinaryConfig";
import { v4 as uuidv4 } from "uuid";

// Function to convert file to base64
export const getBase64 = (file: Express.Multer.File) =>
  `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

// Function to upload files to Cloudinary
const uploadFilesToCloudinary = async (files: Express.Multer.File[] = []) => {
  const uploadPromises = files.map((file) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        getBase64(file),
        { resource_type: "auto", public_id: uuidv4() },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
    });
  });

  try {
    const results = await Promise.all(uploadPromises);
    const formattedResult = results.map((result: any) => {
      return result.secure_url;
    });
    return formattedResult;
  } catch (error) {
    console.error("Error Uploading Files to Cloudinary:", error);
    throw new Error("Error Uploading Files to Cloudinary");
  }
};

export { uploadFilesToCloudinary };
