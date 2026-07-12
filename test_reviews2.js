require('dotenv').config();
const mongoose = require('mongoose');
const Hotel = require('./models/hotel');
async function test() {
  await mongoose.connect(process.env.ATLASDB_URL || 'mongodb://127.0.0.1:27017/stayverse');
  const hotel = await Hotel.findOne();
  console.log('Testing propertyId:', hotel.propertyId);
  const url = 'https://agoda-working-api.p.rapidapi.com/property/reviews?propertyId=' + hotel.propertyId + '&page=1&limit=5';
  try {
    const res = await fetch(url, {
      headers: {
        'x-rapidapi-key': process.env.RAPID_API_KEY,
        'x-rapidapi-host': 'agoda-working-api.p.rapidapi.com'
      }
    });
    console.log(res.status, await res.json());
  } catch(e) { console.error(e); }
  process.exit(0);
}
test();
