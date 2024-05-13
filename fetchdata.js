// fetchData.js
const { supabase } = require('./supabaseClient');

async function fetchUsers() {
    try {
        const { data, error } = await supabase
            .from('Ticket')  // Ensure 'users' is a valid table in your Supabase project
            .select('*');

        if (error) {
            console.error('Error fetching users:', error);
            return;
        }

        console.log('Users fetched successfully:', data);
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

// Call the function to test it
fetchUsers();