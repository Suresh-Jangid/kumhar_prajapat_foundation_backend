import { Router, Request, Response } from "express";
import { db } from "../db/client.js";

export const usersRouter = Router();

// GET /api/users - List all users
usersRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const users = await db.user.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/users/:id - Get user by ID
usersRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const user = await db.user.findUnique({
      where: { id },
      include: { posts: true },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/users - Create user
usersRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;

    if (!email || typeof email !== "string") {
      return res
        .status(400)
        .json({ success: false, error: "Valid email is required" });
    }

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, error: "User with this email already exists" });
    }

    const user = await db.user.create({
      data: {
        email,
        name: typeof name === "string" ? name : null,
      },
    });

    res.status(201).json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/users/:id - Delete user
usersRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await db.user.delete({ where: { id } });
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
