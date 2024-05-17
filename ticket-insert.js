const { supabase } = require('./supabaseClient');  

document.getElementById('insert-form').addEventListener('submit', async function(event) {
    event.preventDefault();  


    const formData = new FormData(event.target);
    const ticketData = {
        User_ID: formData.get('userId'),
        TicketStatus: formData.get('ticketStatus'),
        SeatID: formData.get('seatId'),
        Flight_ID: formData.get('flightId')
    };

    try {
        const { data, error } = await supabase
            .from('Ticket')
            .insert([ticketData]);

        if (error) {
            throw error;
        }

        alert('Ticket inserted successfully!');
        window.location.href = 'ticket-insert.html'; 
    } catch (error) {
        console.error('Ticket insertion failed:', error.message || 'Unknown error');
        alert('Ticket insertion failed. Please try again.');
    }
});
