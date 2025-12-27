import mongoose, { Document, Model, Schema } from "mongoose";

export interface IFilm extends Document {
  title: string;
  category: string;
  videoUrl: string;
  videoPublicId: string;
  createdAt: Date;
}

const FilmSchema = new Schema<IFilm>(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    videoUrl: { type: String, required: true },
    videoPublicId: { type: String, required: true },
  },
  { timestamps: true }
);

const Film: Model<IFilm> =
  mongoose.models.Film || mongoose.model<IFilm>("Film", FilmSchema);

export default Film;
