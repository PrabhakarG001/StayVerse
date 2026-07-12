const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/StayVerse').then(async () => {
  const Hotel = require('./models/hotel');
  const count = await Hotel.countDocuments({ city: { $regex: new RegExp('Gurgaon', 'i') } });
  console.log('Total Gurgaon hotels:', count);
  process.exit(0);
});
