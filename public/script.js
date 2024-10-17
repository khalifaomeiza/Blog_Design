// frontend/js/main.js

document.addEventListener("DOMContentLoaded", () => {
	const navToggle = document.querySelector(".nav-toggle");
	const links = document.querySelector(".links");

	if (navToggle && links) {
		navToggle.addEventListener("click", () => {
			links.classList.toggle("show");
		});
	} else {
		console.error("navToggle or links element not found.");
	}

	let currentDate = new Date();

	function generateCalendar(year, month) {
		const firstDay = new Date(year, month, 1).getDay();
		const daysInMonth = new Date(year, month + 1, 0).getDate();

		const monthNames = [
			"January",
			"February",
			"March",
			"April",
			"May",
			"June",
			"July",
			"August",
			"September",
			"October",
			"November",
			"December"
		];

		document.getElementById(
			"currentMonth"
		).textContent = `${monthNames[month]} ${year}`;

		let date = 1;
		let calendarHTML = "";

		for (let i = 0; i < 6; i++) {
			let row = "<tr>";
			for (let j = 0; j < 7; j++) {
				// Adjust firstDay: Sunday (0) to last day in week (6)
				let adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
				if (i === 0 && j < adjustedFirstDay) {
					row += "<td></td>";
				} else if (date > daysInMonth) {
					row += "<td></td>";
				} else {
					const isToday =
						date === currentDate.getDate() &&
						month === currentDate.getMonth() &&
						year === currentDate.getFullYear()
							? ' class="today"'
							: "";
					row += `<td${isToday} data-date="${year}-${String(month + 1).padStart(
						2,
						"0"
					)}-${String(date).padStart(2, "0")}">${date}</td>`;
					date++;
				}
			}
			row += "</tr>";
			calendarHTML += row;
			if (date > daysInMonth) {
				break;
			}
		}

		document.getElementById("calendarBody").innerHTML = calendarHTML;
	}

	function updateCalendar() {
		generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
	}

	// Initialize Calendar
	updateCalendar();

	// Event Listeners for Calendar Navigation
	document.getElementById("prevMonth").addEventListener("click", () => {
		currentDate.setMonth(currentDate.getMonth() - 1);
		updateCalendar();
	});

	document.getElementById("nextMonth").addEventListener("click", () => {
		currentDate.setMonth(currentDate.getMonth() + 1);
		updateCalendar();
	});

	document.getElementById("prevYear").addEventListener("click", () => {
		currentDate.setFullYear(currentDate.getFullYear() - 1);
		updateCalendar();
	});

	document.getElementById("nextYear").addEventListener("click", () => {
		currentDate.setFullYear(currentDate.getFullYear() + 1);
		updateCalendar();
	});

	// Event Listener for Selecting a Date
	document.getElementById("calendarBody").addEventListener("click", (e) => {
		if (e.target.tagName === "TD" && e.target.textContent !== "") {
			document
				.querySelectorAll("td.selected")
				.forEach((td) => td.classList.remove("selected"));
			e.target.classList.add("selected");
			document.getElementById("dateInput").value = e.target.dataset.date;
		}
	});

	// Event Listener for Searching Posts by Date
	document.getElementById("searchDate").addEventListener("click", () => {
		const selectedDate = document.getElementById("dateInput").value;
		if (selectedDate) {
			// Here you would typically make an AJAX call to fetch posts for the selected date
			console.log(`Fetching posts for date: ${selectedDate}`);
			// For demonstration, we'll just log the date. In a real application, you'd update the posts list with the fetched data.
		} else {
			console.warn("No date selected for search.");
		}
	});

	document.addEventListener("DOMContentLoaded", function () {
		var lazyImages = [].slice.call(document.querySelectorAll("img.lazy-image"));

		if ("IntersectionObserver" in window) {
			let lazyImageObserver = new IntersectionObserver(function (
				entries,
				observer
			) {
				entries.forEach(function (entry) {
					if (entry.isIntersecting) {
						let lazyImage = entry.target;
						lazyImage.src = lazyImage.dataset.src;
						lazyImage.srcset = lazyImage.dataset.srcset;
						lazyImage.classList.add("loaded");
						lazyImageObserver.unobserve(lazyImage);
					}
				});
			});

			lazyImages.forEach(function (lazyImage) {
				lazyImageObserver.observe(lazyImage);
			});
		} else {
			// Fallback for browsers that don't support IntersectionObserver
			lazyImages.forEach(function (lazyImage) {
				lazyImage.src = lazyImage.dataset.src;
				lazyImage.srcset = lazyImage.dataset.srcset;
				lazyImage.classList.add("loaded");
			});
		}
	});
});

// Toastr Configuration (optional)
document.addEventListener("DOMContentLoaded", function () {
	// Toastr Configuration (optional)
	toastr.options = {
		closeButton: true,
		progressBar: true,
		positionClass: "toast-top-right",
		timeOut: "5000"
	};

	// Handle Signup Form Submission
	const signupForm = document.getElementById("signupForm");
	if (signupForm) {
		signupForm.addEventListener("submit", function (e) {
			e.preventDefault(); // Prevent default form submission

			const formData = {
				email: document.getElementById("email").value,
				username: document.getElementById("username").value,
				password: document.getElementById("password").value,
				confirmPassword: document.getElementById("confirmPassword").value
			};

			fetch("/signup", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(formData)
			})
				.then((response) => {
					if (!response.ok) {
						return response.json().then((errorData) => {
							throw errorData; // Throw an error to be caught in the catch block
						});
					}
					return response.json(); // Parse JSON response
				})
				.then((data) => {
					toastr.success(data.message);
					// Optionally, redirect or reset form
					window.location.href = "/";
				})
				.catch((error) => {
					if (error.errors) {
						error.errors.forEach((err) => {
							toastr.error(err.msg);
						});
					} else if (error.error) {
						toastr.error(error.error);
					} else {
						toastr.error("An unknown error occurred.");
					}
				});
		});
	}

	// Handle Signin Form Submission
	const signinForm = document.getElementById("signinForm");
	if (signinForm) {
		signinForm.addEventListener("submit", function (e) {
			e.preventDefault(); // Prevent default form submission

			const formData = {
				email: document.getElementById("email").value,
				password: document.getElementById("password").value
			};

			console.log(formData, "FormData");

			fetch("/signin", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(formData)
			})
				.then((response) => {
					if (!response.ok) {
						return response.json().then((errorData) => {
							throw errorData; // Throw an error to be caught in the catch block
						});
					}
					return response.json(); // Parse JSON response
				})
				.then((data) => {
					toastr.success(data.message);
					// Optionally, redirect
					window.location.href = "/";
				})
				.catch((error) => {
					if (error.errors) {
						error.errors.forEach((err) => {
							toastr.error(err.msg);
						});
					} else if (error.error) {
						toastr.error(error.error);
					} else {
						toastr.error("An unknown error occurred.");
					}
				});
		});
	}
});

// logout.js

document.getElementById("logoutButton").addEventListener("click", function () {
	// Make a POST request to the logout route
	fetch("/logout", {
		method: "POST",
		credentials: "include" // Include cookies in the request
	})
		.then((response) => {
			if (response.ok) {
				// Redirect to home or login page after successful logout
				window.location.href = "/"; // Change this to your desired redirect URL
			} else {
				alert("Logout failed. Please try again.");
			}
		})
		.catch((error) => {
			console.error("Error during logout:", error);
		});
});
