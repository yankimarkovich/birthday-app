import { Router } from 'express';
import {
  createBirthday,
  getBirthdays,
  getBirthdayById,
  updateBirthday,
  deleteBirthday,
} from '../controllers/birthday.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createBirthdaySchema, updateBirthdaySchema } from '../schemas/birthday.schema';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Create birthday
router.post('/', validate(createBirthdaySchema), createBirthday);

// Get all birthdays
router.get('/', getBirthdays);

// Get single birthday
router.get('/:id', getBirthdayById);

// Update birthday
router.patch('/:id', validate(updateBirthdaySchema), updateBirthday);

// Delete birthday
router.delete('/:id', deleteBirthday);

export default router;
