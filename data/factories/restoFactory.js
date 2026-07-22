// Factories contain constants only. Seeders imports these values into LocalStorage.
export const DEFAULT_RESTAURANTS = [
  {
    id: "bait-al-halabi-001",
    name: "Bait Al Halabi",
    cuisine: "Authentic Syrian Cuisine",
    location: "Aleppo, Syria",
    rating: 4.9,
    description: "A refined Syrian dining experience shaped by warm hospitality, Damascus flavours, and generous sharing plates.",
    tables: [
      { id: "bah-01", name: "Damascus Window", capacity: 2, zone: "Lantern window" },
      { id: "bah-02", name: "Courtyard Table", capacity: 2, zone: "Courtyard" },
      { id: "bah-03", name: "Mosaic Table", capacity: 4, zone: "Main dining" },
      { id: "bah-04", name: "Family Majlis", capacity: 6, zone: "Private majlis" },
      { id: "bah-05", name: "The Halabi Table", capacity: 8, zone: "Chef's room" }
    ]
  }
];

export const RESTAURANT_STORAGE_KEY = "smartReservationRestaurants";
export const RESERVATION_STORAGE_KEY = "smartReservationReservations";
