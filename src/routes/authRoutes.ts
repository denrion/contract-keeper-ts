import { Router } from 'express';
import {
  forgotPassword,
  getMe,
  login,
  resetPassword,
  signup,
} from '../controllers/authController';
import isAuth from '../middleware/isAuth';

const router = Router();

router.get('/me', isAuth, getMe);
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

export { router as authRouter };
