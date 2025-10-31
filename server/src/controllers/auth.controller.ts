import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.model';
import { logger } from '../utils/logger';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered',
      });
    }

    const user = new User({ name, email, password });
    await user.save();

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      logger.error('JWT_SECRET is not defined');
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }

    const token = jwt.sign(
      {
        userId: String(user._id),
        email: user.email,
      },
      secret,
      { expiresIn: '7d' }
    );

    // Business event log with correlation id
    (req.log || logger).info(`Registration success: ${email}`);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    (req.log || logger).error(`Registration error: ${(error as Error).message}`);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      logger.error('JWT_SECRET is not defined');
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }

    const token = jwt.sign(
      {
        userId: String(user._id),
        email: user.email,
      },
      secret,
      { expiresIn: '7d' }
    );

    (req.log || logger).info(`Login success: ${email}`);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    (req.log || logger).error(`Login failure: ${(error as Error).message}`);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};
