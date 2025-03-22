import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../utils/ErrorClass";
import prisma from "../config/dbConfig";
import { v4 as uuid } from "uuid";

const startStreamController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user_id = req.user?.userId;
    const checkExistingStream = await prisma.liveStreams.findFirst({
      where: {
        userId: Number(user_id),
      },
    });
    if (checkExistingStream) {
      return next(
        new ErrorHandler(
          "Already A stream is Going On Cant start Another, Our Infra doesnt Support It",
          429
        )
      );
    }
    const streamId = uuid();
    const insertNewStream = await prisma.liveStreams.create({
      data: {
        streamId,
        userId: Number(user_id),
      },
    });
    if (!insertNewStream) {
      return next(new ErrorHandler("Error Starting a New Stream", 400));
    }
    return res.status(201).json({
      success: true,
      message: "Stream Started Successfully",
      data: { streamId, userId: Number(user_id) },
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

export { startStreamController };
