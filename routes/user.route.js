import { Router } from "express";
import { getUserById, getUsers } from "../controllers/user.controller.js";
import authorize from "../middlewares/auth.middleware.js";

const userRouter = Router();

// /api/v1/users
userRouter.get("/", authorize, getUsers);
userRouter.get("/:id", authorize, getUserById);
userRouter.post("/", (req, res) => res.send({ title: "CREATE New User" }));
userRouter.put("/:id", (req, res) => res.send({ title: "UPDATE User" }));
userRouter.delete("/:id", (req, res) => res.send({ title: "DELETE User" }));

export default userRouter;
