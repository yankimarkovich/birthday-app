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

// Create birthday
router.post('/', validate(createBirthdaySchema), createBirthday);

// Get filtered birthdays - MUST come before /:id route
// Why: Express matches routes top-to-bottom. If /:id came first,
// it would match '/today' and treat 'today' as an ID parameter
router.get('/today', getTodaysBirthdays);
router.get('/this-month', getThisMonthsBirthdays);

// Get single birthday (validate :id parameter)
// Why after specific routes: Parameterized routes should come after
// static routes to avoid false matches
router.get('/:id', validateParams(mongoIdSchema), getBirthdayById);

// Get all birthdays (no filter) - MUST be last
// Why: This is the most general route (matches /birthdays exactly)
// Put it last to ensure specific routes are matched first
router.get('/', getBirthdays);

// Update birthday (validate both :id parameter and body)
router.patch('/:id', validateParams(mongoIdSchema), validate(updateBirthdaySchema), updateBirthday);

// Delete birthday (validate :id parameter)
router.delete('/:id', validateParams(mongoIdSchema), deleteBirthday);

// Send birthday wish (validate :id parameter)
router.post('/:id/wish', validateParams(mongoIdSchema), sendBirthdayWish);

export default router;
