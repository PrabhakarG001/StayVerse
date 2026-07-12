const mongoose = require("mongoose");
const fs = require("fs");
const Listing = require("./models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/StayVerse";

const newForeignHotelsBatch2 = [
  {
    title: "London Eye View Apartment",
    description: "A luxury apartment located on the banks of the River Thames with an unobstructed view of the London Eye and Big Ben.",
    image: {
      filename: "london_listing",
      url: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60"
    },
    images: [{ filename: "london_listing", url: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" }],
    price: 450,
    location: "London",
    country: "United Kingdom",
    category: "Iconic Cities"
  },
  {
    title: "Gothic Quarter Boutique Hotel",
    description: "Stay in the heart of Barcelona's historic center, surrounded by beautiful architecture, tapas bars, and lively streets.",
    image: {
      filename: "barcelona_listing",
      url: "https://images.unsplash.com/photo-1583422409516-2895a77efded?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60"
    },
    images: [{ filename: "barcelona_listing", url: "https://images.unsplash.com/photo-1583422409516-2895a77efded?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" }],
    price: 210,
    location: "Barcelona",
    country: "Spain",
    category: "Historic"
  },
  {
    title: "Copacabana Beachfront Condo",
    description: "A vibrant and sunny condo located right on the iconic Copacabana beach with panoramic ocean views.",
    image: {
      filename: "rio_listing",
      url: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60"
    },
    images: [{ filename: "rio_listing", url: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" }],
    price: 180,
    location: "Rio de Janeiro",
    country: "Brazil",
    category: "Beachfront"
  },
  {
    title: "Bosphorus View Mansion",
    description: "Experience where East meets West in this stunning historical mansion overlooking the Bosphorus Strait in Istanbul.",
    image: {
      filename: "istanbul_listing",
      url: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60"
    },
    images: [{ filename: "istanbul_listing", url: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" }],
    price: 260,
    location: "Istanbul",
    country: "Turkey",
    category: "Iconic Cities"
  },
  {
    title: "Chao Phraya River Suite",
    description: "A peaceful luxury suite floating above the bustling streets of Bangkok, directly overlooking the majestic Chao Phraya River.",
    image: {
      filename: "bangkok_listing",
      url: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60"
    },
    images: [{ filename: "bangkok_listing", url: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" }],
    price: 140,
    location: "Bangkok",
    country: "Thailand",
    category: "Iconic Cities"
  },
  {
    title: "Gangnam Skyline Penthouse",
    description: "Discover the ultra-modern luxury of Seoul in this sleek penthouse located in the vibrant Gangnam district.",
    image: {
      filename: "seoul_listing",
      url: "https://images.unsplash.com/photo-1617131016839-550751911ed1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60"
    },
    images: [{ filename: "seoul_listing", url: "https://images.unsplash.com/photo-1617131016839-550751911ed1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" }],
    price: 320,
    location: "Seoul",
    country: "South Korea",
    category: "Iconic Cities"
  },
  {
    title: "Medina Palace Riad",
    description: "An incredibly detailed and historic riad featuring a private courtyard and dipping pool hidden within the Marrakech Medina.",
    image: {
      filename: "marrakech_listing",
      url: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60"
    },
    images: [{ filename: "marrakech_listing", url: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" }],
    price: 190,
    location: "Marrakech",
    country: "Morocco",
    category: "Historic"
  },
  {
    title: "Canal Ring Historic Home",
    description: "A gorgeous multi-story historic Dutch canal house with cozy interiors and picturesque views of passing boats.",
    image: {
      filename: "amsterdam_listing",
      url: "https://images.unsplash.com/photo-1517736996303-4e84a5e00bde?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60"
    },
    images: [{ filename: "amsterdam_listing", url: "https://images.unsplash.com/photo-1517736996303-4e84a5e00bde?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" }],
    price: 275,
    location: "Amsterdam",
    country: "Netherlands",
    category: "Iconic Cities"
  },
  {
    title: "Northern Lights Glass Igloo",
    description: "Sleep under the stars and watch the magical Aurora Borealis from the comfort of a heated glass igloo.",
    image: {
      filename: "reykjavik_listing",
      url: "https://images.unsplash.com/photo-1520681328639-67252ef0fcf3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60"
    },
    images: [{ filename: "reykjavik_listing", url: "https://images.unsplash.com/photo-1520681328639-67252ef0fcf3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" }],
    price: 540,
    location: "Reykjavik",
    country: "Iceland",
    category: "Mountains"
  },
  {
    title: "Pyramids View Guesthouse",
    description: "Wake up to an awe-inspiring, up-close view of the ancient Great Pyramids of Giza right from your window.",
    image: {
      filename: "cairo_listing",
      url: "https://images.unsplash.com/photo-1539650116574-8efeb43e2b50?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60"
    },
    images: [{ filename: "cairo_listing", url: "https://images.unsplash.com/photo-1539650116574-8efeb43e2b50?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" }],
    price: 110,
    location: "Cairo",
    country: "Egypt",
    category: "Historic"
  }
];

async function main() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to DB!");
    
    // 1. Insert into live DB
    const result = await Listing.insertMany(newForeignHotelsBatch2);
    console.log(`Successfully added ${result.length} NEW foreign hotels into the database!`);
    
    // 2. Append to init/data.js
    const dataFile = require('./init/data.js');
    let currentData = dataFile.data;
    
    // Filter out duplicates just in case
    currentData = currentData.filter(item => !newForeignHotelsBatch2.find(h => h.title === item.title));
    
    // Concat
    currentData = currentData.concat(newForeignHotelsBatch2);
    
    // Stringify and write
    let fileContent = 'const sampleListings = ' + JSON.stringify(currentData, null, 2) + ';\n\nmodule.exports = { data: sampleListings };\n';
    fs.writeFileSync('./init/data.js', fileContent);
    console.log(`Successfully saved ${newForeignHotelsBatch2.length} NEW hotels to init/data.js!`);
    
    mongoose.connection.close();
  } catch (err) {
    console.error("Error connecting or inserting:", err);
    process.exit(1);
  }
}

main();
