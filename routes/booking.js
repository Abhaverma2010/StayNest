const express = require('express')
const router = express.Router({ mergeParams: true })
const wrapAsync = require('../utils/wrapAsync')
const { isLoggedIn, validateBooking, verifyCsrfToken, preventOwnerBooking, isBookingGuest } = require('../middleware')
const bookingController = require('../controllers/booking')

// Create booking
router.post('/', verifyCsrfToken, isLoggedIn, preventOwnerBooking, validateBooking, wrapAsync(bookingController.createBooking))

// My bookings page
router.get('/my-bookings', isLoggedIn, wrapAsync(bookingController.myBookings))

// Cancel booking
router.delete('/:bookingId', verifyCsrfToken, isLoggedIn, isBookingGuest, wrapAsync(bookingController.cancelBooking))

module.exports = router