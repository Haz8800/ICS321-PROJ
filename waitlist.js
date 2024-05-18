const { supabase } = require('./supabaseClient');

function init() {
    loadWaitlistedTickets();

    document.getElementById('waitlistSelect').addEventListener('change', function() {
        const ticketId = this.value;
        if (ticketId) {
            loadTicketDetails(ticketId);
        }
    });

    document.getElementById('confirmTicketButton').addEventListener('click', async function() {
        if (confirm("Are you sure you want to confirm this ticket?")) {
            await updateTicketStatus(1); // 1 for confirmed
            location.reload(); // Refresh the page after updating
        }
    });

    document.getElementById('cancelTicketButton').addEventListener('click', async function() {
        if (confirm("Are you sure you want to cancel this ticket?")) {
            await updateTicketStatus(3); // 3 for cancelled
            location.reload(); // Refresh the page after updating
        }
    });
}

async function loadWaitlistedTickets() {
    const { data, error } = await supabase
        .from('Waitlist_Ticket')
        .select('Ticket_ID, SeatID, TicketStatus');

    if (error) {
        console.error('Error loading waitlisted tickets:', error);
        return;
    }

    const ticketSelect = document.getElementById('waitlistSelect');
    ticketSelect.innerHTML = '<option value="">Select a Ticket</option>';
    data.forEach(ticket => {
        let option = document.createElement('option');
        option.value = ticket.Ticket_ID;
        option.textContent = `Ticket ID: ${ticket.Ticket_ID}`;
        ticketSelect.appendChild(option);
    });
}

async function loadTicketDetails(ticketId) {
    console.log(`Fetching details for ticket ID: ${ticketId}`);
    
    const { data, error } = await supabase
        .from('Waitlist_Ticket')
        .select('SeatID, TicketStatus')
        .eq('Ticket_ID', ticketId)
        .single();

    if (error) {
        console.error('Error fetching ticket details:', error);
        return;
    }

    console.log('Fetched data:', data);


    const seatDisplay = document.getElementById('seatDisplay');
    if (seatDisplay) {
        seatDisplay.value = data.SeatID; 
        console.log('Seat displayed:', data.SeatID);
    } else {
        console.error('Seat display element not found');
    }


    const statusDisplay = document.getElementById('ticketStatus');
    if (statusDisplay) {

        const { data: statusData, error: statusError } = await supabase
            .from('TicketStatus')
            .select('StatusName')
            .eq('Status_ID', data.TicketStatus)
            .single();

        if (statusError) {
            console.error('Error fetching status name:', statusError);
            return;
        }

        statusDisplay.value = statusData.StatusName; 
        console.log('Status displayed:', statusData.StatusName);
    } else {
        console.error('Status display element not found');
    }
}

async function updateTicketStatus(newStatus) {
    const ticketId = document.getElementById('waitlistSelect').value;
    if (!ticketId) {
        alert('Please select a ticket to proceed.');
        return;
    }

    const { error } = await supabase
        .from('Ticket')
        .update({ TicketStatus: newStatus })
        .match({ Ticket_ID: ticketId });

    if (error) {
        console.error('Error updating ticket status:', error);
        alert('Failed to update the ticket status. Please try again.');
    } else {
        alert('Ticket status updated successfully.');
    }
}

// Check if DOM is fully loaded before initializing
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
