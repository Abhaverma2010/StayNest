const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Review = require('./reviews.js')

const listingSchema = new Schema({
    title:{
        type:String,
        required:true
    },
    description:String,
    image: {
    filename: {
        type: String,
        // default: "listingimage",
    },
    url: {
        type: String,
        // default:
        //     "https://images.unsplash.com/photo-1682687982204-f1a77dcc3067?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        // set: (v) =>
        //     v === ""
        //         ? "https://images.unsplash.com/photo-1682687982204-f1a77dcc3067?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        //         : v,
    },
},
    price:Number,
    location:String,
    country:String,
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:"Review"
        }
    ],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    geometry:{
        type:{
            type:String,
            enum:["Point"],
            required:true
        },
        coordinates:{
            type:[Number],
            required:true
        }
    },
    // category:{
    //     type:String,
    //     enum:["mountains","city","farms","beaches","islands","countryside","deserts","lakes","caves"],
    //     required:true
    // }  implement it later
})

listingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing){
        await Review.deleteMany({_id: {$in: listing.reviews}})
    }
})

const Listing = mongoose.model('Listing', listingSchema)
module.exports = Listing