const Booking = require('../models/booking')

// Create a new booking
module.exports.createBooking = async (req, res) => {
    const { id } = req.params  // listing id
    const { checkIn, checkOut } = req.body.booking
    const listing = req.listing  // loaded + owner-checked by preventOwnerBooking middleware

    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)

    // Basic date validation
    if (checkInDate >= checkOutDate) {
        req.flash("error", "Check-out date must be after check-in date!")
        return res.redirect(`/listings/${id}`)
    }

    if (checkInDate < new Date()) {
        req.flash("error", "Check-in date cannot be in the past!")
        return res.redirect(`/listings/${id}`)
    }

    // Conflict check — core logic
    const conflict = await Booking.findOne({
        listing: id,
        status: { $ne: "cancelled" },
        $or: [
            { checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } }
        ]
    })

    if (conflict) {
        req.flash("error", "These dates are already booked. Please choose different dates!")
        return res.redirect(`/listings/${id}`)
    }

    // Calculate total price
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))
    const totalPrice = nights * listing.price

    const booking = new Booking({
        listing: id,
        guest: req.user._id,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        totalPrice
    })

    await booking.save()
    req.flash("success", `Booking confirmed! Total: ₹${totalPrice} for ${nights} night(s)`)
    res.redirect(`/bookings/my-bookings`)
}

// Show all bookings for logged-in user
module.exports.myBookings = async (req, res) => {
    const bookings = await Booking.find({ guest: req.user._id })
        .populate('listing')
        .sort({ checkIn: 1 })

    res.render('bookings/my-bookings', { bookings })
}

// Cancel a booking
module.exports.cancelBooking = async (req, res) => {
    const booking = req.booking  // loaded + guest-checked by isBookingGuest middleware

    booking.status = "cancelled"
    await booking.save()

    req.flash("success", "Booking cancelled successfully!")
    res.redirect('/bookings/my-bookings')
}