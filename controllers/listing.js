const Listing = require('../models/listing');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
const Booking = require('../models/booking')

module.exports.index = async(req,res,next)=>{
    const allListings = await Listing.find({})
    res.render('listings/index.ejs',{allListings})  
}

module.exports.renderNewForm = (req,res)=>{
    res.render('listings/new.ejs')
}

module.exports.showListing = async(req,res)=>{
    let {id} = req.params
    const listing = await Listing.findById(id)
    .populate({path:"reviews",
        populate:{path:"author"},
    })
    .populate("owner")

    if(!listing){
        req.flash("error","Listing you requested for does not exist")
        return res.redirect('/listings')
    }
      // Fetch active booked dates for this listing
    const bookedDates = await Booking.find({
        listing: id,
        status: { $ne: "cancelled" },
        checkOut: { $gte: new Date() }
    }).select('checkIn checkOut')

    res.render('listings/show.ejs',{listing,bookedDates})
}


module.exports.createListing = async(req,res)=>{
    // let {title, description, image, price, location, country} = req.body
    // let listing = req.body.listing
    // if(!req.body.listing){
    //     throw new ExpressError(400,'send valid data for listing')
    // }

   let response = await geocodingClient.forwardGeocode({
  query: req.body.listing.location,
  limit: 1
})
  .send()
 

    let url = req.file.path
    let filename = req.file.filename
    const newListing = new Listing(req.body.listing)   //as it is in JS object form so we create an instance of it
    newListing.owner = req.user._id
    newListing.image = {url,filename}
    newListing.geometry = response.body.features[0].geometry
    let savedListing = await newListing.save()
    console.log(savedListing)
    req.flash("success","New listing created")
    res.redirect('/listings')
}

module.exports.renderEditForm = async(req,res)=>{
    let {id} = req.params
    const listing = await Listing.findById(id)
    if(!listing){
        req.flash("error","Listing you requested for does not exist")
        return res.redirect('/listings')
    }
    let originalImageUrl = listing.image.url
    originalImageUrl = originalImageUrl.replace('/upload', '/upload/w_250')
    res.render('listings/edit.ejs',{listing,originalImageUrl})
}

module.exports.updateListing = async(req,res)=>{
    let {id} = req.params
    let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing},{new:true})
    if(typeof req.file !== "undefined"){
        listing.image = {url: req.file.path, filename: req.file.filename}
        await listing.save()
    }
    req.flash("success","Listing updated")
    res.redirect(`/listings/${id}`)
}

module.exports.deleteListing = async(req,res)=>{
    // if(!req.body.listing){
    //     throw new ExpressError(400,'send valid data for listing')
    // }
    let {id} = req.params
    let deletedListing = await Listing.findByIdAndDelete(id)
    req.flash("success","Listing deleted")
    res.redirect('/listings')
}