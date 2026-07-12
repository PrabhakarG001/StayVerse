require('dotenv').config();
const mongoose = require('mongoose');
const Hotel = require('./models/hotel');
async function test() {
  await mongoose.connect('mongodb://127.0.0.1:27017/StayVerse');
  const hotels = await Hotel.find({ reviewCount: { $gt: 100 } }).limit(5);
  for (const hotel of hotels) {
    console.log('Testing propertyId:', hotel.propertyId);
    const url = 'https://agoda-working-api.p.rapidapi.com/property/reviews?propertyId=' + hotel.propertyId + '&page=1&limit=5';
    try {
      const res = await fetch(url, {
        headers: {
          'x-rapidapi-key': process.env.RAPID_API_KEY,
          'x-rapidapi-host': 'agoda-working-api.p.rapidapi.com'
        }
      });
      const data = await res.json();
      console.log(hotel.propertyId, data.searchResults ? data.searchResults.length : 0);
      if (data.searchResults && data.searchResults.length > 0) {
        console.log(data.searchResults[0]);
        break;
      }
    } catch(e) { console.error(e); }
  }
  process.exit(0);
}
test();
