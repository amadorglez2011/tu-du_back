import { Router } from "express";
import { register, login, profile, logoutAll, updateProfile, getSecurityQuestion, verifySecurityAnswer, resetPassword } from "../controllers/auth.controller.js";
import { auth } from "../middleware/auth.js";

const router = Router();
router.post(`/register`, register);
router.post(`/login`, login);
router.get(`/profile`, auth, profile);
router.put(`/profile`, auth, updateProfile);
router.post(`/logout-all`, auth, logoutAll);
router.post(`/forgot-password`, getSecurityQuestion);
router.post(`/verify-security-answer`, verifySecurityAnswer);
router.post(`/reset-password`, resetPassword);

export default router;