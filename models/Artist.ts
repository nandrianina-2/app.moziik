import { Schema, models, model, Types } from "mongoose";

export interface IArtist {
  user: Types.ObjectId; // référence vers le User (role: "artist")
  stageName: string;
  bio?: string;
  coverUrl?: string;
  genres: string[];
  socialLinks: { platform: string; url: string }[];
  verified: boolean; // badge artiste vérifié, accordé par un admin
  followers: Types.ObjectId[]; // Users qui suivent l'artiste
  totalPlays: number;
  monetizationEnabled: boolean;
  createdAt: Date;
}

const ArtistSchema = new Schema<IArtist>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  stageName: { type: String, required: true },
  bio: { type: String },
  coverUrl: { type: String },
  genres: { type: [String], default: [] },
  socialLinks: [{ platform: String, url: String }],
  verified: { type: Boolean, default: false },
  followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  totalPlays: { type: Number, default: 0 },
  monetizationEnabled: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default models.Artist || model<IArtist>("Artist", ArtistSchema);
