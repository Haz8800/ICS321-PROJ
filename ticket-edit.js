const { supabase } = require('./supabaseClient');

async function loadTicketIDs() {
    try {
        const { data, error } = await supabase
            .from('Ticket')
            .select('Ticket_ID');
        if (error) throw error;

        const selectElement = document.getElementById('ticketId');
        selectElement.innerHTML = '<option value="">Select a Ticket...</option>';  
        data.forEach(ticket => {
            const option = document.createElement('option');
            option.value = ticket.Ticket_ID;
            option.textContent = `Ticket ${ticket.Ticket_ID}`;
            selectElement.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load ticket data:', error.message);
    }
}

async function loadTicketData(ticketId) {
    if (!ticketId) return;

    try {
        const { data, error } = await supabase
            .from('Ticket')
            .select('*')
            .eq('Ticket_ID', ticketId)
            .single();
        if (error) throw error;

        document.getElementById('userId').value = data.User_ID || '';
        document.getElementById('ticketStatus').value = data.TicketStatus || '';
        document.getElementById('seatId').value = data.SeatID || '';
        document.getElementById('flightId').value = data.Flight_ID || '';
    } catch (error) {
        console.error('Failed to fetch ticket:', error.message);
    }
}
async function updateTicket() {
    const ticketId = document.getElementById('ticketId').value;
    const ticketData = {
        User_ID: document.getElementById('userId').value,
        TicketStatus: document.getElementById('ticketStatus').value,
        SeatID: document.getElementById('seatId').value,
        Flight_ID: document.getElementById('flightId').value
    };

    try {
        const { error } = await supabase
            .from('Ticket')
            .update(ticketData)
            .match({ Ticket_ID: ticketId });
        if (error) throw error;

        alert('Ticket updated successfully!');
    } catch (error) {
        console.error('Failed to update ticket:', error.message);
        alert('Failed to update ticket. Please try again.');
    }
}
async function removeTicket() {
    const ticketId = document.getElementById('ticketId').value;
    if (!ticketId || !confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) return;

    try {
        const { error } = await supabase
            .from('Ticket')
            .delete()
            .match({ Ticket_ID: ticketId });
        if (error) throw error;

        alert('Ticket successfully removed!');
        loadTicketIDs();  
    } catch (error) {
        console.error('Failed to remove ticket:', error.message);
        alert('Failed to remove ticket. Please try again.');
    }
}

function init() {

    loadTicketIDs();


    const ticketSelect = document.getElementById('ticketId');
    ticketSelect.addEventListener('change', function() {
        if (this.value) {
            console.log(`Loading details for ticket ID: ${this.value}`);
            loadTicketData(this.value);
        }
    });

  
    const form = document.getElementById('edit-form');
    form.addEventListener('submit', function(event) {
        event.preventDefault(); 
        console.log("Updating ticket...");
        updateTicket();
    });

  
    const removeButton = document.getElementById('removeTicket');
    removeButton.addEventListener('click', function() {
        console.log("Attempting to remove ticket...");
        removeTicket();
    });
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init); 
} else {
    init(); 
}
