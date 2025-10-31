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

    // Server-side log of the wish action (core assignment requirement)
    (req.log || logger).info(`Happy Birthday sent to ${birthday.name} (id=${id}) by ${req.user.email}`);

    return res.status(200).json({ success: true, message: 'Birthday wish logged successfully' });
  } catch (error) {
    (req.log || logger).error(`Send birthday wish failure: ${(error as Error).message}`);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
