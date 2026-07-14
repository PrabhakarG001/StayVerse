const Hotel = require('../models/hotel');
const { hotelImages } = require('../utils/constants');
const cron = require("node-cron");

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
    
    if (response.status === 429) {
      if (retries > 0) {
        console.warn(`[SYNC] Rate Limit Exceeded for ${city}. Retrying in 2 seconds...`);
        await new Promise(r => setTimeout(r, 2000));
        return syncCityHotels(city, retries - 1);
      }
      console.warn(`[SYNC] Rate Limit Exceeded for ${city}`);
      return;
    }
    
    const searchData = await response.json();
    
    if (searchData && searchData.searchResults) {
      for (let i = 0; i < searchData.searchResults.length; i++) {
        const h = searchData.searchResults[i];
        
        let propType = "Hotel";
        if (h.propertyType) propType = h.propertyType.replace("Property", "").replace("Normal", "Hotel");
        const nameLower = h.name.toLowerCase();
        if (nameLower.includes("resort")) propType = "Resort";
        else if (nameLower.includes("villa")) propType = "Villa";
        else if (nameLower.includes("apartment")) propType = "Flat";
        
        let gallery = [];
        if (h.images && h.images.length > 0) {
          gallery = h.images;
        } else {
          gallery = [
            hotelImages[(i + 1) % hotelImages.length],
            hotelImages[(i + 2) % hotelImages.length],
            hotelImages[(i + 3) % hotelImages.length],
            hotelImages[(i + 4) % hotelImages.length]
          ];
        }

        const hotelData = {
          name: h.name,
          city: h.city || city,
          state: h.state || "",
          country: h.country || "India",
          area: h.area || "City Center",
          address: h.address || `${h.area || ''} ${h.city || city}`.trim(),
          latitude: h.latitude || null,
          longitude: h.longitude || null,
          distanceToCityCenter: '',
          starRating: h.starRating || 3,
          reviewScore: h.reviewScore || 8.0,
          reviewScoreWord: h.reviewScore >= 9 ? 'Superb' : h.reviewScore >= 8 ? 'Fabulous' : 'Very Good',
          reviewCount: h.reviewCount || 120,
          accommodationType: { name: propType },
          amenities: h.amenities || [],
          price: h.price && h.price.perNightInclusive ? h.price.perNightInclusive : Math.floor(Math.random() * 15000) + 3000,
          currency: h.price && h.price.currency ? h.price.currency : 'INR',
          checkin: '14:00',
          checkout: '12:00',
          images: gallery,
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
      console.log(`[SYNC] Successfully synced ${searchData.searchResults.length} hotels for ${city}`);
    }
  } catch (err) {
    console.error(`[SYNC ERROR] Failed syncing ${city}:`, err.message);
  }
}

function startDailySyncCron() {
  cron.schedule("0 0 * * *", async () => {
    console.log("[CRON] Starting daily hotel data sync...");
    const cities = [
      // Worldwide
      'New York', 'Los Angeles', 'London', 'Dubai', 'Paris', 'Rome', 'Amsterdam', 'Tokyo', 'Singapore', 'Bangkok', 'Sydney', 'Toronto', 'Istanbul', 'Cape Town', 'Rio de Janeiro', 'Bali', 'Santorini', 'Maldives', 'Phuket', 'Swiss Alps', 'Iceland', 'Cappadocia', 'Athens', 'Venice',
      // India
      'Bangalore', 'Hyderabad', 'Pune', 'Gurgaon', 'Noida', 'Chennai', 'Mumbai', 'Goa', 'Varanasi', 'Jaipur', 'Agra', 'Udaipur', 'Shimla', 'Munnar', 'Darjeeling', 'Manali', 'Rishikesh', 'Kerala', 'Andaman', 'Pondicherry', 'Leh-Ladakh', 'Mussoorie', 'Jaisalmer', 'Coorg', 'Wayanad', 'Meghalaya', 'Hampi', 'Alleppey', 'Ooty'
    ];
    for (const city of cities) {
      await syncCityHotels(city);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Delay to avoid hitting rate limits
    }
    console.log("[CRON] Daily sync complete!");
  });
}

module.exports = {
  syncCityHotels,
  startDailySyncCron
};
