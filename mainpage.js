document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    // Placeholder for authentication logic
    console.log('Logging in with:', username, password);

    // Here you would normally send the credentials to the server to validate the login
    // For now, we're just simulating a login check
    if (username === 'admin' && password === 'adminpass') {
        window.location.href = 'admin_dashboard.html'; // Redirect to Admin Dashboard
    } else if (username === 'user' && password === 'userpass') {
        window.location.href = 'passenger_dashboard.html'; // Redirect to Passenger Dashboard
    } else {
        alert('Invalid credentials!');
    }
});
