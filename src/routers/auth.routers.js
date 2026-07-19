import { Router } from "express";
import { register, login, profile, logoutAll, updateProfile } from "../controllers/auth.controller.js";
import {auth} from "../middleware/auth.js";



const router = Router();
router.post(`/register`, register);
router.post(`/login`, login);
router.get(`/profile`, auth, profile);
router.put(`/profile`, auth, updateProfile);
router.post(`/logout-all`, auth, logoutAll);

export default router;