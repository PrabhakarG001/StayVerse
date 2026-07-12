const mongoose = require("mongoose");
const Listing = require("./models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/StayVerse";

async function run() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to DB!");
    
    // Find all listings
    const listings = await Listing.find({});
    
    // Keep track of titles we've seen
    const seenTitles = new Set();
    const duplicates = [];
    
    for (let listing of listings) {
      if (seenTitles.has(listing.title)) {
        duplicates.push(listing._id);
      } else {
        seenTitles.add(listing.title);
      }
    }
    
    if (duplicates.length > 0) {
      const res = await Listing.deleteMany({ _id: { $in: duplicates } });
      console.log(`Deleted ${res.deletedCount} duplicate listings!`);
    } else {
      console.log("No duplicates found.");
    }
    
    mongoose.connection.close();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
