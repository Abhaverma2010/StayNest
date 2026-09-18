if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();
}

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const mongo_url = process.env.NODE_ENV === "production"
  ? process.env.ATLASDB_URL
  : "mongodb://127.0.0.1:27017/wanderlust";

const geocodingClient = mbxGeocoding({ accessToken: process.env.MAP_TOKEN });

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(mongo_url);
}

// Listing.geometry is required, so every sample listing needs real
// coordinates before it can be inserted — geocode each one the same way
// controllers/listing.js does for a real listing, instead of skipping
// validation or hardcoding coordinates.
const initDB = async () => {
  await Listing.deleteMany({});

  const geocodedListings = [];
  for (const obj of initData.data) {
    try {
      const response = await geocodingClient
        .forwardGeocode({ query: `${obj.location}, ${obj.country}`, limit: 1 })
        .send();

      if (!response.body.features.length) {
        console.log(`Skipping "${obj.title}" — no geocoding match for "${obj.location}, ${obj.country}"`);
        continue;
      }

      geocodedListings.push({
        ...obj,
        owner: "6a2aade1829f1edd14ea3b71", // placeholder id — no real user is created by this script
        geometry: response.body.features[0].geometry,
      });
    } catch (err) {
      console.log(`Skipping "${obj.title}" — geocoding failed: ${err.message}`);
    }
  }

  await Listing.insertMany(geocodedListings);
  console.log(`data was initialized — ${geocodedListings.length}/${initData.data.length} listings inserted`);
};

initDB();