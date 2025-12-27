import mongoose, { Schema, models, model } from "mongoose";

const SettingSchema = new Schema(
  {
    heroStoryId: { type: Schema.Types.ObjectId },
    studioExperience: { type: Number, default: 0 },
    weddingsCovered: { type: Number, default: 0 },
    citiesServed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Setting = models.Setting || model("Setting", SettingSchema);
export default Setting;
