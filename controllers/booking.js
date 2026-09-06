const Booking = require('../models/booking')
const Listing = require('../models/listing')
const ExpressError = require('../utils/ExpressError')

// Create a new booking
module.exports.createBooking = async (req, res) => {
    const { id } = req.params  // listing id
    const { checkIn, checkOut } = req.body.booking

    const listing = await Listing.findById(id)
    if (!listing) throw new ExpressError(404, "Listing not found")

    // Prevent owner from booking their own listing
    if (listing.owner.equals(req.user._id)) {
        req.flash("error", "You cannot book your own listing!")
        return res.redirect(`/listings/${id}`)
    }

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
    const { bookingId } = req.params
    const booking = await Booking.findById(bookingId)

    if (!booking) throw new ExpressError(404, "Booking not found")

    // Only the guest who booked can cancel
    if (!booking.guest.equals(req.user._id)) {
        req.flash("error", "You are not authorized to cancel this booking!")
        return res.redirect('/bookings/my-bookings')
    }

    booking.status = "cancelled"
    await booking.save()

    req.flash("success", "Booking cancelled successfully!")
    res.redirect('/bookings/my-bookings')
}