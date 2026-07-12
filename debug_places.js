require("dotenv").config();
const mongoose = require("mongoose");
const Hotel = require("./models/hotel.js");

async function checkAPI(city) {
  try {
    console.log(`Checking Agoda API for: ${city}`);
    const url = `https://agoda-working-api.p.rapidapi.com/search/bylocation?location=${encodeURIComponent(city)}&checkIn=2026-08-10&checkOut=2026-08-12&adults=2&children=0&rooms=1&page=1&resultCount=30&sortOrder=Best_Match&currency=INR`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": process.env.RAPID_API_KEY,
        "x-rapidapi-host": "agoda-working-api.p.rapidapi.com",
        "Content-Type": "application/json"
      }
    });
    
    if (response.status !== 200) {
      console.log(`API returned status ${response.status}`);
      return;
    }
    
    const searchData = await response.json();
    if (searchData && searchData.searchResults) {
      console.log(`API returned ${searchData.searchResults.length} results for ${city}`);
      if (searchData.searchResults.length > 0) {
        console.log(`Sample location data for ${city}: City='${searchData.searchResults[0].city}', State='${searchData.searchResults[0].state}', Country='${searchData.searchResults[0].country}'`);
      }
    } else {
      console.log(`No searchResults in response for ${city}`);
    }
  } catch (e) {
    console.error(e);
  }
}

async function run() {
  await mongoose.connect("mongodb://127.0.0.1:27017/StayVerse");
  
  // Check local DB for Raffles Jaipur
  const raffles = await Hotel.find({ name: { $regex: /raffle/i } }).select('name city country area').limit(5);
  console.log("Raffles hotels in DB:", raffles);
  
  // Check local DB for Swiss Alps
  const alpsDB = await Hotel.find({ $or: [{city: /alps/i}, {state: /alps/i}, {country: /alps/i}, {area: /alps/i}] }).select('name city country').limit(5);
  console.log("Alps hotels in DB:", alpsDB);
  
  // Also check API for Swiss Alps
  await checkAPI("Swiss Alps");
  await checkAPI("Raffles Jaipur");
  
  mongoose.disconnect();
}
run();
