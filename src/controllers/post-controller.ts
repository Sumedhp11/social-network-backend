import { NextFunction, Request, Response } from "express";
import prisma from "../config/dbConfig";
import { ErrorHandler } from "../utils/ErrorClass";
import { uploadFilesToCloudinary } from "../utils/uploadToCloudinary";
import { validateRequest } from "../validators/addPostValidation";
import { ZodError } from "zod";

const addPostController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body, file } = validateRequest(req);
    if (!file) return next(new ErrorHandler("Content Not provided", 400));
    const content_url = await uploadFilesToCloudinary([file]);

    if (!content_url || content_url.length === 0) {
      return next(new Error("Error while uploading content"));
    }

    const newPost = await prisma.post.create({
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
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(422).json({
        success: false,
        message: "Invalid data input",
        errors: error.issues.map((e) => ({
          [e.path[0]]: e.message,
        })),
      });
    }
    console.log(error);

    return next(new ErrorHandler("Internal Server Error", 500));
  }
};
export { addPostController };
