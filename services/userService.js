// services/userService.js

const path = require("path");
const fs = require("fs").promises;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const usersFile = path.join(__dirname, "../database", "users.json");

// Load users from the JSON file
async function loadUsers() {
	try {
		const data = await fs.readFile(usersFile, "utf-8");
		return JSON.parse(data);
	} catch (error) {
		if (error.code === "ENOENT") return [];
		throw error;
	}
}


// Save users to the JSON file
async function saveUsers(users) {
	await fs.writeFile(usersFile, JSON.stringify(users, null, 2));
}

// Register a new user
async function registerUser({ email, username, password }) {
	const users = await loadUsers();
	const userExists = users.find(
		(user) =>
			user.email.toLowerCase() === email.toLowerCase() ||
			user.username === username
	);
	if (userExists) {
		const error = new Error("User already exists.");
		error.status = 400;
		throw error;
	}

	const hashedPassword = await bcrypt.hash(password, 10);
	const newUser = { id: Date.now(), email, username, password: hashedPassword };
	users.push(newUser);
	await saveUsers(users);

	const token = jwt.sign({ id: newUser.id }, process.env.SECRET_KEY, {
		expiresIn: "78h"
	});
	return { user: newUser, token };
}

// Authenticate a user during sign-in
async function authenticateUser({ email, password }) {
	const users = await loadUsers();
	const user = users.find(
		(user) => user.email.toLowerCase() === email.toLowerCase()
	);
	if (!user) {
		const error = new Error("Invalid email or password.");
		error.status = 400;
		throw error;
	}

	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) {
		const error = new Error("Invalid email or password.");
		error.status = 400;
		throw error;
	}

	const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
		expiresIn: "72h"
	});
	return { user, token };
}

// Optional: Get user by email (for session management)
async function getUserByEmail(email) {
	const users = await loadUsers();
	return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}


module.exports = {
	registerUser,
	authenticateUser,
	getUserByEmail
};
