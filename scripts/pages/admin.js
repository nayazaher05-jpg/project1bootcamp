import { ensureSeeded } from "../../data/seeders/seeders.js";
import { RESTAURANT_STORAGE_KEY, RESERVATION_STORAGE_KEY } from "../../data/factories/restoFactory.js";
import { readStore, writeStore, requireUser, clearSession, formatDate } from "./helper.js";

ensureSeeded();
const admin = requireUser("admin");
if (!admin) throw new Error("Administrator access required");

const reservations = () => readStore(RESERVATION_STORAGE_KEY);
const restaurants = () => readStore(RESTAURANT_STORAGE_KEY);
const dashboard = document.querySelector("#dashboardStats");
const rows = document.querySelector("#reservationRows");
const restaurantCards = document.querySelector("#restaurantCards");
document.querySelector("#adminName").textContent = admin.name;
document.querySelector("#topAdminName").textContent = admin.name;
document.querySelector(".admin-topbar-actions .button").addEventListener("click", (event) => {
  event.preventDefault();
  window.location.href = "booking.html";
});

function render() {
  const all = reservations().sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
  const confirmed = all.filter((item) => item.status === "confirmed");
  const today = new Date().toISOString().slice(0, 10);
  dashboard.innerHTML = `<article><span>Total reservations</span><strong>${all.length}</strong></article><article><span>Confirmed</span><strong>${confirmed.length}</strong></article><article><span>Today</span><strong>${confirmed.filter((item) => item.date === today).length}</strong></article><article><span>Guests booked</span><strong>${confirmed.reduce((total, item) => total + item.guests, 0)}</strong></article>`;
  rows.innerHTML = all.length ? all.map((booking) => `<tr><td><b>${booking.customerName}</b><br><small>${booking.customerEmail}</small></td><td>${booking.restaurantName}<br><small>${booking.tableName}</small></td><td>${formatDate(booking.date)}<br><small>${booking.time} · ${booking.guests} guests</small></td><td><span class="status ${booking.status}">${booking.status}</span></td><td><select class="status-select" data-id="${booking.id}"><option value="confirmed" ${booking.status === "confirmed" ? "selected" : ""}>Confirmed</option><option value="completed" ${booking.status === "completed" ? "selected" : ""}>Completed</option><option value="cancelled" ${booking.status === "cancelled" ? "selected" : ""}>Cancelled</option></select></td></tr>`).join("") : '<tr><td colspan="5" class="empty-state">No reservations have been made yet.</td></tr>';
  restaurantCards.innerHTML = restaurants().map((restaurant) => `<article class="restaurant-admin"><div><p class="eyebrow">${restaurant.cuisine}</p><h3>${restaurant.name}</h3><p>${restaurant.location} · ★ ${restaurant.rating}</p></div><strong>${restaurant.tables.length} tables</strong><small>${restaurant.tables.map((table) => `${table.name} (${table.capacity})`).join(" · ")}</small></article>`).join("");
}

rows.addEventListener("change", (event) => {
  const select = event.target.closest(".status-select");
  if (!select) return;
  writeStore(RESERVATION_STORAGE_KEY, reservations().map((booking) => booking.id === select.dataset.id ? { ...booking, status: select.value } : booking));
  render();
});
document.querySelector("#logoutButton").addEventListener("click", () => { clearSession(); window.location.href = "login.html"; });
render();
