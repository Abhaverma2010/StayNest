const mongoose = require("mongoose");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

require("dotenv").config();

const Listing = require("./models/listing"); // adjust path if needed

const geocodingClient = mbxGeocoding({
    accessToken: process.env.MAP_TOKEN,
});

main()
    .then(() => console.log("Connected to DB"))
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

async function updateListings() {
    const listings = await Listing.find({
        $or: [
            { geometry: { $exists: false } },
            { geometry: null }
        ]
    });

    console.log(`Found ${listings.length} listings to update`);

    for (let listing of listings) {
        try {
            const response = await geocodingClient
                .forwardGeocode({
                    query: listing.location,
                    limit: 1,
                })
                .send();

            if (response.body.features.length > 0) {
                listing.geometry = response.body.features[0].geometry;
                await listing.save();

                console.log(
                    `Updated: ${listing.title} ->`,
                    listing.geometry.coordinates
                );
            } else {
                console.log(`No coordinates found for ${listing.title}`);
            }
        } catch (err) {
            console.log(`Error updating ${listing.title}:`, err.message);
        }
    }

    console.log("Finished updating listings");
    mongoose.connection.close();
}

updateListings();