const mongoose = require('mongoose'); 
mongoose.connect('mongodb://127.0.0.1:27017/StayVerse').then(async () => { 
  const Hotel = mongoose.model('Hotel', require('./models/hotel.js').schema); 
  const hotels = await Hotel.find().limit(3); 
  for(let h of hotels) {
    if(!h.amenities) h.amenities = [];
    h.amenities.push("Pet friendly");
    await h.save();
    console.log("Tagged:", h.name);
  }
  console.log("Done");
  process.exit(0); 
});
