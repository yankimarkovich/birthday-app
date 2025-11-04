import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBirthday extends Document {
  userId: Types.ObjectId;
  name: string;
  date: Date;
  email?: string;
  phone?: string;
  notes?: string;
  lastWishSent?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const birthdaySchema = new Schema<IBirthday>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Birthday date is required'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    lastWishSent: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
// We filter by userId first in all queries, and then by date
birthdaySchema.index({ userId: 1, date: 1 });

export const Birthday = mongoose.model<IBirthday>('Birthday', birthdaySchema);
