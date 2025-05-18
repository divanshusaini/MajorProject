const express =require("express");
const router = express.Router({mergeParams:true});
const wrapAsync=require("../UTILS/wrapAsync.js");
const ExpressError=require("../UTILS/ExpressError.js");
const{validateReview, isLoggedIn,isReviewAuthor}=require("../middleware.js");
const Review= require("../models/review.js");
const Listing =require("../models/listing.js");

const reviewController = require("../controllers/reviews.js");


//POST Route
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview));
   //delete Review route
   router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(reviewController.destroyReview));
   module.exports= router;