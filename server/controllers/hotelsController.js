const Hotel = require('../models/hotel');
const Listing = require('../models/listing');
const { syncCityHotels } = require('../services/hotelService');

const sortIndiaFirst = (a, b) => {
  const isIndiaA = (a && a.country && typeof a.country === 'string' && a.country.toLowerCase() === 'india') ? -1 : 1;
  const isIndiaB = (b && b.country && typeof b.country === 'string' && b.country.toLowerCase() === 'india') ? -1 : 1;
  return isIndiaA - isIndiaB;
};

module.exports.renderSearchPage = (req, res) => {
  res.render("pages/hotels/search.ejs", { 
    query: req.query.query || "", 
    category: req.query.category || "", 
    hideSearch: true 
  });
};

module.exports.searchHotelsAPI = async (req, res) => {
  let q = req.query.q;
  
  if (!q || q.toLowerCase() === 'worldwide' || q.toLowerCase() === 'anywhere') {
    const hotels = await Hotel.find({}).limit(30);
    let listings = await Listing.find({ title: { $not: /trending|mountain|beachfront/i } }).limit(30);
    let mappedListings = listings.map(l => ({
      propertyId: l._id.toString(),
      name: l.title,
      city: l.location,
      country: l.country,
      price: l.price,
      images: l.images && l.images.length > 0 ? l.images.map(img => img.url) : (l.image && l.image.url ? [l.image.url] : []),
      starRating: 5,
      reviewScore: 9.5,
      isPremium: true,
      isListing: true
    }));
    let combined = [...mappedListings, ...hotels].sort(sortIndiaFirst);
    return res.json({ searchResults: combined.slice(0, 30) });
  }

  let queryLower = q.toLowerCase();
  if (queryLower === 'gurgoan' || queryLower === 'gurgaon') {
    q = 'Gurugram';
  }
  if (queryLower.includes('raffle') && !queryLower.includes('raffles')) {
    q = q.replace(/raffle/gi, 'Raffles');
  }

  const regex = new RegExp(q, 'i');
  let hotels = await Hotel.find({
    $or: [
      { name: regex },
      { city: regex },
      { country: regex }
    ]
  }).limit(30);

  let listings = await Listing.find({
    $and: [
      { title: { $not: /trending|mountain|beachfront/i } },
      {
        $or: [
          { title: regex },
          { location: regex },
          { country: regex }
        ]
      }
    ]
  }).limit(30);
  
  let mappedListings = listings.map(l => ({
    propertyId: l._id.toString(),
    name: l.title,
    city: l.location,
    country: l.country,
    price: l.price,
    images: l.images && l.images.length > 0 ? l.images.map(img => img.url) : (l.image && l.image.url ? [l.image.url] : []),
    starRating: 5,
    reviewScore: 9.5,
    isPremium: true,
    isListing: true
  }));
  
  let combinedResults = [...mappedListings, ...hotels];
  
  if (combinedResults.length === 0) {
    await syncCityHotels(q);
    hotels = await Hotel.find({
      $or: [
        { name: regex },
        { city: regex },
        { country: regex }
      ]
    }).limit(30);
    combinedResults = [...mappedListings, ...hotels];
  }

  combinedResults.sort(sortIndiaFirst);
  res.json({ searchResults: combinedResults.slice(0, 30) });
};

module.exports.getHotelsAPI = async (req, res) => {
  let city = req.query.city;
  if (city) {
    const cityLower = city.toLowerCase();
    if (cityLower === 'gurgoan' || cityLower === 'gurgaon') {
      city = 'Gurugram';
    } else if (cityLower === 'leh-ladakh') {
      city = 'Leh';
    } else if (cityLower === 'hampi') {
      city = 'Ise|Hospet|Hampi';
    } else if (cityLower === 'swiss alps') {
      city = 'Zermatt';
    }
  }
  let filter = {};
  let listingsFilter = { title: { $not: /trending|mountain|beachfront/i } };

  if (city) {
    const regex = new RegExp(city, 'i');
    filter.$or = [
      { city: regex },
      { state: regex },
      { country: regex },
      { area: regex }
    ];
    listingsFilter.$or = [
      { location: regex },
      { country: regex }
    ];
  }
  
  let category = req.query.category;
  if (category) {
    switch (category) {
      case 'TopRated':
        filter.reviewScore = { $gte: 8.5 };
        break;
      case 'PetFriendly':
        filter.$or = [
          { amenities: { $regex: /pet/i } },
          { description: { $regex: /pet/i } },
          { amenities: { $regex: /dog/i } }
        ];
        listingsFilter.description = { $regex: /pet/i };
        break;
      case 'Luxury':
        filter.$or = [
          { starRating: { $gte: 5 } },
          { price: { $gte: 15000 } }
        ];
        break;
      case 'Unique':
        filter['accommodationType.name'] = { $in: ['Villa', 'Resort', 'Treehouse', 'Tent', 'Cabin'] };
        listingsFilter.category = { $in: ['Castles', 'Camping', 'Jungle', 'Treehouse'] };
        break;
      case 'Deals':
        filter.price = { $lt: 5000 };
        break;
    }
  }
  
  let hotels = await Hotel.find(filter).limit(30);
  let listings = await Listing.find(listingsFilter).limit(30);
  let mappedListings = listings.map(l => ({
    propertyId: l._id.toString(),
    name: l.title,
    city: l.location,
    country: l.country,
    price: l.price,
    images: l.images && l.images.length > 0 ? l.images.map(img => img.url) : (l.image && l.image.url ? [l.image.url] : []),
    starRating: 5,
    reviewScore: 9.5,
    isPremium: true,
    isListing: true
  }));
  
  let combinedResults = [...mappedListings, ...hotels].slice(0, 30);
  
  if (combinedResults.length === 0 && city) {
    await syncCityHotels(city);
    hotels = await Hotel.find(filter).limit(30);
    combinedResults = [...mappedListings, ...hotels].slice(0, 30);
  }

  combinedResults.sort(sortIndiaFirst);
  res.json({ searchResults: combinedResults });
};

module.exports.getHotelsByCityAPI = async (req, res) => {
  let city = req.params.city;
  if (city) {
    const cityLower = city.toLowerCase();
    if (cityLower === 'gurgoan' || cityLower === 'gurgaon') {
      city = 'Gurugram';
    } else if (cityLower === 'leh-ladakh') {
      city = 'Leh';
    } else if (cityLower === 'hampi') {
      city = 'Ise|Hospet|Hampi';
    } else if (cityLower === 'swiss alps') {
      city = 'Zermatt';
    }
  }
  const regex = new RegExp(city, 'i');
  let hotels = await Hotel.find({
    $or: [
      { city: regex },
      { state: regex },
      { country: regex },
      { area: regex }
    ]
  }).limit(30);
  
  let listings = await Listing.find({
    $or: [
      { location: regex },
      { country: regex }
    ]
  }).limit(30);
  
  let mappedListings = listings.map(l => ({
    propertyId: l._id.toString(),
    name: l.title,
    city: l.location,
    country: l.country,
    price: l.price,
    images: l.images && l.images.length > 0 ? l.images.map(img => img.url) : (l.image && l.image.url ? [l.image.url] : []),
    starRating: 5,
    reviewScore: 9.5,
    isPremium: true,
    isListing: true
  }));

  let combinedResults = [...mappedListings, ...hotels].slice(0, 30);

  if (combinedResults.length === 0) {
    await syncCityHotels(city);
    hotels = await Hotel.find({
      $or: [
        { city: regex },
        { state: regex },
        { country: regex },
        { area: regex }
      ]
    }).limit(30);
    combinedResults = [...mappedListings, ...hotels].slice(0, 30);
  }

  combinedResults.sort(sortIndiaFirst);
  res.json({ searchResults: combinedResults });
};

module.exports.renderSliderAPI = async (req, res) => {
  let city = req.query.city;
  if (city) {
    const cityLower = city.toLowerCase();
    if (cityLower === 'gurgoan' || cityLower === 'gurgaon') {
      city = 'Gurugram';
    } else if (cityLower === 'leh-ladakh') {
      city = 'Leh';
    } else if (cityLower === 'hampi') {
      city = 'Ise|Hospet|Hampi';
    } else if (cityLower === 'swiss alps') {
      city = 'Zermatt';
    }
  }
  let filter = {};
  let listingsFilter = {};
  if (city) {
    const regex = new RegExp(city, 'i');
    filter.$or = [
      { city: regex },
      { state: regex },
      { country: regex },
      { area: regex }
    ];
    listingsFilter.$or = [
      { location: regex },
      { country: regex }
    ];
  }
  
  let hotels = await Hotel.find(filter).limit(30);
  let listings = await Listing.find(listingsFilter).limit(30);
  
  let mappedListings = listings.map(l => ({
    propertyId: l._id.toString(),
    name: l.title,
    city: l.location,
    country: l.country,
    price: l.price,
    images: l.images && l.images.length > 0 ? l.images.map(img => img.url) : (l.image && l.image.url ? [l.image.url] : []),
    starRating: 5,
    reviewScore: 9.5,
    isPremium: true,
    isListing: true
  }));
  
  let combinedResults = [...mappedListings, ...hotels].slice(0, 30);
  
  if (combinedResults.length === 0) {
    try {
      await syncCityHotels(city);
      hotels = await Hotel.find(filter).limit(30);
      combinedResults = [...mappedListings, ...hotels].slice(0, 30);
    } catch (err) {
      console.log('Error syncing city on slider render:', err.message);
    }
  }
  
  const filteredResults = combinedResults.filter(hotel => {
    const n = (hotel.name || '').toLowerCase();
    return !(n.includes('trending') || n.includes('mountain') || n.includes('beachfront'));
  });
  
  filteredResults.sort(sortIndiaFirst);
  
  res.render("partials/hotel-slider.ejs", { city, hotels: filteredResults });
};

module.exports.renderSearchAPI = async (req, res) => {
  let q = req.query.q;
  let category = req.query.category;
  
  let filter = {};
  let listingsFilter = {};
  
  if (q && q.toLowerCase() !== 'worldwide' && q.toLowerCase() !== 'anywhere') {
    let queryLower = q.toLowerCase();
    if (queryLower === 'gurgoan' || queryLower === 'gurgaon') {
      q = 'Gurugram';
    } else if (queryLower === 'leh-ladakh') {
      q = 'Leh';
    } else if (queryLower === 'hampi') {
      q = 'Ise|Hospet|Hampi';
    } else if (queryLower === 'swiss alps') {
      q = 'Zermatt';
    }
    const regex = new RegExp(q, 'i');
    filter.$or = [
      { name: regex },
      { city: regex },
      { country: regex },
      { area: regex }
    ];
    listingsFilter.$or = [
      { location: regex },
      { country: regex },
      { title: regex }
    ];
  } else {
    listingsFilter = { title: { $not: /trending|mountain|beachfront/i } };
  }
  
  let hotels = await Hotel.find(filter).limit(30);
  let listings = await Listing.find(listingsFilter).limit(30);
  
  let mappedListings = listings.map(l => ({
    propertyId: l._id.toString(),
    name: l.title,
    city: l.location,
    country: l.country,
    price: l.price,
    images: l.images && l.images.length > 0 ? l.images.map(img => img.url) : (l.image && l.image.url ? [l.image.url] : []),
    starRating: 5,
    reviewScore: 9.5,
    isPremium: true,
    isListing: true
  }));
  
  let results = [...mappedListings, ...hotels].slice(0, 30);
  
  // If no results and it's a specific city, sync from RapidAPI and retry
  if (results.length === 0 && q && q.toLowerCase() !== 'worldwide' && q.toLowerCase() !== 'anywhere') {
    await syncCityHotels(q);
    hotels = await Hotel.find(filter).limit(30);
    results = [...mappedListings, ...hotels].slice(0, 30);
  }
  
  results.sort(sortIndiaFirst);
  
  if (category) {
    const categoryLower = category.toLowerCase();
    if (categoryLower === 'toprated') {
      results = results.filter(h => h.reviewScore && h.reviewScore >= 8.5);
    } else if (categoryLower === 'petfriendly') {
      results = results.filter(h => {
        const hasPet = (h.amenities || []).some(a => /pet|dog/i.test(a));
        const descPet = h.description && /pet|dog/i.test(h.description);
        return hasPet || descPet;
      });
    } else if (categoryLower === 'luxury') {
      results = results.filter(h => h.starRating >= 5 || h.price >= 15000);
    }
  }
  
  res.render("partials/hotel-search-results.ejs", { results });
};

module.exports.showHotelDetail = async (req, res) => {
  const { id } = req.params;
  
  const hotel = await Hotel.findOne({ propertyId: id });
  if (!hotel) {
    try {
      const listing = await Listing.findById(id);
      if (listing) {
        return res.redirect(`/listings/${id}`);
      }
    } catch(e) {
      // ignore
    }
    return res.redirect("/listings");
  }
  
  res.render("pages/hotels/show.ejs", { hotel, hideSearch: true });
};

module.exports.syncHotels = async (req, res) => {
  const city = req.body.city || req.query.city;
  if (!city) {
    return res.status(400).json({ error: "City is required" });
  }
  await syncCityHotels(city);
  res.json({ success: true, message: `Sync initiated for ${city}` });
};

module.exports.getDestinations = async (req, res) => {
  const cities = await Hotel.distinct("city");
  res.json({ cities: cities || [] });
};


module.exports.metaBookingSearch = (req, res) => {
  const { hotel_name } = req.query;
  res.json({
    success: true,
    links: {
      booking_com: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(hotel_name)}`,
      expedia: `https://www.expedia.com/Hotel-Search?destination=${encodeURIComponent(hotel_name)}`,
      hotels_com: `https://www.hotels.com/Hotel-Search?destination=${encodeURIComponent(hotel_name)}`
    }
  });
};


