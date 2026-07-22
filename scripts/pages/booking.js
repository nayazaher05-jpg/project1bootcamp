import { ensureSeeded } from "../../data/seeders/seeders.js";
import { RESTAURANT_STORAGE_KEY, RESERVATION_STORAGE_KEY } from "../../data/factories/restoFactory.js";
import { readStore, writeStore, requireUser, clearSession, formatDate, reservationCode, showMessage } from "./helper.js";

ensureSeeded();
const currentUser = requireUser();
if (!currentUser) throw new Error("Authentication required");

const restaurants = readStore(RESTAURANT_STORAGE_KEY);
const form = document.querySelector("#reservationForm");
const restaurantSelect = document.querySelector("#restaurantPicker") || document.querySelector("#restaurant");
const dateInput = document.querySelector("#date");
const tableSelect = document.querySelector("#table");
const history = document.querySelector("#reservationHistory");
const message = document.querySelector("#bookingMessage");

document.querySelector("#userName").textContent = currentUser.name;
const today = new Date();
// Build the date from local values so the minimum is never yesterday in a positive UTC offset.
dateInput.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
dateInput.value = dateInput.min;

// Preserve the choices made in the landing-page availability search.
const search = new URLSearchParams(window.location.search);
const requestedDate = search.get("date");
const requestedTime = search.get("time");
const requestedGuests = search.get("guests");
if (requestedDate && requestedDate >= dateInput.min) dateInput.value = requestedDate;
if (requestedTime && form.querySelector(`[name="time"][value="${requestedTime}"]`)) {
  form.querySelector(`[name="time"][value="${requestedTime}"]`).checked = true;
}
if (requestedGuests && [...form.guests.options].some((option) => option.value === requestedGuests)) {
  form.guests.value = requestedGuests;
}
restaurantSelect.innerHTML = restaurants.map((restaurant) => `<option value="${restaurant.id}">${restaurant.name} — ${restaurant.cuisine}</option>`).join("");

const displayTime = (time) => {
  const [hour, minute] = time.split(":").map(Number);
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;
};

function updateSummary() {
  const restaurant = restaurants.find((item) => item.id === restaurantSelect.value);
  const selectedTable = restaurant?.tables.find((item) => item.id === tableSelect.value);
  const setText = (id, value) => document.querySelector(id)?.replaceChildren(document.createTextNode(value));
  setText("#restaurantTitle", restaurant?.name || "Select a restaurant");
  setText("#restaurantMeta", restaurant ? `${restaurant.cuisine} · ${restaurant.location}` : "");
  setText("#summaryRestaurant", restaurant?.name || "Select a restaurant");
  setText("#summaryDate", dateInput.value ? formatDate(dateInput.value) : "Select a date");
  setText("#summaryTime", displayTime(form.time.value));
  setText("#summaryGuests", `${form.guests.value} ${Number(form.guests.value) === 1 ? "guest" : "guests"}`);
  setText("#summaryTable", selectedTable ? `${selectedTable.name} · ${selectedTable.capacity} seats` : "No table available");
  const available = tableSelect.options.length && tableSelect.value;
  setText("#availabilityNote", available ? `${tableSelect.options.length} table${tableSelect.options.length === 1 ? "" : "s"} available for your party` : "No tables available for this selection");
}

function availableTables() {
  const restaurant = restaurants.find((item) => item.id === restaurantSelect.value);
  const guests = Number(form.guests.value || 1);
  const reservations = readStore(RESERVATION_STORAGE_KEY);
  const unavailable = reservations.filter((booking) => booking.restaurantId === restaurant.id && booking.date === dateInput.value && booking.time === form.time.value && booking.status !== "cancelled").map((booking) => booking.tableId);
  const tables = restaurant.tables.filter((table) => table.capacity >= guests && !unavailable.includes(table.id));
  tableSelect.innerHTML = tables.length ? tables.map((table) => `<option value="${table.id}">${table.name} · ${table.capacity} guests · ${table.zone}</option>`).join("") : '<option value="">No tables available for this slot</option>';
  updateSummary();
}

function renderHistory() {
  const reservations = readStore(RESERVATION_STORAGE_KEY).filter((booking) => booking.userId === currentUser.id).sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
  history.innerHTML = reservations.length ? reservations.map((booking) => `
    <article class="reservation-card">
      <div><span class="status ${booking.status}">${booking.status}</span><h3>${booking.restaurantName}</h3><p>${formatDate(booking.date)} · ${booking.time} · ${booking.guests} guests</p><small>${booking.tableName} · Ref: ${booking.code}</small></div>
      ${booking.status === "confirmed" ? `<button class="button ghost cancel-button" data-id="${booking.id}">Cancel</button>` : ""}
    </article>`).join("") : '<p class="empty-state">No reservations yet. Your next great meal starts above.</p>';
}

[restaurantSelect, dateInput, form.guests, tableSelect].forEach((input) => input.addEventListener("change", availableTables));
form.querySelectorAll('[name="time"]').forEach((input) => input.addEventListener("change", availableTables));

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const restaurant = restaurants.find((item) => item.id === restaurantSelect.value);
  const table = restaurant.tables.find((item) => item.id === tableSelect.value);
  if (!table) return showMessage(message, "Please choose another date, time, or number of guests.");
  const reservations = readStore(RESERVATION_STORAGE_KEY);
  const conflict = reservations.some((booking) => booking.restaurantId === restaurant.id && booking.tableId === table.id && booking.date === dateInput.value && booking.time === form.time.value && booking.status !== "cancelled");
  if (conflict) { availableTables(); return showMessage(message, "That table was just booked. Please select another one."); }
  reservations.push({ id: `reservation-${Date.now()}`, code: reservationCode(), userId: currentUser.id, customerName: currentUser.name, customerEmail: currentUser.email, restaurantId: restaurant.id, restaurantName: restaurant.name, tableId: table.id, tableName: table.name, date: dateInput.value, time: form.time.value, guests: Number(form.guests.value), note: String(form.note.value).trim(), status: "confirmed", createdAt: new Date().toISOString() });
  writeStore(RESERVATION_STORAGE_KEY, reservations);
  showMessage(message, `Reservation confirmed at ${restaurant.name}!`, "success");
  form.note.value = "";
  availableTables();
  renderHistory();
});

history.addEventListener("click", (event) => {
  const button = event.target.closest(".cancel-button");
  if (!button) return;
  const reservations = readStore(RESERVATION_STORAGE_KEY).map((booking) => booking.id === button.dataset.id ? { ...booking, status: "cancelled" } : booking);
  writeStore(RESERVATION_STORAGE_KEY, reservations);
  availableTables(); renderHistory();
});

document.querySelector("#logoutButton").addEventListener("click", () => { clearSession(); window.location.href = "login.html"; });
availableTables();
renderHistory();
