const mongoose = require("mongoose");
const Hotel = require("./models/hotel.js");

async function check() {
  await mongoose.connect("mongodb://127.0.0.1:27017/StayVerse");
  
  const cities = [
    'Bangalore', 'Hyderabad', 'Pune', 'Gurgaon', 'Noida', 'Chennai', 'Mumbai', 'Goa', 'Varanasi', 'Jaipur', 'Agra', 'Udaipur', 'Shimla', 'Munnar', 'Darjeeling', 'Manali', 'Kerala', 'Andaman', 'Pondicherry', 'Leh-Ladakh', 'Mussoorie', 'Jaisalmer', 'Coorg', 'Wayanad', 'Meghalaya', 'Hampi', 'Alleppey', 'Ooty',
    'New York', 'London', 'Paris', 'Dubai', 'Rome', 'Tokyo', 'Singapore', 'Bangkok', 'Bali', 'Santorini', 'Maldives', 'Phuket', 'Swiss Alps', 'Iceland', 'Cappadocia', 'Athens', 'Venice'
  ];

  console.log("City counts:");
  for (const city of cities) {
    const count = await Hotel.countDocuments({ city: { $regex: new RegExp(city, 'i') } });
    if (count === 0) {
      console.log(`❌ ${city}: ${count}`);
    } else {
      console.log(`✅ ${city}: ${count}`);
    }
  }
  
  mongoose.disconnect();
}
check();
