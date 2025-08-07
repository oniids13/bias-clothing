import { Router } from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserPhoneController,
  addAddressController,
  updateAddressController,
  deleteAddressController,
  setDefaultAddressController,
  forgotPasswordController,
} from "../controller/userController.js";
import { checkAuth } from "../middleware/auth.js";

const userRouter = Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/forgot-password", forgotPasswordController);

// Protected routes - require authentication
userRouter.get("/profile", checkAuth, getUserProfile);
userRouter.put("/phone", checkAuth, updateUserPhoneController);
userRouter.post("/address", checkAuth, addAddressController);
userRouter.put("/address/:id", checkAuth, updateAddressController);
userRouter.delete("/address/:id", checkAuth, deleteAddressController);
userRouter.put("/address/:id/default", checkAuth, setDefaultAddressController);

export default userRouter;
