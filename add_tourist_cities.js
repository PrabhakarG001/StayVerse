require("dotenv").config();
const mongoose = require("mongoose");
const Hotel = require("./models/hotel.js");
const MONGO_URL = "mongodb://127.0.0.1:27017/StayVerse";

const hotelImages = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80"
];

async function syncCityHotels(cityObj, retries = 3) {
  const { city, country } = cityObj;
  try {
    const queryTerm = `${city}, ${country}`;
    const url = `https://agoda-working-api.p.rapidapi.com/search/bylocation?location=${encodeURIComponent(queryTerm)}&checkIn=2026-08-10&checkOut=2026-08-12&adults=2&children=0&rooms=1&page=1&resultCount=30&sortOrder=Best_Match&currency=INR`;
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
        return syncCityHotels(cityObj, retries - 1);
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
          city: city, // Explicitly use our city name
          state: h.state || "",
          country: country, // Explicitly use our country name
          area: h.area || "City Center",
          address: h.address || `${h.area || ''} ${city}`.trim(),
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
      console.log(`[SYNC] Successfully inserted ${searchData.searchResults.length} hotels for ${city}, ${country}`);
    }
  } catch (err) {
    console.error(`[SYNC ERROR] Failed syncing ${city}:`, err.message);
  }
}

async function run() {
  await mongoose.connect(MONGO_URL);
  console.log("Connected to DB");

  const newCities = [
    { city: "Kyoto", country: "Japan" },
    { city: "Busan", country: "South Korea" },
    { city: "Chiang Mai", country: "Thailand" },
    { city: "Bali", country: "Indonesia" },
    { city: "Dubrovnik", country: "Croatia" },
    { city: "Santorini", country: "Greece" },
    { city: "Lisbon", country: "Portugal" },
    { city: "Vancouver", country: "Canada" },
    { city: "Marrakech", country: "Morocco" },
    { city: "Queenstown", country: "New Zealand" },
    { city: "Udaipur", country: "India" },
    { city: "Jaisalmer", country: "India" },
    { city: "Rishikesh", country: "India" },
    { city: "Mussoorie", country: "India" },
    { city: "Spiti", country: "India" },
    { city: "Dharamshala", country: "India" },
    { city: "Hampi", country: "India" },
    { city: "Coorg", country: "India" },
    { city: "Wayanad", country: "India" },
    { city: "Shillong", country: "India" }
  ];

  let skippedCount = 0;
  let insertedCount = 0;

  for (const item of newCities) {
    // Check using city_name + country
    // Search with case-insensitive regex to be safe
    const exists = await Hotel.findOne({ 
      city: { $regex: new RegExp(`^${item.city}$`, 'i') },
      country: { $regex: new RegExp(`^${item.country}$`, 'i') }
    });

    if (exists) {
      console.log(`[SKIP] City already exists: ${item.city}, ${item.country}`);
      skippedCount++;
    } else {
      console.log(`[INSERT] Fetching data for new city: ${item.city}, ${item.country}`);
      await syncCityHotels(item);
      insertedCount++;
      // Delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log(`\nFinished processing ${newCities.length} cities.`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Inserted (Fetched): ${insertedCount}`);
  
  mongoose.disconnect();
}

run();
