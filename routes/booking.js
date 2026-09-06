const express = require('express')
const router = express.Router({ mergeParams: true })
const wrapAsync = require('../utils/wrapAsync')
const { isLoggedIn } = require('../middleware')
const bookingController = require('../controllers/booking')

// Create booking
router.post('/', isLoggedIn, wrapAsync(bookingController.createBooking))

// My bookings page
router.get('/my-bookings', isLoggedIn, wrapAsync(bookingController.myBookings))

// Cancel booking
router.delete('/:bookingId', isLoggedIn, wrapAsync(bookingController.cancelBooking))

module.exports = router