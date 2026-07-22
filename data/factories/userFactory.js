// Factories contain constants only. Seeders imports these values into LocalStorage.
export const DEFAULT_USERS = [
  {
    id: "admin-001",
    name: "Restaurant Administrator",
    email: "admin@smarttable.com",
    password: "admin123",
    role: "admin",
    createdAt: "2026-01-01T09:00:00.000Z"
  }
];

export const USER_STORAGE_KEY = "smartReservationUsers";
export const SESSION_STORAGE_KEY = "smartReservationSession";
