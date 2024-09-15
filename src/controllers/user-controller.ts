import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import jwt, { JsonWebTokenError, JwtPayload } from "jsonwebtoken";
import { ZodError } from "zod";
import prisma from "../config/dbConfig";
import { SendMail } from "../config/nodemailerConfig";
import { token_name } from "../helpers/constants";
import { generateToken } from "../helpers/helper";
import { ErrorHandler } from "../utils/ErrorClass";
import { uploadFilesToCloudinary } from "../utils/uploadToCloudinary";
import { userLoginValidation } from "../validators/userLoginValidation";
import registerSchema from "../validators/userRegisterValidator";

const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = req.body;
    const payload = registerSchema.parse(body);
    const avatar = req?.file;

    let user = await prisma.user.findFirst({
      where: {
        OR: [{ email: payload.email }, { username: payload.username }],
      },
    });
    if (user) {
      return next(
        new ErrorHandler("User Already Exists with Email or Username", 400)
      );
    }

    let avatar_url;
    if (avatar) {
      avatar_url = await uploadFilesToCloudinary([avatar]);
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10);
    const verificationCode = Math.floor(10000 + Math.random() * 90000);
    const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000);

    const newUser = await prisma.user.create({
      data: {
        email: payload.email,
        username: payload.username,
        password: hashedPassword,
        ...(avatar_url && { avatarUrl: avatar_url[0] }),
        verification_token: verificationCode,
        verification_token_expiry: verificationExpiry,
        ...(payload.bio && { bio: payload.bio }),
      },
    });

    await SendMail(
      payload.email,
      "Verify Your Account!",
      verificationCode,
      "Verify Your Account"
    );
    return res.status(200).json({
      success: true,
      message: "User Registered Successfully",
      data: newUser,
    });
  } catch (error) {
    console.error(error);
    if (error instanceof ZodError) {
      return res.status(422).json({
        success: false,
        message: "Invalid Data Inputed",
        error: error.issues.map((e) => ({
          [e.path[0]]: e.message,
        })),
      });
    }
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

const verifyUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { verification_code } = req.body;
    if (!verification_code)
      return next(new ErrorHandler("provide Verification Code", 400));
    const user = await prisma.user.findFirst({
      where: {
        verification_token: Number(verification_code),
      },
    });
    if (!user) return next(new ErrorHandler("Invalid Verification Code", 400));

    if (
      !user.verification_token_expiry ||
      user.verification_token_expiry.getTime() < Date.now()
    ) {
      await prisma.user.delete({
        where: {
          id: user.id,
        },
      });
      return next(
        new ErrorHandler(
          "Verification Code Expired. Please Register Again.",
          400
        )
      );
    }
    await prisma.user.update({
      where: {
        email: user.email,
      },
      data: {
        isVerified: true,
        verification_token: null,
        verification_token_expiry: null,
      },
    });
    return res.status(200).json({
      success: true,
      message: `${user.username} Verified Sucessfully`,
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = req.body;
    const payload = userLoginValidation.parse(body);
    const user = await prisma.user.findUnique({
      where: {
        username: payload.username,
      },
    });
    if (!user)
      return next(new ErrorHandler("No User Found with this username", 404));
    if (!user.isVerified) {
      await prisma.user.delete({
        where: {
          username: payload.username,
        },
      });
      return next(
        new ErrorHandler(
          `${payload.username} is Not Verified,Register Again`,
          400
        )
      );
    }
    const isMatch = await bcrypt.compare(payload.password, user.password!);
    if (!isMatch) return next(new ErrorHandler("Invalid Credentials", 400));
    const refreshToken = generateToken(
      { userId: user.id, email: user.email },
      "30d",
      true
    );
    await prisma.user.update({
      where: {
        username: user.username,
      },
      data: {
        refresh_token: refreshToken,
      },
    });
    const accesstoken = generateToken(
      {
        userId: user.id,
        email: user.email,
      },
      "7d",
      false
    );

    return res
      .cookie(token_name, refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        sameSite: "none",
        httpOnly: true,
        secure: true,
      })
      .status(200)
      .json({
        success: true,
        message: `${user.username} Welcome Back`,
        data: {
          userId: user.id,
          email: user.email,
          username: user.username,
          access_token: accesstoken,
        },
      });
  } catch (error) {
    console.log(error);
    if (error instanceof ZodError) {
      return res.status(422).json({
        success: false,
        message: "Invalid Data Inputed",
        error: error.issues.map((e) => ({
          [e.path[0]]: e.message,
        })),
      });
    }
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};
const refreshAccessTokenController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies[token_name];
    if (!refreshToken)
      return next(new ErrorHandler("Provide refresh-token", 401));
    const decodedData = jwt.verify(refreshToken, process.env.JWT_SECRET!);

    if (typeof decodedData !== "object" || !decodedData) {
      return res.status(403).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    const { userId, email } = decodedData as JwtPayload;
    const newAccessToken = generateToken(
      {
        userId: userId as number,
        email: email as string,
      },
      "7d",
      false
    );
    return res.status(200).json({
      success: true,
      message: "Access Token Generated Successfully",
      data: {
        access_token: newAccessToken,
      },
    });
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};
const googleLoginController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, username } = req.body;

    if (!email || !username)
      return next(new ErrorHandler("Email or Username is Missing", 400));

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Create new user if they don't already exist
      user = await prisma.user.create({
        data: {
          email: email,
          username: username,
          isVerified: true, // Automatically verify since it's from Google
        },
      });
    }

    // Generate refresh token and access token using your own mechanism
    const refreshToken = generateToken(
      { userId: user.id, email: user.email },
      "30d", // Example expiration time
      true // Marks as refresh token
    );

    const accessToken = generateToken(
      { userId: user.id, email: user.email },
      "7d" // Example expiration time
    );

    // Store the refresh token in the database (if you need to)
    await prisma.user.update({
      where: { email: user.email },
      data: { refresh_token: refreshToken },
    });

    // Return tokens and user info
    return res
      .cookie("refreshToken", refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        sameSite: "none",
        httpOnly: true,
        secure: true,
      })
      .status(200)
      .json({
        success: true,
        message: `Welcome ${user.username}`,
        data: {
          userId: user.id,
          email: user.email,
          username: user.username,
          access_token: accessToken,
        },
      });
  } catch (error) {
    console.error("Error during Google login:", error);
    return next(new ErrorHandler("Internal Server Error", 500));
  }
};

export {
  loginController,
  refreshAccessTokenController,
  registerController,
  verifyUserController,
  googleLoginController,
};
