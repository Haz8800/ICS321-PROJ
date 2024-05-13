document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Gather the form data
    var formData = new FormData(event.target);
    var userData = {};
    formData.forEach(function(value, key) {
        userData[key] = value;
    });

    // Here you would typically send this data to the server or your Supabase client for registration
    console.log('User Data:', userData);

    // Simulate successful registration
    alert('Registration successful!');
    window.location.href = 'mainpage.html'; // Redirect back to the login page
});
