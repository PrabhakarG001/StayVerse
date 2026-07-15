const User = require('../models/user');
const Listing = require('../models/listing');

module.exports.createBooking = async (req, res) => {
  const { propertyId, name, image, price, startDate, endDate } = req.body;
  const user = await User.findById(req.user._id);
  // Default to a 3-day trip starting tomorrow if not provided, for demo purposes
  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() + 1);
  const defaultEnd = new Date(defaultStart);
  defaultEnd.setDate(defaultEnd.getDate() + 3);
  
  user.bookings.push({ 
    propertyId, 
    name, 
    image, 
    price, 
    date: new Date(),
    startDate: startDate ? new Date(startDate) : defaultStart,
    endDate: endDate ? new Date(endDate) : defaultEnd
  });
  await user.save();
  res.json({ success: true });
};

module.exports.renderMyBookings = async (req, res) => {
  const user = await User.findById(req.user._id);
  const now = new Date();
  const tab = req.query.tab || 'active';
  
  let filteredBookings;
  if (tab === 'past') {
    // Show only completed trips (endDate < today)
    filteredBookings = user.bookings.filter(b => b.endDate && new Date(b.endDate) < now);
  } else {
    // Show active trips (Upcoming + Ongoing): endDate >= today
    filteredBookings = user.bookings.filter(b => b.endDate && new Date(b.endDate) >= now);
  }
  
  res.render("pages/users/user-bookings.ejs", { 
    bookings: filteredBookings, 
    activeTab: tab,
    today: now
  });
};

module.exports.renderMyHost = async (req, res) => {
  const listings = await Listing.find({ owner: req.user._id });
  res.render("pages/users/host-dashboard.ejs", { listings });
};
