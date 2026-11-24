import mongoose from "mongoose";
import dns from "dns";

if (dns.getServers().includes("127.0.0.1")) {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is required");
    }

    const conn = await mongoose.connect(mongoUri);
    console.log("🟢 Connected to MongoDB.");
  } catch (error) {
    console.error("🔴 MongoDB Connection Error:", error.message);
    process.exit(1);
  }
}

export default connectDB;