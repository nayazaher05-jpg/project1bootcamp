import { ensureSeeded } from "../../data/seeders/seeders.js";
import { USER_STORAGE_KEY } from "../../data/factories/userFactory.js";
import { readStore, writeStore, getSession, setSession, showMessage } from "./helper.js";

ensureSeeded();

const loginForm = document.querySelector("#loginForm");
const signupForm = document.querySelector("#signupForm");
const message = document.querySelector("#formMessage");
const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

if (getSession()) window.location.replace("booking.html");

if (loginForm) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(loginForm);
    const email = String(form.get("email")).trim().toLowerCase();
    const password = String(form.get("password"));
    if (!isValidEmail(email) || !password) return showMessage(message, "Enter a valid email address and password.");
    const user = readStore(USER_STORAGE_KEY).find((item) => item.email === email && item.password === password);
    if (!user) return showMessage(message, "Email or password is incorrect.");
    setSession({ id: user.id, name: user.name, email: user.email, role: user.role });
    window.location.href = user.role === "admin" ? "admin.html" : "booking.html";
  });
}

if (signupForm) {
  signupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(signupForm);
    const name = String(form.get("name")).trim();
    const email = String(form.get("email")).trim().toLowerCase();
    const password = String(form.get("password"));
    const confirmPassword = String(form.get("confirmPassword"));
    if (name.length < 2) return showMessage(message, "Please enter your full name.");
    if (!isValidEmail(email)) return showMessage(message, "Please enter a valid email address.");
    if (password.length < 6) return showMessage(message, "Password must be at least 6 characters.");
    if (password !== confirmPassword) return showMessage(message, "Passwords do not match.");
    const users = readStore(USER_STORAGE_KEY);
    if (users.some((user) => user.email === email)) return showMessage(message, "An account with that email already exists.");
    const user = { id: `user-${Date.now()}`, name, email, password, role: "customer", createdAt: new Date().toISOString() };
    users.push(user);
    writeStore(USER_STORAGE_KEY, users);
    setSession({ id: user.id, name: user.name, email: user.email, role: user.role });
    window.location.href = "booking.html";
  });
}
