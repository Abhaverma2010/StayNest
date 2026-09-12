const express = require('express')
const router = express.Router({mergeParams:true})
const wrapAsync = require('../utils/wrapAsync.js')
const ExpressError = require('../utils/ExpressError.js')
const {listingSchema, reviewSchema} = require('../schema.js')
const Review = require('../models/reviews.js')
const Listing = require('../models/listing')
const {validateReview, isLoggedIn, isReviewAuthor, verifyCsrfToken} = require('../middleware.js')
const reviewController = require('../controllers/review.js')

//reviews--> post route
router.post("/",verifyCsrfToken,validateReview,isLoggedIn ,wrapAsync(reviewController.createReview))

// reviews --> delete route
// $pull operator removes from an existing array all instances of a value or values that match a specified condition

router.delete("/:reviewId",verifyCsrfToken,isLoggedIn,isReviewAuthor, wrapAsync(reviewController.deleteReview))

module.exports = router