// app.js

// 1. Load and validate environment variables using dotenv-safe
require("dotenv-safe").config({
	example: ".env.example",
	allowEmpty: false
});

const express = require("express");
const path = require("path");
const data = require("./database/data.json");
const fs = require("fs").promises;
const cookieParser = require("cookie-parser");
const livereload = require("connect-livereload");
const { body, validationResult } = require("express-validator");
const session = require("express-session");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
// const morgan = require("morgan");
const userService = require("./services/userService");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 3000;

// 2. Security Enhancements

// Use Helmet to set secure HTTP headers
app.use(helmet());

// Logging HTTP requests using Morgan
// app.use(morgan("combined"));

// Rate Limiting to prevent brute-force attacks
const generalLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // limit each IP to 100 requests per windowMs
	message: { error: "Too many requests, please try again later." }
});
app.use(generalLimiter);

const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 20, // limit each IP to 20 requests per windowMs
	message: { error: "Too many login attempts, please try again later." }
});
app.use(["/signin", "/signup"], authLimiter);

// 3. Middleware Setup

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Parse cookies
app.use(cookieParser());

// LiveReload for development (optional)
app.use(livereload());

// Session Management
app.use(
	session({
		secret: process.env.SECRET_KEY, // Use a strong secret
		resave: false, // Don't save session if unmodified
		saveUninitialized: false, // Don't create session until something stored
		cookie: {
			secure: false, // Set to true in production with HTTPS
			httpOnly: true, // Prevents client-side JS from accessing the cookie
			maxAge: 1000 * 60 * 60 // 1 hour
		}
	})
);

// 4. View Engine Setup

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "frontend"));

// 5. Ensure SECRET_KEY is set
const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
	console.error("SECRET_KEY is not set in the environment variables");
	process.exit(1);
}

// 6. Middleware to Make User Available in All Templates
app.use((req, res, next) => {
	res.locals.user = req.session.user;
	next();
});

// 7. Routes

// GET /
app.get("/", async (req, res, next) => {
	try {
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
	} catch (error) {
		next(error);
	}
});

// GET /post
app.get("/post", (req, res) => {
	res.render("post.ejs");
});

// GET /signin
app.get("/signin", (req, res) => {
	res.render("signin.ejs");
});

// GET /signup
app.get("/signup", (req, res) => {
	try {
		res.render("signup", {
			title: "Sign Up to Zahr",
			errors: {},
			message: null
		});
	} catch (error) {
		console.error("Error rendering signup page:", error);
		res
			.status(500)
			.json({ error: "An error occurred while loading the signup page" });
	}
});

// app.get("/logout", (req, res) => {
// 	// Check if the user is authenticated
// 	if (req.session.user) {
// 		// Render the logout confirmation page
// 		res.render("logout"); // Ensure 'logout' corresponds to your view/template
// 	} else {
// 		// If not authenticated, redirect to home or login page
// 		res.redirect("/");
// 	}
// });

// POST /logout route to handle the logout process
app.post("/logout", (req, res) => {
	// Clear the cookie or session
	res.clearCookie("token"); // Clear the authentication cookie
	req.session.destroy((err) => {
		if (err) {
			return res.status(500).json({ error: "Failed to log out." });
		}
		res.status(200).json({ message: "Logged out successfully." });
	});
});

// POST /signup
app.post(
	"/signup",
	[
		body("email").isEmail().normalizeEmail(),
		body("username").isLength({ min: 3 }).trim().escape(),
		body("password").isLength({ min: 6 }),
		body("confirmPassword").custom(
			(value, { req }) => value === req.body.password
		)
	],
	async (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		try {
			const { email, username, password } = req.body;
			const { token } = await userService.registerUser({
				email,
				username,
				password
			});

			// Set the token in a cookie
			res.cookie("token", token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production"
			});

			// Optionally, save user info in session
			req.session.user = { email, username };

			// Send success message
			if (res.status(201)) {
				console.log("User registered successfully.");
				res.render("signin");
			}
		} catch (error) {
			next(error);
		}
	}
);

// POST /signin
app.post(
	"/signin",
	[body("email").isEmail().normalizeEmail(), body("password").notEmpty()],
	async (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		try {
			const { email, password } = req.body;
			const { token } = await userService.authenticateUser({ email, password });

			// Set the token in a cookie
			res.cookie("token", token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production"
			});

			// Optionally, save user info in session
			const user = await userService.getUserByEmail(email); // You might need to implement this method
			req.session.user = { email: user.email, username: user.username };

			// Redirect to the index page
			res.redirect("/"); // Assuming the index page is at the root URL
		} catch (error) {
			next(error);
		}
	}
);

// Protected Route Example
app.get("/protected", verifyToken, (req, res) => {
	res.send("This is a protected route.");
});

// 8. Error Handling Middleware (Should be after all routes)
app.use((err, req, res, next) => {
	console.error(err.stack);
	const status = err.status || 500;
	res.status(status).json({ error: err.message || "Something went wrong!" });
});

// 9. JWT Verification Middleware
function verifyToken(req, res, next) {
	const token = req.cookies.token || "";
	if (!token) {
		return res.status(403).json({ error: "No token provided." });
	}

	jwt.verify(token, SECRET_KEY, (err, authData) => {
		if (err) {
			return res.status(403).json({ error: "Failed to authenticate token." });
		}
		req.authData = authData;
		next();
	});
}

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
