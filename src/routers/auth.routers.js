import { Router } from "express";
import { register,login, profile, logoutAll} from "../controllers/auth.controller.js";
import {auth} from "../middleware/auth.js";



const router = Router();
router.post(`/register`, register);
router.post(`/login`, login);
router.get(`/profile`, auth, profile);
router.post(`/logout-all`, auth, logoutAll);

export default router;