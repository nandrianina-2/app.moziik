import mongoose, { Schema, models, model, Types } from "mongoose";

export type UserRole = "member" | "artist" | "admin";

export interface IUser {
  name: string;
  email: string;
  passwordHash?: string; // absent si connexion Google uniquement
  googleId?: string;
  avatarUrl?: string;
  role: UserRole;
  verifiedArtist: boolean;
  suspended: boolean;
  badges: string[];
  likedSongs: Types.ObjectId[];
  resetToken?: string;
  resetTokenExpires?: Date;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String },
  googleId: { type: String },
  avatarUrl: { type: String },
  role: { type: String, enum: ["member", "artist", "admin"], default: "member" },
  verifiedArtist: { type: Boolean, default: false },
  suspended: { type: Boolean, default: false },
  badges: { type: [String], default: [] },
  likedSongs: [{ type: Schema.Types.ObjectId, ref: "Song" }],
  resetToken: { type: String },
  resetTokenExpires: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export default models.User || model<IUser>("User", UserSchema);
