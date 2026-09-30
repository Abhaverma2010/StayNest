const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Booking = require("../models/booking.js");

// Exercises the exact overlap query used in controllers/booking.js, against
// a real (in-memory, disposable) MongoDB — not a mock — so it's testing the
// actual query semantics, not our assumptions about them.
async function hasConflict(listingId, checkIn, checkOut) {
  const conflict = await Booking.findOne({
    listing: listingId,
    status: { $ne: "cancelled" },
    $or: [{ checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } }],
  });
  return !!conflict;
}

describe("booking date-conflict detection", () => {
  let mongoServer;
  const listingId = new mongoose.Types.ObjectId();
  const guestId = new mongoose.Types.ObjectId();

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Booking.deleteMany({});
    // An existing confirmed booking: Oct 10 - Oct 15
    await Booking.create({
      listing: listingId,
      guest: guestId,
      checkIn: new Date("2026-10-10"),
      checkOut: new Date("2026-10-15"),
      totalPrice: 5000,
      status: "confirmed",
    });
  });

  it("flags an identical date range as a conflict", async () => {
    await expect(hasConflict(listingId, new Date("2026-10-10"), new Date("2026-10-15"))).resolves.toBe(true);
  });

  it("flags a partially overlapping range as a conflict", async () => {
    await expect(hasConflict(listingId, new Date("2026-10-12"), new Date("2026-10-18"))).resolves.toBe(true);
  });

  it("flags a range that fully contains the existing booking as a conflict", async () => {
    await expect(hasConflict(listingId, new Date("2026-10-05"), new Date("2026-10-20"))).resolves.toBe(true);
  });

  it("does NOT flag a booking that ends exactly when the existing one starts", async () => {
    await expect(hasConflict(listingId, new Date("2026-10-05"), new Date("2026-10-10"))).resolves.toBe(false);
  });

  it("does NOT flag a booking that starts exactly when the existing one ends", async () => {
    await expect(hasConflict(listingId, new Date("2026-10-15"), new Date("2026-10-20"))).resolves.toBe(false);
  });

  it("does NOT flag a completely separate date range", async () => {
    await expect(hasConflict(listingId, new Date("2026-11-01"), new Date("2026-11-05"))).resolves.toBe(false);
  });

  it("does NOT count a cancelled booking as a conflict", async () => {
    await Booking.updateMany({ listing: listingId }, { status: "cancelled" });
    await expect(hasConflict(listingId, new Date("2026-10-10"), new Date("2026-10-15"))).resolves.toBe(false);
  });

  it("does NOT flag an overlapping range on a different listing", async () => {
    const otherListingId = new mongoose.Types.ObjectId();
    await expect(hasConflict(otherListingId, new Date("2026-10-10"), new Date("2026-10-15"))).resolves.toBe(false);
  });
});
