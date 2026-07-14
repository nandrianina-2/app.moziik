import { Schema, models, model, Types } from "mongoose";

export type SongStatus = "draft" | "scheduled" | "published" | "rejected";

export interface ISongFeaturing {
  artist: Types.ObjectId;
  confirmed: boolean; // l'artiste crédité doit confirmer pour apparaître comme "vérifié" dans les crédits
}

export interface ISong {
  title: string;
  artist: Types.ObjectId; // ref Artist
  featuring: ISongFeaturing[]; // artistes en featuring
  album?: Types.ObjectId; // ref Album, absent si single
  audioUrl: string; // Cloudinary (resource_type: video)
  coverUrl: string;
  duration: number; // secondes
  genre: string;
  lyrics?: string;
  explicit: boolean;
  status: SongStatus;
  releaseDate: Date; // peut être future : planification de sortie
  publishedBy: Types.ObjectId; // artiste ou admin ayant publié
  approvedBy?: Types.ObjectId; // admin ayant validé (gestion complète par l'admin)
  playsCount: number;
  likesCount: number;
  createdAt: Date;
}

const SongSchema = new Schema<ISong>({
  title: { type: String, required: true },
  artist: { type: Schema.Types.ObjectId, ref: "Artist", required: true, index: true },
  featuring: [
    {
      artist: { type: Schema.Types.ObjectId, ref: "Artist", required: true },
      confirmed: { type: Boolean, default: false },
    },
  ],
  album: { type: Schema.Types.ObjectId, ref: "Album" },
  audioUrl: { type: String, required: true },
  coverUrl: { type: String, required: true },
  duration: { type: Number, required: true },
  genre: { type: String, required: true },
  lyrics: { type: String },
  explicit: { type: Boolean, default: false },
  status: { type: String, enum: ["draft", "scheduled", "published", "rejected"], default: "draft" },
  releaseDate: { type: Date, required: true },
  publishedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
  playsCount: { type: Number, default: 0 },
  likesCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

SongSchema.index({ status: 1, releaseDate: 1 });

export default models.Song || model<ISong>("Song", SongSchema);
