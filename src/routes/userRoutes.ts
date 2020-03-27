import { Router } from 'express';
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
} from '../controllers/userController';
import isAuth from '../middleware/isAuth';
import restrictTo from '../middleware/restrictTo';
import { Role } from '../models/User';

const router = Router();

// Protect all routes after this middleware
// Restrict all routes after this to admin users
router.use(isAuth, restrictTo(Role.ADMIN));

router.route('/').get(getAllUsers).post(createUser);

router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

export { router as userRouter };
