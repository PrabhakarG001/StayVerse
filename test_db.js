const mongoose = require('mongoose'); 
mongoose.connect('mongodb://127.0.0.1:27017/StayVerse').then(async () => { 
  const Hotel = mongoose.model('Hotel', require('./models/hotel.js').schema); 
  const types = await Hotel.distinct('accommodationType.name');
  console.log('Types:', types); 
  process.exit(0); 
});
