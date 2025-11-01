import { Request, Response } from 'express';
import { Birthday } from '../models/Birthday.model';
import { logger } from '../utils/logger';

export const createBirthday = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const { name, date, email, phone, notes } = req.body;

    const birthday = new Birthday({
      userId: req.user.userId,
      name,
      date,
      email,
      phone,
      notes,
    });

    await birthday.save();

    (req.log || logger).info(`Birthday created for: ${name} by user ${req.user.email}`);

    return res.status(201).json({
      success: true,
      data: birthday,
    });
  } catch (error) {
    (req.log || logger).error(`Create birthday failure: ${(error as Error).message}`);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

export const getBirthdays = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const birthdays = await Birthday.find({ userId: req.user.userId }).sort({
      date: 1,
    });

    (req.log || logger).info(`Found ${birthdays.length} birthdays for user ${req.user.email}`);

    return res.status(200).json({
      success: true,
      count: birthdays.length,
      data: birthdays,
    });
  } catch (error) {
    (req.log || logger).error(`Get birthdays failure: ${(error as Error).message}`);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Get birthdays happening today
 * Filters by month and day only (ignores year since birthdays repeat annually)
 * Uses MongoDB aggregation operators for efficient server-side filtering
 */
export const getTodaysBirthdays = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    // Get current date in server timezone (TODO: use user timezone from Task 6)
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // MongoDB months are 1-indexed (1-12)
    const currentDay = today.getDate(); // Day of month (1-31)

    // Query explanation:
    // - $expr allows us to use aggregation operators in find()
    // - $month extracts month number from date field (1-12)
    // - $dayOfMonth extracts day number from date field (1-31)
    // - We match ONLY month and day, ignoring year (birthdays repeat annually)
    // - userId filter ensures user only sees their own birthdays
    const birthdays = await Birthday.find({
      userId: req.user.userId,
      $expr: {
        $and: [
          { $eq: [{ $month: '$date' }, currentMonth] },
          { $eq: [{ $dayOfMonth: '$date' }, currentDay] },
        ],
      },
    }).sort({ date: 1 });

    (req.log || logger).info(
      `Found ${birthdays.length} birthdays today (${currentMonth}/${currentDay}) for user ${req.user.email}`
    );

    return res.status(200).json({
      success: true,
      count: birthdays.length,
      data: birthdays,
    });
  } catch (error) {
    (req.log || logger).error(`Get today's birthdays failure: ${(error as Error).message}`);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Get birthdays happening this month
 * Filters by month only (ignores day and year)
 * Useful for "This Month" tab to show upcoming birthdays
 */
export const getThisMonthsBirthdays = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    // Get current month in server timezone (TODO: use user timezone from Task 6)
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // MongoDB months are 1-indexed (1-12)

    // Query explanation:
    // - $expr with $month extracts month from date field
    // - We match ONLY the month, allowing all days and years
    // - This returns all birthdays that happen in the current month
    // - Sort by day within month for chronological display
    const birthdays = await Birthday.find({
      userId: req.user.userId,
      $expr: {
        $eq: [{ $month: '$date' }, currentMonth],
      },
    }).sort({ date: 1 });

    (req.log || logger).info(
      `Found ${birthdays.length} birthdays this month (month ${currentMonth}) for user ${req.user.email}`
    );

    return res.status(200).json({
      success: true,
      count: birthdays.length,
      data: birthdays,
    });
  } catch (error) {
    (req.log || logger).error(`Get this month's birthdays failure: ${(error as Error).message}`);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

export const getBirthdayById = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const { id } = req.params;

    const birthday = await Birthday.findOne({
      _id: id,
      userId: req.user.userId,
    });

    if (!birthday) {
      return res.status(404).json({
        success: false,
        error: 'Birthday not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: birthday,
    });
  } catch (error) {
    (req.log || logger).error(`Get birthday by ID failure: ${(error as Error).message}`);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

export const updateBirthday = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const { id } = req.params;
    const { name, date, email, phone, notes } = req.body;

    const birthday = await Birthday.findOne({
      _id: id,
      userId: req.user.userId,
    });

    if (!birthday) {
      return res.status(404).json({
        success: false,
        error: 'Birthday not found',
      });
    }

    if (name !== undefined) birthday.name = name;
    if (date !== undefined) birthday.date = date;
    if (email !== undefined) birthday.email = email;
    if (phone !== undefined) birthday.phone = phone;
    if (notes !== undefined) birthday.notes = notes;

    await birthday.save();

    (req.log || logger).info(`Birthday ${id} updated by user ${req.user.email}`);

    return res.status(200).json({
      success: true,
      data: birthday,
    });
  } catch (error) {
    (req.log || logger).error(`Update birthday error: ${(error as Error).message}`);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

export const deleteBirthday = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const { id } = req.params;

    const birthday = await Birthday.findOneAndDelete({
      _id: id,
      userId: req.user.userId,
    });

    if (!birthday) {
      return res.status(404).json({
        success: false,
        error: 'Birthday not found',
      });
    }

    (req.log || logger).info(`Birthday deleted: ${id} by user ${req.user.email}`);

    return res.status(200).json({
      success: true,
      message: 'Birthday deleted successfully',
    });
  } catch (error) {
    (req.log || logger).error(`Delete birthday failure: ${(error as Error).message}`);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Send birthday wish
 * Validates that wish hasn't been sent this year, then saves timestamp
 * Business rule: One wish per birthday per year
 */
export const sendBirthdayWish = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { id } = req.params;

    const birthday = await Birthday.findOne({ _id: id, userId: req.user.userId });
    if (!birthday) {
      return res.status(404).json({ success: false, error: 'Birthday not found' });
    }

    // SERVER-SIDE VALIDATION: Check if wish already sent this year
    // Why check on server: Client validation can be bypassed
    // Why compare years: Birthdays repeat annually
    const currentYear = new Date().getFullYear();

    if (birthday.lastWishSent) {
      const lastSentYear = new Date(birthday.lastWishSent).getFullYear();

      if (lastSentYear === currentYear) {
        // Already sent this year - reject the request
        (req.log || logger).warn(
          `Duplicate wish attempt for ${birthday.name} (id=${id}) by ${req.user.email} - already sent on ${birthday.lastWishSent.toISOString()}`
        );

        return res.status(400).json({
          success: false,
          error: 'Birthday wish already sent this year',
          lastSent: birthday.lastWishSent,
        });
      }
    }

    // Update lastWishSent timestamp
    // This persists the wish action to database
    birthday.lastWishSent = new Date();
    await birthday.save();

    // Server-side log of the wish action (core assignment requirement)
    (req.log || logger).info(
      `Happy Birthday sent to ${birthday.name} (id=${id}) by ${req.user.email} at ${birthday.lastWishSent.toISOString()}`
    );

    return res.status(200).json({
      success: true,
      message: 'Birthday wish sent successfully',
      sentAt: birthday.lastWishSent,
    });
  } catch (error) {
    (req.log || logger).error(`Send birthday wish failure: ${(error as Error).message}`);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
