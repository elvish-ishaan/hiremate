import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "@repo/db";

interface JwtPayload {
  userId: string; // or number, depending on your schema
}

export const isLoggedIn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token not found",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

    const { userId } = decoded as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }
    
    //attach userId to request
    req.userId = userId;

    next();
  } catch (error) {
    console.error(error, "JWT auth error");
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
