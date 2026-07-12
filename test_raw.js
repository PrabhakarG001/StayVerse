require('dotenv').config();
const mongoose = require('mongoose');
const Hotel = require('./models/hotel');
async function test() {
  await mongoose.connect('mongodb://127.0.0.1:27017/StayVerse');
  const hotel = await Hotel.findOne();
  console.log(Object.keys(hotel.rawData || {}));
  console.log(hotel.rawData.reviewScore);
  process.exit(0);
}
test();
