import mongoose, { Schema, models, model } from "mongoose";

const AdminSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, default: "admin" },
  },
  { timestamps: true }
);

const Admin = models.Admin || model("Admin", AdminSchema);
export default Admin;
