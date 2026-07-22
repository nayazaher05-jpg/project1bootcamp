import { DEFAULT_USERS, USER_STORAGE_KEY } from "../factories/userFactory.js";
import {
  DEFAULT_RESTAURANTS,
  RESTAURANT_STORAGE_KEY,
  RESERVATION_STORAGE_KEY
} from "../factories/restoFactory.js";

const SEED_VERSION_KEY = "smartReservationSeedVersion";
const SEED_VERSION = "3";

const copy = (value) => JSON.parse(JSON.stringify(value));

// This is the only place where application data is seeded into LocalStorage.
export function ensureSeeded() {
  const refreshRestaurantData = localStorage.getItem(SEED_VERSION_KEY) !== SEED_VERSION;
  if (!refreshRestaurantData) return;

  if (!localStorage.getItem(USER_STORAGE_KEY)) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(copy(DEFAULT_USERS)));
  }
  // Version 3 replaces earlier location-specific demo content with the Aleppo restaurant data.
  localStorage.setItem(RESTAURANT_STORAGE_KEY, JSON.stringify(copy(DEFAULT_RESTAURANTS)));
  localStorage.setItem(RESERVATION_STORAGE_KEY, JSON.stringify([]));
  localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION);
}
