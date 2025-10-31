import { Router } from 'express';
import {
  createBirthday,
  getBirthdays,
  getBirthdayById,
  updateBirthday,
  deleteBirthday,
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

// Create birthday
router.post('/', validate(createBirthdaySchema), createBirthday);

// Get all birthdays
router.get('/', getBirthdays);

// Get single birthday (validate :id parameter)
router.get('/:id', validateParams(mongoIdSchema), getBirthdayById);

// Update birthday (validate both :id parameter and body)
router.patch('/:id', validateParams(mongoIdSchema), validate(updateBirthdaySchema), updateBirthday);

// Delete birthday (validate :id parameter)
router.delete('/:id', validateParams(mongoIdSchema), deleteBirthday);

export default router;
