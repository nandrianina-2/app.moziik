import { Schema, models, model, Types, Model } from "mongoose";

export type AlbumType = "album" | "ep" | "single";

export interface IAlbum {
  title: string;
  artist: Types.ObjectId; // ref Artist
  coverUrl: string;
  type: AlbumType;
  songs: Types.ObjectId[]; // ref Song
  releaseDate: Date;
  createdAt: Date;
}

const AlbumSchema = new Schema<IAlbum>({
  title: { type: String, required: true },
  artist: { type: Schema.Types.ObjectId, ref: "Artist", required: true, index: true },
  coverUrl: { type: String, required: true },
  type: { type: String, enum: ["album", "ep", "single"], default: "album" },
  songs: [{ type: Schema.Types.ObjectId, ref: "Song" }],
  releaseDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default (models.Album as Model<IAlbum>) || model<IAlbum>("Album", AlbumSchema);
