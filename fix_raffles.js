const mongoose = require("mongoose");
const Hotel = require("./models/hotel.js");

const newImages = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80"
];

async function fixRaffles() {
  await mongoose.connect("mongodb://127.0.0.1:27017/StayVerse");
  
  await Hotel.updateOne(
    { name: "Raffles Jaipur" },
    { $set: { images: newImages } }
  );
  
  console.log("Raffles Jaipur images updated.");
  mongoose.disconnect();
}
fixRaffles();
