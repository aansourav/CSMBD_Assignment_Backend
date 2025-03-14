import { Router } from "express";
import { signIn, signOut, signUp } from "../controllers/auth.controller.js";

const authRouter = Router();

// /api/v1/auth/signup
authRouter.post("/signup", signUp);

// /api/v1/auth/signin
authRouter.post("/signin", signIn);

// /api/v1/auth/signout
authRouter.post("/signout", signOut);

export default authRouter;
 