import mongoose, { Schema, type Model, type InferSchemaType } from 'mongoose';

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'artisan'], default: 'user' },
  },
  { timestamps: true }
);

export type UserDocument = InferSchemaType<typeof userSchema>;

const UserModel =
  (mongoose.models.User as Model<UserDocument>) ||
  mongoose.model<UserDocument>('User', userSchema);

export default UserModel;
