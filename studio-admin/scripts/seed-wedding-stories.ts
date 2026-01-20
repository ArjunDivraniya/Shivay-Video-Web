import mongoose from "mongoose";
import dotenv from "dotenv";
import WeddingStory from "@/models/WeddingStory";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local" });

async function seedWeddingStories() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI not set in env");

    await mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB || "shivay-studio",
    });

    // Sample wedding stories
    const sampleStories = [
      {
        title: "The Grand Celebration",
        coupleName: "Arjun & Priya",
        place: "Jaipur, Rajasthan",
        serviceType: "wedding",
        coverPhoto: {
          url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200",
          publicId: "wedding_story_1",
        },
        gallery: [],
      },
      {
        title: "Love in the City",
        coupleName: "Rohit & Anjali",
        place: "Delhi, India",
        serviceType: "wedding",
        coverPhoto: {
          url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200",
          publicId: "wedding_story_2",
        },
        gallery: [],
      },
      {
        title: "Monsoon Romance",
        coupleName: "Karan & Neha",
        place: "Mumbai, Maharashtra",
        serviceType: "wedding",
        coverPhoto: {
          url: "https://images.unsplash.com/photo-1519225421-9ba06c9b56ff?w=1200",
          publicId: "wedding_story_3",
        },
        gallery: [],
      },
      {
        title: "Garden Dreams",
        coupleName: "Siddharth & Diya",
        place: "Bangalore, Karnataka",
        serviceType: "wedding",
        coverPhoto: {
          url: "https://images.unsplash.com/photo-1531042326381-fc127c50f3f3?w=1200",
          publicId: "wedding_story_4",
        },
        gallery: [],
      },
      {
        title: "Heritage Moments",
        coupleName: "Vikram & Sangeeta",
        place: "Hyderabad, Telangana",
        serviceType: "wedding",
        coverPhoto: {
          url: "https://images.unsplash.com/photo-1543514505-f2dcf5440fdc?w=1200",
          publicId: "wedding_story_5",
        },
        gallery: [],
      },
    ];

    // Clear existing stories
    await WeddingStory.deleteMany({});
    console.log("✓ Cleared existing wedding stories");

    // Insert sample stories
    const result = await WeddingStory.insertMany(sampleStories);
    console.log(`✓ Seeded ${result.length} wedding stories`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error: any) {
    console.error("✗ Seed failed:", error.message);
    process.exit(1);
  }
}

seedWeddingStories();
