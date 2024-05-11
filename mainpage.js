document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;


    console.log('Logging in with:', username, password);

    
  
    if (username === 'admin' && password === 'adminpass') {
        window.location.href = 'admin_dashboard.html';
    } else if (username === 'user' && password === 'userpass') {
        window.location.href = 'passenger_dashboard.html'; 
    } else {
        alert('Invalid credentials!');
    }
});
