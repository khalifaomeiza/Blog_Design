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
});
