require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const Hotel = require("./models/hotel.js");
const cron = require("node-cron");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");


const MONGO_URL = "mongodb://127.0.0.1:27017/StayVerse";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

function normalizeListing(listingData) {
  if (!listingData) return listingData;

  if (typeof listingData.image === "string") {
    listingData.image = {
      filename: "listingimage",
      url: listingData.image,
    };
  }

  return listingData;
}

function validateObjectId(req, res, next) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ExpressError(400, "Invalid listing ID.");
  }

  next();
}

// app.get("/testlisting", wrapAsync(async (req, res) => {
//   let sampleListing = new Listing ({
//     title: "My New Vila",
//     description: "By the Hotel",
//     price: 1300,
//     location:"Calangute,Noida",
//   });
//   await sampleListing.save();
//   console.log("sample was saved");
//   res.send("Successful Testing");
  
// }));

const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, "Invalid listing data: " + msg);
  } else {
    next();
  }
};

const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, "Invalid review data: " + msg);
  } else {
    next();
  }
};

// Index Route (Homepage)
app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.get("/api/city-background.svg", wrapAsync(async (req, res) => {
  const hotelCities = await Hotel.distinct('city');
  const listingCities = await Listing.distinct('location');
  const allCities = [...new Set([...hotelCities, ...listingCities])].filter(Boolean);
  const shuffled = allCities.sort(() => 0.5 - Math.random());
  
  const cols = 5;
  const rows = 12;
  const cellW = 380;
  const cellH = 140;
  
  let rectsAndTexts = '';
  const colors = ['#FF385C', '#00A699', '#FC642D', '#FFB400', '#4285F4', '#8A2BE2', '#FF6347', '#20B2AA'];
  
  let i = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (i >= shuffled.length) break; // strict: never repeat a city
      const city = shuffled[i];
      const x = c * cellW + 20;
      const y = r * cellH + 20;
      const color = colors[Math.floor(Math.random()*colors.length)];
      
      // Draw colorful poster card
      rectsAndTexts += `<rect x="${x}" y="${y}" width="${cellW - 40}" height="${cellH - 40}" rx="16" fill="${color}" opacity="0.9"/>\n`;
      // Draw city text inside
      rectsAndTexts += `<text x="${x + (cellW - 40)/2}" y="${y + (cellH - 40)/2 + 12}" font-family="system-ui, -apple-system, sans-serif" font-size="28px" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1.5">${city.toUpperCase()}</text>\n`;
      i++;
    }
  }
  
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 ${cols * cellW} ${rows * cellH}" preserveAspectRatio="xMidYMid slice">
      <rect width="100%" height="100%" fill="#1a1a1a" />
      ${rectsAndTexts}
    </svg>
  `;
  
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=60'); 
  res.send(svg.trim());
}));

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/listings", wrapAsync(async (req, res) => {
  if (req.query.search) {
    return res.redirect(`/hotels/search?query=${encodeURIComponent(req.query.search)}`);
  }

  const allowedFilters = new Set(["all", "india", "foreign"]);
  const requestedFilter = String(req.query.filter || "all").toLowerCase();
  const filterAlias = requestedFilter === "foriegn" ? "foreign" : requestedFilter;
  const filter = allowedFilters.has(filterAlias) ? filterAlias : "all";
  
  res.render("listings/index.ejs", { 
    allListings: [], 
    selectedCategory: req.query.category || "", 
    searchQuery: "",
    isHomepage: true,
    filter
  });
}));

// New Route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

// Show Route
app.get("/listings/:id", validateObjectId, wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).populate("reviews");
  if (!listing) {
    throw new ExpressError(404, "Listing not found.");
  }
  res.render("listings/show.ejs", { listing });
}));

// Create Route
app.post("/listings",
   validateListing,
   wrapAsync(async (req, res) => {
  
    const newListing = new Listing(normalizeListing(req.body.listing));
  await newListing.save();
  res.redirect("/listings");
}));

// Edit Route
app.get("/listings/:id/edit", validateObjectId, wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    throw new ExpressError(404, "Listing not found.");
  }
  res.render("listings/edit.ejs", { listing });
}));

// Update Route
app.put("/listings/:id", validateListing, wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findByIdAndUpdate(
    id,
    { ...normalizeListing(req.body.listing) },
    { runValidators: true, new: true }
  );

  if (!listing) {
    throw new ExpressError(404, "Listing not found.");
  }

  res.redirect(`/listings/${id}`);
}));

// Delete Route
app.delete("/listings/:id", validateObjectId, wrapAsync(async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  if (!deletedListing) {
    throw new ExpressError(404, "Listing not found.");
  }

  res.redirect("/listings");
}));

// Post Review Route
app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req, res) => {
  let listing = await Listing.findById(req.params.id);
  if (!listing) {
    throw new ExpressError(404, "Listing not found.");
  }
  let newReview = new Review(req.body.review);
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
  res.redirect(`/listings/${listing._id}`);
}));

// Delete Review Route
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req, res) => {
  let { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  res.redirect(`/listings/${id}`);
}));

// app.get("/testListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "My New Villa",
//     description: "By the beach",
//     price: 1200,
//     location: "Calangute, Goa",
//     country: "India",
//   });

//   await sampleListing.save();
//   console.log("sample was saved");
//   res.send("successful testing");
// });

// Hotels Search Page Route
app.get("/wishlists", (req, res) => {
  res.render("wishlists/index");
});

app.get("/hotels/search", (req, res) => {
  res.render("hotels/search.ejs", { query: req.query.query || "", hideSearch: true });
});

// Unique images pool to use for generating galleries
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

// Helper to sync a city from API and store to MongoDB
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

// Scheduled Cron Job to update database daily at midnight
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

// Sync Endpoint (To trigger manually)
app.post("/api/hotels/sync", wrapAsync(async (req, res) => {
  const city = req.body.city || req.query.city;
  if (!city) {
    return res.status(400).json({ error: "City is required" });
  }
  await syncCityHotels(city);
  res.json({ success: true, message: `Sync initiated for ${city}` });
}));

// Global Search API (Fast Regex Search in Database)
app.get("/api/hotels/search", wrapAsync(async (req, res) => {
  let q = req.query.q;
  
  // If no query or user literally types 'worldwide', return a global mix
  if (!q || q.toLowerCase() === 'worldwide' || q.toLowerCase() === 'anywhere') {
    const hotels = await Hotel.find({}).limit(30);
    return res.json({ searchResults: hotels });
  }

  // Handle common misspellings or official name changes (e.g., Gurgaon -> Gurugram)
  let queryLower = q.toLowerCase();
  if (queryLower === 'gurgoan' || queryLower === 'gurgaon') {
    q = 'Gurugram';
  }
  // Handle 'raffle' typo for Raffles
  if (queryLower.includes('raffle') && !queryLower.includes('raffles')) {
    q = q.replace(/raffle/gi, 'Raffles');
  }

  const regex = new RegExp(q, 'i');
  // Search across name, city, and country
  const hotels = await Hotel.find({
    $or: [
      { name: regex },
      { city: regex },
      { country: regex }
    ]
  }).limit(30);
  res.json({ searchResults: hotels });
}));

// Internal API to fetch hotels from local Database (No API fallback)
app.get("/api/hotels", wrapAsync(async (req, res) => {
  let city = req.query.city;
  if (city) {
    const cityLower = city.toLowerCase();
    if (cityLower === 'gurgoan' || cityLower === 'gurgaon') {
      city = 'Gurugram';
    } else if (cityLower === 'leh-ladakh') {
      city = 'Leh';
    } else if (cityLower === 'hampi') {
      city = 'Ise|Hospet|Hampi';
    } else if (cityLower === 'swiss alps') {
      city = 'Zermatt';
    }
  }
  let filter = {};
  if (city) {
    const regex = new RegExp(city, 'i');
    filter = {
      $or: [
        { city: regex },
        { state: regex },
        { country: regex },
        { area: regex },
        { name: regex }
      ]
    };
  }
  
  let hotels = await Hotel.find(filter).limit(30);
  
  let listingsFilter = {};
  if (city) {
    const regex = new RegExp(city, 'i');
    listingsFilter = {
      $or: [
        { location: regex },
        { country: regex },
        { title: regex }
      ]
    };
  }
  let listings = await Listing.find(listingsFilter).limit(30);
  let mappedListings = listings.map(l => ({
    propertyId: l._id.toString(),
    name: l.title,
    city: l.location,
    country: l.country,
    price: l.price,
    images: l.images && l.images.length > 0 ? l.images.map(img => img.url) : (l.image && l.image.url ? [l.image.url] : []),
    starRating: 5,
    reviewScore: 9.5,
    isPremium: true
  }));
  
  let combinedResults = [...mappedListings, ...hotels].slice(0, 30);
  res.json({ searchResults: combinedResults });
}));

// Internal API to fetch hotels by city param (No API fallback)
app.get("/api/hotels/:city", wrapAsync(async (req, res) => {
  let city = req.params.city;
  if (city) {
    const cityLower = city.toLowerCase();
    if (cityLower === 'gurgoan' || cityLower === 'gurgaon') {
      city = 'Gurugram';
    } else if (cityLower === 'leh-ladakh') {
      city = 'Leh';
    } else if (cityLower === 'hampi') {
      city = 'Ise|Hospet|Hampi';
    } else if (cityLower === 'swiss alps') {
      city = 'Zermatt';
    }
  }
  const regex = new RegExp(city, 'i');
  let hotels = await Hotel.find({
    $or: [
      { city: regex },
      { state: regex },
      { country: regex },
      { area: regex },
      { name: regex }
    ]
  }).limit(30);
  
  let listings = await Listing.find({
    $or: [
      { location: regex },
      { country: regex },
      { title: regex }
    ]
  }).limit(30);
  
  let mappedListings = listings.map(l => ({
    propertyId: l._id.toString(),
    name: l.title,
    city: l.location,
    country: l.country,
    price: l.price,
    images: l.images && l.images.length > 0 ? l.images.map(img => img.url) : (l.image && l.image.url ? [l.image.url] : []),
    starRating: 5,
    reviewScore: 9.5,
    isPremium: true
  }));

  let combinedResults = [...mappedListings, ...hotels].slice(0, 30);
  res.json({ searchResults: combinedResults });
}));

// StayAPI Meta Search Route
app.get("/api/hotels/meta", wrapAsync(async (req, res) => {
  const hotel_name = req.query.hotel_name;
  const location = req.query.location;

  if (!hotel_name || !location) {
    return res.status(400).json({ error: "hotel_name and location are required" });
  }

  try {
    const response = await fetch(`https://api.stayapi.com/v1/meta/search?` + new URLSearchParams({ hotel_name, location }), {
      method: 'GET',
      headers: {
        'x-api-key': process.env.STAY_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("StayAPI Error:", err);
    res.status(500).json({ error: "Failed to fetch meta links from StayAPI" });
  }
}));

// API Hotel Detail Page (Show Page)
app.get("/hotels/show/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  
  const hotel = await Hotel.findOne({ propertyId: id });
  if (!hotel) {
    return res.redirect("/listings");
  }

  // Fetch real original reviews from an external API (dummyjson) to simulate real guest comments
  let apiReviews = [];
  try {
    // Generate a consistent skip based on propertyId so the reviews stay consistent per hotel
    const skip = (parseInt(id) || 0) % 300;
    const response = await fetch(`https://dummyjson.com/comments?limit=4&skip=${skip}`);
    const data = await response.json();
    if (data && data.comments) {
      apiReviews = data.comments.map(c => ({
        user: c.user.fullName,
        comment: c.body,
        rating: (Math.random() * (5.0 - 4.0) + 4.0).toFixed(1), // Random rating between 4 and 5
        date: new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      }));
    }
  } catch (err) {
    console.error("Failed to fetch API reviews:", err);
  }
  
  res.render("hotels/show.ejs", { hotel, apiReviews });
}));

app.use((req, res, next) => {
  next(new ExpressError(404, "Page not found."));
});

app.use((err, req, res, next) => {
  console.error("EXPRESS ERROR:", err.stack);
  const { statusCode = 500 } = err;
  const message = err.message || "Something went wrong.";

  res.status(statusCode).render("error.ejs", { err: { statusCode, message } });
});

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});
