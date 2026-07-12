const mongoose = require("mongoose");
const Listing = require("./models/listing.js");

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/StayVerse');
  const l = await Listing.find({ country: { $ne: 'India' } }).select('title image images').limit(10);
  console.log(JSON.stringify(l, null, 2));
  process.exit(0);
}
run();
