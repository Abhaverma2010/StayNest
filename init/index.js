if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();
}

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const mongo_url = process.env.NODE_ENV === "production"
  ? process.env.ATLASDB_URL
  : "mongodb://127.0.0.1:27017/wanderlust";

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

const initDB = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({...obj,owner:'6a2aade1829f1edd14ea3b71'})) //every object gets this owner
  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};

initDB();