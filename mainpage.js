const { supabase } = require('./supabaseClient');

document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
   
        const { data: personData, error: personError } = await supabase
            .from('person')
            .select('userid, password')
            .eq('username', username)
            .single();

        if (personError) {
            throw new Error('Login failed: ' + personError.message);
        }

        console.log('Person data:', personData);

      
        if (personData.password !== password) {
            throw new Error('Invalid password');
        }

        sessionStorage.setItem('userId', personData.userid);
        console.log('User ID:', personData.userid);

  
        const { data: passengerData, error: passengerError } = await supabase
            .from('passenger')
            .select('userid')
            .eq('userid', personData.userid)
            .maybeSingle();  

        if (passengerError) {
            throw new Error('Error checking passenger role: ' + passengerError.message);
        }

        if (passengerData) {
            window.location.href = 'passenger_dashboard.html';  
            return;
        }

        const { data: adminData, error: adminError } = await supabase
            .from('admin')
            .select('userid')
            .eq('userid', personData.userid)
            .maybeSingle(); 

        if (adminError) {
            throw new Error('Error checking admin role: ' + adminError.message);
        }

        if (adminData) {
            window.location.href = 'admin_dashboard.html';  
            return;
        }

        throw new Error('Login failed: User role not determined');
    } catch (error) {
        console.error('Login process error:', error);
        alert(error.message);
    }
});
