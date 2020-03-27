import { Router } from 'express';
import {
  createContact,
  deleteContact,
  getAllContacts,
  getContact,
  updateContact,
} from '../controllers/contactController';
import isAuth from '../middleware/isAuth';
import {
  setSearchConditionToUser,
  setUserBodyField,
} from '../middleware/setSearchConditions';

const router = Router();

router.use(isAuth);

router
  .route('/')
  .get(setSearchConditionToUser, getAllContacts)
  .post(setUserBodyField, createContact);

router.route('/:id').get(getContact).patch(updateContact).delete(deleteContact);

export { router as contactRouter };
