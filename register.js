const { supabase } = require('./supabaseClient');

document.getElementById('registerForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    // Collect form data
    const formData = new FormData(event.target);
    const userData = {
        username: formData.get('username'),
        phoneno: formData.get('phone'),
        birthdate: formData.get('birthdate'),
        fname: formData.get('firstname'),
        mname: formData.get('middlename'),
        lname: formData.get('lastname'),
        passportno: formData.get('passportno'),
        password: formData.get('password') // Consider hashing this password
    };

    try {
        const { data, error } = await supabase
            .from('person')
            .insert([userData]);

        if (error) {
            throw error;
        }

        alert('Registration successful!');
        window.location.href = 'login.html'; // Redirect back to the login page
    } catch (error) {
        console.error('Registration failed:', error.message || 'Unknown error');
        alert('Registration failed. Please try again.');
    }
});
