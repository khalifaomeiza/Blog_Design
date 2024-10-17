document.getElementById("logoutButton").addEventListener("click", function () {
	document.getElementById("logoutModal").style.display = "block"; // Show the modal
});

document.getElementById("cancelLogout").addEventListener("click", function () {
	document.getElementById("logoutModal").style.display = "none"; // Hide the modal
});

document.getElementById("confirmLogout").addEventListener("click", function () {
	// Make a POST request to the logout route
	fetch("/logout", {
		method: "POST",
		credentials: "include" // Include cookies in the request
	})
		.then((response) => {
			if (response.ok) {
				window.location.href = "/"; // Redirect to home after logout
			} else {
				alert("Logout failed. Please try again.");
			}
		})
		.catch((error) => {
			console.error("Error during logout:", error);
		});
});
