const express = require('express')
const router = express.Router()
const Listing = require('../models/listing')
const wrapAsync = require('../utils/wrapAsync.js')
const ExpressError = require('../utils/ExpressError.js')
const {listingSchema, reviewSchema} = require('../schema.js')
const flash = require('connect-flash')
const {isLoggedIn, isOwner,validateListing,verifyCsrfToken} = require('../middleware.js')
const listingController = require('../controllers/listing.js')
const {storage} = require('../cloudConfig.js')
const multer  = require('multer')
const upload = multer({ storage })

router.route('/')
.get(wrapAsync(listingController.index))                                                 //index route
.post(isLoggedIn,upload.single("listing[image]"),verifyCsrfToken,validateListing,
wrapAsync( listingController.createListing)  )        //create route


//new route
router.get('/new',isLoggedIn,listingController.renderNewForm)

router.route('/:id')
.get(wrapAsync(listingController.showListing))                                               //show route
.put(isLoggedIn,isOwner,upload.single("listing[image]"), verifyCsrfToken, validateListing, wrapAsync(listingController.updateListing))        //update route
.delete(isLoggedIn,isOwner, verifyCsrfToken, wrapAsync(listingController.deleteListing))                     //delete route

//edit route
router.get('/:id/edit',isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm))

module.exports = router
