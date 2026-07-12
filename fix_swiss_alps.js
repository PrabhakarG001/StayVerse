require("dotenv").config();
const mongoose = require("mongoose");
const Hotel = require("./models/hotel.js");
const app = require("./app.js"); // Wait, I'll just write the sync function here again.

const hotelImages = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80"
];

async function syncCityHotels(city, retries = 3) {
  try {
    const url = `https://agoda-working-api.p.rapidapi.com/search/bylocation?location=${encodeURIComponent(city)}&checkIn=2026-08-10&checkOut=2026-08-12&adults=2&children=0&rooms=1&page=1&resultCount=30&sortOrder=Best_Match&currency=INR`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": process.env.RAPID_API_KEY,
        "x-rapidapi-host": "agoda-working-api.p.rapidapi.com",
        "Content-Type": "application/json"
      }
    });
    
    const searchData = await response.json();
    
    if (searchData && searchData.searchResults) {
      for (let i = 0; i < searchData.searchResults.length; i++) {
        const h = searchData.searchResults[i];
        
        const hotelData = {
          name: h.name,
          city: h.city || city,
          state: h.state || "",
          country: h.country || "India",
          area: h.area || "City Center",
          address: h.address || `${h.area || ''} ${h.city || city}`.trim(),
          latitude: h.latitude || null,
          longitude: h.longitude || null,
          starRating: h.starRating || 3,
          reviewScore: h.reviewScore || 8.0,
          reviewCount: h.reviewCount || 120,
          price: h.price && h.price.perNightInclusive ? h.price.perNightInclusive : 5000,
          currency: h.price && h.price.currency ? h.price.currency : 'INR',
          images: h.images && h.images.length > 0 ? h.images : [hotelImages[0], hotelImages[1], hotelImages[2], hotelImages[3]],
          url: h.url,
          sourceAPI: 'Agoda',
          rawData: h
        };

        await Hotel.findOneAndUpdate(
          { propertyId: h.propertyId.toString() },
          { $set: hotelData },
          { upsert: true, new: true }
        );
      }
      console.log(`[SYNC] Successfully synced hotels for ${city}`);
    }
  } catch (err) {
    console.error(`[SYNC ERROR]`, err);
  }
}

async function run() {
  await mongoose.connect("mongodb://127.0.0.1:27017/StayVerse");
  console.log("Connected to DB");
  
  // Delete the bogus Albuquerque ones
  await Hotel.deleteMany({ city: /Albuquerque/i });
  console.log("Deleted old mistaken Swiss Alps hotels.");
  
  console.log("Syncing Zermatt...");
  await syncCityHotels("Zermatt");
  
  mongoose.disconnect();
}
run();
