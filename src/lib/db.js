import { connectDB } from "./mongodb";

// Simple wrapper so other libs can import from "@/lib/db"
// while keeping the main connection logic in mongodb.js
export { connectDB } from "./mongodb";
export default connectDB;
