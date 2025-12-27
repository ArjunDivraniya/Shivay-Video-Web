import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local" });

const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, default: "admin" },
}, { timestamps: true });

const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

async function seed() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI not set in env");
    
    await mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB || "shivay-studio",
    });
    
    const adminEmail = process.env.ADMIN_EMAIL || "admin@shivay.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("✓ Admin already exists:", adminEmail);
      await mongoose.connection.close();
      process.exit(0);
    }
    
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const admin = await Admin.create({
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
    });
    
    console.log("✓ Admin created successfully!");
    console.log("  Email:", adminEmail);
    console.log("  Password:", adminPassword);
    await mongoose.connection.close();
    process.exit(0);
  } catch (error: any) {
    console.error("✗ Seed failed:", error.message);
    process.exit(1);
  }
}

seed();
