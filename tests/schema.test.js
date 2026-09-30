const { listingSchema, reviewSchema, bookingSchema } = require("../schema.js");

describe("listingSchema", () => {
  it("accepts a valid listing payload", () => {
    const { error } = listingSchema.validate({
      listing: {
        title: "Cozy Cottage",
        description: "A nice place",
        location: "Goa",
        country: "India",
        price: 1500,
      },
    });
    expect(error).toBeUndefined();
  });

  it("rejects a listing missing required fields", () => {
    const { error } = listingSchema.validate({ listing: { title: "Only a title" } });
    expect(error).toBeDefined();
  });

  it("rejects a negative price", () => {
    const { error } = listingSchema.validate({
      listing: {
        title: "Cozy Cottage",
        description: "A nice place",
        location: "Goa",
        country: "India",
        price: -50,
      },
    });
    expect(error).toBeDefined();
    expect(error.details[0].path).toContain("price");
  });
});

describe("reviewSchema", () => {
  it("accepts a rating within 1-5", () => {
    const { error } = reviewSchema.validate({ review: { rating: 4, comment: "Great stay" } });
    expect(error).toBeUndefined();
  });

  it.each([0, 6, -1])("rejects an out-of-range rating (%i)", (rating) => {
    const { error } = reviewSchema.validate({ review: { rating, comment: "x" } });
    expect(error).toBeDefined();
  });
});

describe("bookingSchema", () => {
  it("accepts valid check-in/check-out dates", () => {
    const { error } = bookingSchema.validate({
      booking: { checkIn: "2026-10-01", checkOut: "2026-10-05" },
    });
    expect(error).toBeUndefined();
  });

  it("rejects a missing checkOut date", () => {
    const { error } = bookingSchema.validate({ booking: { checkIn: "2026-10-01" } });
    expect(error).toBeDefined();
  });

  it("rejects a malformed date string", () => {
    const { error } = bookingSchema.validate({
      booking: { checkIn: "not-a-date", checkOut: "2026-10-05" },
    });
    expect(error).toBeDefined();
  });
});
