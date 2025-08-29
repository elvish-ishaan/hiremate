import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "@repo/db";

interface JwtPayload {
  userId: string; // or number, depending on your schema
}

export const isLoggedIn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.headers, "headers........");
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Token not found",
      });
      return
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

    const { userId } = decoded as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User not found",
      });
      return
    }
    
    //attach userId to request
    req.userId = userId;

    next();
  } catch (error) {
    console.error(error, "JWT auth error");
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
    return
  }
};
