import { Router } from 'express'
import { getLoginUser, login, register } from '../Controllers/AuthController';

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/getLoginUser", getLoginUser);


export default router;
