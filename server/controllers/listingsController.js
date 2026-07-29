const Listing = require('../models/listing');
const Review = require('../models/review');
const ExpressError = require('../utils/ExpressError');

function normalizeListing(listingData) {
  if (!listingData) return listingData;

  if (typeof listingData.image === "string") {
    listingData.image = {
      filename: "listingimage",
      url: listingData.image,
    };
  }

  // Handle multiple gallery images
  if (listingData.galleryImages && Array.isArray(listingData.galleryImages)) {
    listingData.images = listingData.galleryImages
      .filter(url => typeof url === "string" && url.trim() !== "")
      .map((url, index) => ({
        filename: "galleryimage",
        url: url.trim()
      }));
    delete listingData.galleryImages;
  }

  return listingData;
}

module.exports.renderIndex = async (req, res) => {
  if (req.query.search) {
    return res.redirect(`/hotels/search?query=${encodeURIComponent(req.query.search)}`);
  }

  const allowedFilters = new Set(["all", "india", "foreign"]);
  const requestedFilter = String(req.query.filter || "all").toLowerCase();
  const filterAlias = requestedFilter === "foriegn" ? "foreign" : requestedFilter;
  const filter = allowedFilters.has(filterAlias) ? filterAlias : "all";
  
  const allListings = await Listing.find({});
  
  res.render("pages/listings/index.ejs", { 
    allListings, 
    selectedCategory: req.query.category || "", 
    searchQuery: "",
    isHomepage: true,
    filter
  });
};

module.exports.renderNewForm = (req, res) => {
  res.render("pages/listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).populate("reviews");
  if (!listing) {
    throw new ExpressError(404, "Listing not found.");
  }
  res.render("pages/listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res) => {
  const newListing = new Listing(normalizeListing(req.body.listing));
  newListing.owner = req.user._id;
  await newListing.save();
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    throw new ExpressError(404, "Listing not found.");
  }
  res.render("pages/listings/edit.ejs", { listing });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findByIdAndUpdate(
    id,
    { ...normalizeListing(req.body.listing) },
    { runValidators: true, new: true }
  );

  if (!listing) {
    throw new ExpressError(404, "Listing not found.");
  }

  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  if (!deletedListing) {
    throw new ExpressError(404, "Listing not found.");
  }

  res.redirect("/listings");
};

module.exports.createReview = async (req, res) => {
  let listing = await Listing.findById(req.params.id);
  if (!listing) {
    throw new ExpressError(404, "Listing not found.");
  }
  let newReview = new Review(req.body.review);
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
  res.redirect(`/listings/${listing._id}`);
};

module.exports.deleteReview = async (req, res) => {
  let { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  res.redirect(`/listings/${id}`);
};
