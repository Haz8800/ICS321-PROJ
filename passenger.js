document.getElementById('searchFlightForm').addEventListener('submit', function(event) {
    event.preventDefault();
    fetchFlights();
});

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');
}

function fetchFlights() {
    console.log('Fetching flights...');
    var flightsHtml = `<p>Flight 123: City A to City B <button onclick="selectSeat('Flight123')">Select Seats</button></p>`;
    document.getElementById('flightResults').innerHTML = flightsHtml;
}

function selectSeat(flightId) {
    console.log('Selecting seat for', flightId);
    // Additional code to handle seat selection
}

function logout() {
    console.log('Logging out...');
    window.location.href = 'login.html'; // Redirect back to login page
}
