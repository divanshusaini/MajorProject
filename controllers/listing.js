const Listing = require("../models/listing");
const { listingSchema, reviewSchema } = require("../schema.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  const AllListing = await Listing.find({});

  res.render("listing/index.ejs", { AllListing });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listing/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  //  console.log(listing);
  if (!listing) {
    req.flash("error", "Listing you requested for doesn't exist!");
    res.redirect("/listings");
  }
  res.render("listing/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();
     

  let url = req.file.path;
  let filename = req.file.filename;

  let result = listingSchema.validate(req.body);
  console.log(result);
  if (result.error) {
    throw new ExpressError(400, result.error);
  }

  const listingData = req.body.listing;
  listingData.price = Number(listingData.price);
  const newListing = new Listing(listingData);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  newListing.geometry =   response.body.features[0].geometry;
  let savedListing =await newListing.save();
  console.log(savedListing);
  
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  // console.log(listing);
  if (!listing) {
    req.flash("error", "Listing you requested for doesn't exist!");
    res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("listing/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let updatedData = req.body.listing;

  let listing = await Listing.findByIdAndUpdate(id, updatedData);

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }
  req.flash("success", " Listing Updated!");

  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  req.flash("success", " Listing Deleted!");
  res.redirect("/listings");
};
