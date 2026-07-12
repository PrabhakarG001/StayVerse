const mongoose = require("mongoose");
const Hotel = require("./models/hotel.js");

async function checkImage() {
  await mongoose.connect("mongodb://127.0.0.1:27017/StayVerse");
  const hotel = await Hotel.findOne({ name: "Raffles Jaipur" });
  if (hotel) {
    console.log("Raffles Jaipur Images:");
    console.log(hotel.images);
  } else {
    console.log("Not found.");
  }
  mongoose.disconnect();
}
checkImage();
