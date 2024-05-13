// Assuming supabaseClient.js has been set up correctly with CommonJS style
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
        password: formData.get('password'), 
        passportno: formData.get('passportno')
    };

    // Insert user data into 'person' table
    try {
        const { data: personData, error: personError } = await supabase
            .from('person')
            .insert([{
                username: userData.username,
                phoneno: userData.phoneno,
                birthdate: userData.birthdate,
                fname: userData.fname,
                mname: userData.mname,
                lname: userData.lname,
                password: userData.password 
            }]);

        if (personError) throw personError;

        // Assuming 'person' table automatically handles 'userid' creation (e.g., auto-increment)
        const userId = personData[0].id; // Retrieve the user ID assigned by the database

        // Insert into 'passenger' table using retrieved 'userId'
        const { data: passengerData, error: passengerError } = await supabase
            .from('passenger')
            .insert([{
                userid: userId,
                passportno: userData.passportno
            }]);

        if (passengerError) throw passengerError;

        alert('Registration successful!');
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Registration failed:', error);
        alert('Failed to register. Please try again.');
    }
});
