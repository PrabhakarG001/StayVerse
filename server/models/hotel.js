const mongoose = require("mongoose");

const roomTypeSchema = new mongoose.Schema({
  name: String,
  desc: String,
  extra: Number
});

const hotelSchema = new mongoose.Schema({
  propertyId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true,
    index: true
  },
  state: {
    type: String
  },
  country: {
    type: String,
    default: "India",
    index: true
  },
  address: {
    type: String
  },
  area: {
    type: String
  },
  latitude: Number,
  longitude: Number,
  price: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: "INR"
  },
  starRating: {
    type: Number,
    default: 3
  },
  reviewScore: {
    type: Number,
    default: 8.0
  },
  reviewScoreWord: String,
  reviewCount: {
    type: Number,
    default: 0
  },
  accommodationType: {
    name: String
  },
  checkin: String,
  checkout: String,
  distanceToCityCenter: String,
  description: String,
  amenities: [String],
  images: [String],
  roomTypes: [roomTypeSchema],
  url: String,
  sourceAPI: {
    type: String,
    default: "Agoda"
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  rawData: mongoose.Schema.Types.Mixed // Store full raw JSON object
});

// Add text index for global search
hotelSchema.index({ name: 'text', city: 'text', country: 'text' });
hotelSchema.index({ latitude: '2dsphere', longitude: '2dsphere' });

// Update the lastUpdated timestamp before saving
hotelSchema.pre("save", function (next) {
  this.lastUpdated = Date.now();
  next();
});

const Hotel = mongoose.model("Hotel", hotelSchema);
module.exports = Hotel;
