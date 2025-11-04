import { Router } from 'express';
import {
  createBirthday,
  getBirthdays,
  getTodaysBirthdays,
  getThisMonthsBirthdays,
  getBirthdayById,
  updateBirthday,
  deleteBirthday,
  sendBirthdayWish,
} from '../controllers/birthday.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate, validateParams } from '../middleware/validation.middleware';
import {
  createBirthdaySchema,
  updateBirthdaySchema,
  mongoIdSchema,
} from '../schemas/birthday.schema';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.post('/', validate(createBirthdaySchema), createBirthday);
router.get('/today', getTodaysBirthdays);
router.get('/this-month', getThisMonthsBirthdays);
router.get('/:id', validateParams(mongoIdSchema), getBirthdayById);
router.get('/', getBirthdays);
router.patch('/:id', validateParams(mongoIdSchema), validate(updateBirthdaySchema), updateBirthday);
router.delete('/:id', validateParams(mongoIdSchema), deleteBirthday);
router.post('/:id/wish', validateParams(mongoIdSchema), sendBirthdayWish);

export default router;
