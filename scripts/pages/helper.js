import { SESSION_STORAGE_KEY } from "../../data/factories/userFactory.js";

export const readStore = (key, fallback = []) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
};

export const writeStore = (key, value) => localStorage.setItem(key, JSON.stringify(value));

export const getSession = () => {
  try { return JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY)); }
  catch { return null; }
};

export const setSession = (user) => sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
export const clearSession = () => sessionStorage.removeItem(SESSION_STORAGE_KEY);

export function requireUser(requiredRole = null) {
  const user = getSession();
  if (!user || (requiredRole && user.role !== requiredRole)) {
    window.location.replace("login.html");
    return null;
  }
  return user;
}

export function showMessage(element, message, type = "error") {
  element.textContent = message;
  element.className = `form-message ${type}`;
  element.hidden = false;
}

export function formatDate(date) {
  return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(new Date(`${date}T12:00:00`));
}

export function reservationCode() {
  return `SR-${Date.now().toString().slice(-6)}`;
}
