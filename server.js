require("dotenv").config();
const express = require("express");
const path = require("path");
const data = require("./database/data.json");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const cookieParser = require("cookie-parser");
const livereload = require("connect-livereload");

const app = express();
const PORT = process.env.PORT || 3000;

//MIDDLEWARES
app.use(express.static(path.join(__dirname, "public"))); // Serve static files from the 'public' directory
app.use(express.json()); // Add middleware to parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Add middleware to parse URL-encoded bodies
app.use(cookieParser()); // Add middleware to parse cookies
app.use(livereload()); // Include connect-livereload middleware

app.set("view engine", "ejs");
app.set("views", "frontend");

// Ensure SECRET_KEY is set
const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
	console.error("SECRET_KEY is not set in the environment variables");
	process.exit(1);
}

//GET
app.get("/", function (req, res) {
	const allPosts = [];
	for (let category of data) {
		for (let post of category?.posts) {
			allPosts?.push(post);
		}
	}
	// Sort posts by date descending and select the top 3 as recent posts
	const recentPosts = allPosts
		.sort((a, b) => new Date(b.date) - new Date(a.date))
		.slice(0, 3);

	res.render("index.ejs", { allPosts, recentPosts });
});

app.get("/signin", function (req, res) {
	res.render("signin.ejs");
});

app.get("/post", function (req, res) {
	res.render("post.ejs");
});

//POST
app.get("/signup", (req, res) => {
	try {
		res.render("signup", {
			title: "Sign Up to Zahr",
			errors: {},
			message: null
		});
	} catch (error) {
		console.error("Error rendering signup page:", error);
		res?.status(500)?.send("An error occurred while loading the signup page");
	}
});

app.post("/signup", async (req, res) => {
	const { email, username, password, confirmPassword } = req.body;

	// Basic validation
	if (!email || !username || !password || !confirmPassword) {
		return res?.status(400)?.send("All fields are required.");
	}

	if (password !== confirmPassword) {
		return res?.status(400)?.send("Passwords do not match.");
	}

	// Load existing users
	const usersFile = path?.join(__dirname, "database", "users.json");
	let users = [];

	if (fs.existsSync(usersFile)) {
		const data = fs?.readFileSync(usersFile);
		console.log({ data });

		users = JSON?.parse(data);
		console.log({ users });
	}

	// Check if user already exists
	const userExists = users?.find(
		(user) => user?.email === email || user?.username === username
	);

	if (userExists) {
		return res.status(400).send("User already exists.");
	}

	// Hash password
	const hashedPassword = await bcrypt?.hash(password, 10);

	// Create new user
	const newUser = {
		id: Date.now(),
		email,
		username,
		password: hashedPassword
	};

	users.push(newUser);

	// Save users to file
	fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

	// Generate JWT
	const token = jwt.sign({ id: newUser?.id }, SECRET_KEY, { expiresIn: "48h" });

	// Send token as JSON response
	res.json({ message: "User registered successfully.", token });
});

app.post("/signin", async (req, res) => {
	const { email, password } = req.body;

	// Basic validation
	if (!email || !password) {
		return res.status(400).send("Email and password are required.");
	}

	// Load users
	const usersFile = path.join(__dirname, "database", "users.json");
	if (!fs.existsSync(usersFile)) {
		return res.status(400).send("No users found.");
	}

	const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
	const user = users.find((user) => user.email === email);

	if (!user) {
		return res.status(400).send("Invalid email or password.");
	}

	// Compare passwords
	const isMatch = await bcrypt.compare(password, user.password);

	if (!isMatch) {
		return res.status(400).send("Invalid email or password.");
	}

	// Generate JWT
	const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: "48h" });

	// Optionally, set the token in a cookie or send it in the response
	const loginAuth = res.json({ message: "Signed in successfully.", token });
	// console.log({ loginAuth });
});

// Protected Route Example
app.get("/protected", verifyToken, (req, res) => {
	res.send("This is a protected route.");
});

// JWT Verification Middleware
function verifyToken(req, res, next) {
	const bearerHeader = req.headers["authorization"];

	if (typeof bearerHeader !== "undefined") {
		const bearer = bearerHeader.split(" ");
		const token = bearer[1];

		jwt.verify(token, SECRET_KEY, (err, authData) => {
			if (err) {
				res.sendStatus(403); // Forbidden
			} else {
				req.authData = authData;
				next();
			}
		});
	} else {
		res.sendStatus(403);
	}
}

app.listen(PORT, function () {
	console.log(`Server is running on port ${PORT}`);
});
