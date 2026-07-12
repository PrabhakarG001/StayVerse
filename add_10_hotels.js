const mongoose = require("mongoose");
const Listing = require("./models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/StayVerse";

const newForeignHotels = [
  {
    title: "Eiffel Tower View Apartment",
    description: "A romantic and modern apartment with a stunning direct view of the Eiffel Tower from your private balcony.",
    image: {
      filename: "paris_listing",
      url: "https://images.unsplash.com/photo-1502602881460-5ba45d10c9a4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    },
    price: 350,
    location: "Paris",
    country: "France",
    category: "Iconic Cities"
  },
  {
    title: "Shinjuku Neon Loft",
    description: "Experience the vibrant nightlife and glowing neon signs of Tokyo in this ultra-modern high-rise loft.",
    image: {
      filename: "tokyo_listing",
      url: "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    },
    price: 220,
    location: "Tokyo",
    country: "Japan",
    category: "Iconic Cities"
  },
  {
    title: "Colosseum Historic Villa",
    description: "Step back in time in this beautifully restored historic villa located just minutes away from the Colosseum.",
    image: {
      filename: "rome_listing",
      url: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    },
    price: 180,
    location: "Rome",
    country: "Italy",
    category: "Historic"
  },
  {
    title: "Manhattan Skyline Penthouse",
    description: "Luxury living in the sky with panoramic views of the New York City skyline and Central Park.",
    image: {
      filename: "nyc_listing",
      url: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    },
    price: 650,
    location: "New York City",
    country: "United States",
    category: "Iconic Cities"
  },
  {
    title: "Bondi Beach House",
    description: "Wake up to the sound of crashing waves in this beautiful beachfront home directly on Sydney's famous Bondi Beach.",
    image: {
      filename: "sydney_listing",
      url: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    },
    price: 310,
    location: "Sydney",
    country: "Australia",
    category: "Beachfront"
  },
  {
    title: "Burj Khalifa Luxury Suite",
    description: "Opulence at its finest in the heart of Dubai, featuring floor-to-ceiling windows and world-class amenities.",
    image: {
      filename: "dubai_listing",
      url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    },
    price: 850,
    location: "Dubai",
    country: "United Arab Emirates",
    category: "Trending"
  },
  {
    title: "Ubud Jungle Pool Villa",
    description: "A serene and spiritual retreat surrounded by the lush green jungles and rice terraces of Bali.",
    image: {
      filename: "bali_listing",
      url: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    },
    price: 150,
    location: "Bali",
    country: "Indonesia",
    category: "Jungle"
  },
  {
    title: "Oia Cliffside Cave House",
    description: "A traditional whitewashed cave house perched on the cliffs of Santorini with an endless view of the Aegean Sea.",
    image: {
      filename: "santorini_listing",
      url: "https://images.unsplash.com/photo-1516483638261-f40af5baacce?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    },
    price: 420,
    location: "Santorini",
    country: "Greece",
    category: "Beachfront"
  },
  {
    title: "Table Mountain Retreat",
    description: "Experience the unique beauty of Cape Town from this modern hillside retreat nestled under Table Mountain.",
    image: {
      filename: "capetown_listing",
      url: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    },
    price: 190,
    location: "Cape Town",
    country: "South Africa",
    category: "Mountains"
  },
  {
    title: "Swiss Alps Ski Chalet",
    description: "A cozy wooden chalet nestled in the snowy peaks of the Swiss Alps, perfect for winter sports enthusiasts.",
    image: {
      filename: "swissalps_listing",
      url: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    },
    price: 340,
    location: "Zermatt",
    country: "Switzerland",
    category: "Mountains"
  }
];

async function main() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to DB!");
    
    // Insert new foreign hotels
    const result = await Listing.insertMany(newForeignHotels);
    console.log(`Successfully added ${result.length} foreign hotels!`);
    
    mongoose.connection.close();
  } catch (err) {
    console.error("Error connecting or inserting:", err);
    process.exit(1);
  }
}

main();
