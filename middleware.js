const Listing = require("./models/listing")
const ExpressError = require('./utils/ExpressError.js')
const {listingSchema,reviewSchema,bookingSchema} = require('./schema.js')
const Review = require('./models/reviews.js')
const Booking = require('./models/booking.js')
const crypto = require('crypto')

module.exports.isLoggedIn = (req,res,next) =>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.headers.referer || "/listings";
        req.flash("error","you must be logged in to create a list.")
        return res.redirect('/login')
    }
    next()
}

module.exports.saveRedirectUrl = (req,res,next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl
    }
    next()
}

module.exports.isOwner = async (req,res,next) =>{
    let {id} = req.params
    let listing = await Listing.findById(id)
    if(!listing.owner.equals(res.locals.currUser._id)){
    // if(!listing.owner.equals(req.user._id)){
        req.flash("error", "you don't have permission to edit.")
        return res.redirect(`/listings/${id}`)
    }
    next()
}

module.exports.validateListing=(req,res,next)=>{
     let {error} = listingSchema.validate(req.body)

    if(error){
        let errMsg = error.details.map((el)=> el.message).join(",")
        throw new ExpressError(400,errMsg)
    }
    else{
        next()
    }
}

module.exports.validateReview=(req,res,next)=>{
     let {error} = reviewSchema.validate(req.body)

    if(error){
        let errMsg = error.details.map((el)=> el.message).join(",")
        throw new ExpressError(400,errMsg)
    }
    else{
        next()
    }
}

module.exports.isReviewAuthor = async(req,res,next)=>{
    let { reviewId } = req.params;

    let review = await Review.findById(reviewId);

    if(!review.author.equals(req.user._id)){
        req.flash("error","You are not the author.");
        // return res.redirect("back");
        return res.redirect(req.get("Referrer") || "/listings");
    }

    next();
}

module.exports.validateBooking = (req,res,next) => {
    let {error} = bookingSchema.validate(req.body)

    if(error){
        let errMsg = error.details.map((el)=> el.message).join(",")
        throw new ExpressError(400,errMsg)
    }
    else{
        next()
    }
}

// Loads the listing being booked, blocks the owner from booking their own
// listing, and attaches it as req.listing so the controller doesn't have
// to fetch it again.
module.exports.preventOwnerBooking = async (req,res,next) => {
    let { id } = req.params
    let listing = await Listing.findById(id)

    if(!listing){
        throw new ExpressError(404, "Listing not found")
    }

    if(listing.owner.equals(req.user._id)){
        req.flash("error", "You cannot book your own listing!")
        return res.redirect(`/listings/${id}`)
    }

    req.listing = listing
    next()
}

// Loads the booking being cancelled and checks that the logged-in user is
// the guest who made it, mirroring isOwner/isReviewAuthor.
module.exports.isBookingGuest = async (req,res,next) => {
    let { bookingId } = req.params
    let booking = await Booking.findById(bookingId)

    if(!booking){
        throw new ExpressError(404, "Booking not found")
    }

    if(!booking.guest.equals(req.user._id)){
        req.flash("error", "You are not authorized to cancel this booking!")
        return res.redirect('/bookings/my-bookings')
    }

    req.booking = booking
    next()
}

// CSRF protection — synchronizer token pattern using the existing session.
module.exports.generateCsrfToken = (req,res,next) => {
    if(!req.session.csrfToken){
        req.session.csrfToken = crypto.randomBytes(32).toString("hex")
    }
    res.locals.csrfToken = req.session.csrfToken
    next()
}

module.exports.verifyCsrfToken = (req,res,next) => {
    if(!req.body._csrf || req.body._csrf !== req.session.csrfToken){
        throw new ExpressError(403, "Invalid or expired form submission. Please refresh the page and try again.")
    }
    next()
}