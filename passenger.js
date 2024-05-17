const { supabase } = require('./supabaseClient');

function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

function init() {
    console.log('Initialization started');
    loadTakeOffCities();
    loadSeats();
    loadUserTickets(); 

    const takeOffCitySelect = document.getElementById('takeOffCity');
    const arrivalCitySelect = document.getElementById('arrivalCity');
    const userTicketsSelect = document.getElementById('userTicketsSelect');
    const updateTicketButton = document.getElementById('updateTicketButton');
    const ticketDateSelect = document.getElementById('ticketDate'); 
    const cancelTicketButton = document.getElementById('cancelTicketButton');

    ticketDateSelect.innerHTML = '<option value="">Select a Date</option>';  

    takeOffCitySelect.addEventListener('change', debounce(() => {
        const city = takeOffCitySelect.value;
        if (city) {
            console.log(`Loading arrival cities for take-off city: ${city}`);
            loadArrivalCities(city);
        }
    }, 300));

    arrivalCitySelect.addEventListener('change', debounce(() => {
        const takeoffCity = takeOffCitySelect.value;
        const arrivalCity = arrivalCitySelect.value;
        if (takeoffCity && arrivalCity) {
            console.log(`Loading take-off times and dates for ${takeoffCity} to ${arrivalCity}`);
            loadTakeOffTimes(takeoffCity, arrivalCity);
            loadTakeOffDates(takeoffCity, arrivalCity);
        }
    }, 300));

    userTicketsSelect.addEventListener('change', function() {
        const ticketId = this.value;
        if (ticketId) {
            console.log(`Loading details for ticket ID: ${ticketId}`);
            loadTicketDetails(ticketId);
        }
    });

    updateTicketButton.addEventListener('click', async function() {
        await updateTicket();
    });

    cancelTicketButton.addEventListener('click', handleCancelTicket);

    document.getElementById('reserveButton').addEventListener('click', async (e) => {
        e.preventDefault();
        console.log("Processing reservation...");
        await handleReservation();
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}



async function loadTakeOffCities() {
    console.log('Fetching take-off cities');
    const { data, error } = await supabase.from('Flight').select('TakeoffCity');
    if (error) {
        console.error('Error fetching takeoff cities:', error);
        return;
    }

    const takeoffCitySelect = document.getElementById('takeOffCity');
    takeoffCitySelect.innerHTML = '<option value="">Select Take-off City</option>';

    const uniqueCities = new Set(data.map(item => item.TakeoffCity));
    uniqueCities.forEach(city => {
        let option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        takeoffCitySelect.appendChild(option);
    });

    console.log('Takeoff cities loaded:', Array.from(uniqueCities));
}

async function loadArrivalCities(takeoffCity) {
    console.log(`Fetching arrival cities for ${takeoffCity}`);
    const { data, error } = await supabase.from('Flight').select('ArrivalCity').eq('TakeoffCity', takeoffCity);
    if (error) {
        console.error('Error fetching arrival cities:', error);
        return;
    }

    const arrivalCitySelect = document.getElementById('arrivalCity');
    arrivalCitySelect.innerHTML = '<option value="">Select Arrival City</option>';

    const uniqueCities = new Set(data.map(item => item.ArrivalCity));
    uniqueCities.forEach(city => {
        let option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        arrivalCitySelect.appendChild(option);
    });

    console.log('Arrival cities loaded:', Array.from(uniqueCities));
}

async function loadTakeOffTimes(takeoffCity, arrivalCity) {
    console.log(`Fetching take-off times for ${takeoffCity} to ${arrivalCity}`);
    const { data, error } = await supabase.from('Flight').select('TakeoffTime').eq('TakeoffCity', takeoffCity).eq('ArrivalCity', arrivalCity);
    if (error) {
        console.error('Error fetching takeoff times:', error);
        return;
    }

    const takeoffTimeSelect = document.getElementById('takeOffTime');
    takeoffTimeSelect.innerHTML = '<option value="">Select Take-off Time</option>';

    data.forEach(time => {
        let option = document.createElement('option');
        option.value = time.TakeoffTime;
        option.textContent = time.TakeoffTime;
        takeoffTimeSelect.appendChild(option);
    });

    console.log('Takeoff times loaded:', data);
}

async function loadTakeOffDates(takeoffCity, arrivalCity) {
    console.log(`Fetching take-off dates for flights from ${takeoffCity} to ${arrivalCity}`);
    const { data: flightData, error: flightError } = await supabase.from('Flight').select('Flight_ID').eq('TakeoffCity', takeoffCity).eq('ArrivalCity', arrivalCity);
    if (flightError) {
        console.error('Error fetching Flight_ID:', flightError);
        return;
    }

    const flightIDs = flightData.map(flight => flight.Flight_ID);
    const { data: dateData, error: dateError } = await supabase.from('Flight_Date').select('Date').in('Flight_ID', flightIDs);
    if (dateError) {
        console.error('Error fetching Takeoff Dates:', dateError);
        return;
    }

    const takeoffDateSelect = document.getElementById('takeOffDate');
    takeoffDateSelect.innerHTML = '<option value="">Select Date</option>';

    dateData.forEach(date => {
        let option = document.createElement('option');
        option.value = date.Date;
        option.textContent = new Date(date.Date).toLocaleDateString();
        takeoffDateSelect.appendChild(option);
    });

    console.log('Takeoff dates loaded:', dateData);
}

async function loadSeats() {
    console.log('Fetching available seats');
    const { data, error } = await supabase.from('seats').select('seatid');
    if (error) {
        console.error('Error fetching seats:', error);
        return;
    }

    const seatSelect = document.getElementById('seatSelect');
    seatSelect.innerHTML = '<option value="">Select Seat</option>';

    data.forEach(seat => {
        let option = document.createElement('option');
        option.value = seat.seatid;
        option.textContent = seat.seatid;
        seatSelect.appendChild(option);
    });

    console.log('Seats loaded and added to dropdown successfully.');
}

async function handleReservation() {
    const takeoffCity = document.getElementById('takeOffCity').value;
    const arrivalCity = document.getElementById('arrivalCity').value;
    const takeoffTime = document.getElementById('takeOffTime').value;
    const takeoffDate = document.getElementById('takeOffDate').value;
    const seatID = document.getElementById('seatSelect').value;
    const userID = sessionStorage.getItem('userId');

    console.log('Starting reservation process');
    const { data: flightData, error: flightError } = await supabase
        .from('Flight')
        .select('Flight_ID')
        .eq('TakeoffCity', takeoffCity)
        .eq('ArrivalCity', arrivalCity)
        .eq('TakeoffTime', takeoffTime)
        .single();

    if (flightError) {
        console.error('Error fetching flight ID:', flightError);
        alert('Error in fetching flight details. Please try again.');
        return;
    }

 
    const { error: insertError } = await supabase
        .from('Ticket')
        .insert([
            { User_ID: userID, TicketStatus: 1, SeatID: seatID, Flight_ID: flightData.Flight_ID }
        ]);

    if (insertError) {
        console.error('Error making reservation:', insertError);
        alert('Reservation failed. Please try again.');
        return;
    }

 
    const { data: ticketData, error: retrieveError } = await supabase
        .from('Ticket')
        .select('Ticket_ID')
        .eq('User_ID', userID)
        .eq('SeatID', seatID)
        .eq('Flight_ID', flightData.Flight_ID)
        .order('Ticket_ID', { ascending: false })
        .limit(1);

    if (retrieveError || !ticketData.length) {
        console.error('Error retrieving Ticket_ID:', retrieveError);
        alert('Failed to retrieve Ticket ID. Please try again.');
        return;
    }

    const ticketID = ticketData[0].Ticket_ID;
    sessionStorage.setItem('reservedTicketId', ticketID);

    alert('Reservation successful! Click OK to proceed to payment.');
    window.location.href = 'payment.html';
}

async function loadUserTickets() {
    const userId = sessionStorage.getItem('userId');
    console.log(`Loading tickets for user ID: ${userId}`);
    const { data, error } = await supabase
        .from('Ticket')
        .select('Ticket_ID')
        .eq('User_ID', userId);

    if (error) {
        console.error('Error loading tickets:', error);
        return;
    }

    const ticketSelect = document.getElementById('userTicketsSelect');
    ticketSelect.innerHTML = '<option value="">Select a Ticket</option>'; 
    data.forEach(ticket => {
        let option = document.createElement('option');
        option.value = ticket.Ticket_ID;
        option.textContent = `Ticket ID: ${ticket.Ticket_ID}`;
        ticketSelect.appendChild(option);
    });

    console.log('User tickets loaded:', data);
}


async function loadTicketDetails(ticketId) {
    sessionStorage.setItem('reservedTicket', ticketId);
    const { data, error } = await supabase
        .from('Ticket')
        .select(`
            Flight_ID,
            TicketStatus,
            SeatID,
            Flight:Flight_ID (TakeoffCity, ArrivalCity)  
        `)
        .eq('Ticket_ID', ticketId)
        .single();
            
    if (error) {
        console.error('Error fetching ticket details:', error);
        return;
    }

    loadTicketStatus(ticketId); 
    loadTicketTime(data.Flight_ID); 
    updateSeatSelection(data.SeatID);


    if (data.Flight) {
        loadTicketTime(data.Flight.TakeoffCity, data.Flight.ArrivalCity);
    } else {
        console.error('Flight details not available for the ticket');
    }
}

async function loadTicketStatus(ticketId) {

    const { data: ticketData, error: ticketError } = await supabase
        .from('Ticket')
        .select('TicketStatus')
        .eq('Ticket_ID', ticketId)
        .single();

    if (ticketError) {
        console.error('Error fetching ticket status:', ticketError);
        return;
    }

    console.log('TicketStatus:', ticketData.TicketStatus);  

 
    const { data: statusData, error: statusError } = await supabase
        .from('TicketStatus')
        .select('StatusName')
        .eq('Status_ID', ticketData.TicketStatus)
        .single();

    if (statusError) {
        console.error('Error fetching status name:', statusError);
        return;
    }

    console.log('StatusName:', statusData.StatusName); 

    const statusDisplay = document.getElementById('ticketStatus');
statusDisplay.value = statusData.StatusName; 
console.log('Status displayed in the element:', statusDisplay.value); 

}


async function loadTicketTime(takeoffCity, arrivalCity) {
    console.log(`Fetching all available takeoff times for the route from ${takeoffCity} to ${arrivalCity}`);
    const { data, error } = await supabase
        .from('Flight')
        .select('TakeoffTime, Flight_ID')  
        .eq('TakeoffCity', takeoffCity)
        .eq('ArrivalCity', arrivalCity);

    if (error) {
        console.error('Error fetching takeoff times:', error);
        return;
    }

    const timeSelect = document.getElementById('ticketTime');
    timeSelect.innerHTML = '<option value="">Select a Time</option>';  

    data.forEach(flight => {
        let option = document.createElement('option');
        option.value = flight.Flight_ID;  
        option.textContent = flight.TakeoffTime;
        timeSelect.appendChild(option);
    });

 
    timeSelect.onchange = () => {
        if(timeSelect.value) {
            loadTicketDates(timeSelect.value);
        }
    };

    console.log('All available takeoff times loaded:', data);
}

async function loadTicketDates(flightId) {
    console.log(`Fetching available dates for Flight_ID: ${flightId}`);
    const { data, error } = await supabase
        .from('Flight_Date')
        .select('Date')
        .eq('Flight_ID', flightId);

    if (error) {
        console.error('Error fetching flight dates:', error);
        return;
    }

    const dateSelect = document.getElementById('ticketDate');
    dateSelect.innerHTML = '<option value="">Select a Date</option>';  

    data.forEach(date => {
        let option = document.createElement('option');
        option.value = date.Date;
        option.textContent = new Date(date.Date).toLocaleDateString();
        dateSelect.appendChild(option);
    });

    console.log('Available dates loaded for the selected flight:', data);
}

    

async function updateSeatSelection(currentSeatId) {
    console.log('Fetching available seats');
    const { data, error } = await supabase.from('seats').select('seatid');
    if (error) {
        console.error('Error fetching seats:', error);
        return;
    }

    const seatSelect = document.getElementById('seatUpdateSelect');
    seatSelect.innerHTML = '';  

 
    data.forEach(seat => {
        let option = document.createElement('option');
        option.value = seat.seatid;
        option.textContent = seat.seatid;
        seatSelect.appendChild(option);
    });

 
    seatSelect.value = currentSeatId;
    console.log('Seats loaded and current seat set.');
}

async function updateTicket() {
    const ticketId = document.getElementById('userTicketsSelect').value;
    const selectedFlightId = document.getElementById('ticketTime').value;
    const newSeatId = document.getElementById('seatUpdateSelect').value;


    const { data: currentTicketData, error: currentTicketError } = await supabase
        .from('Ticket')
        .select(`Flight_ID`)
        .eq('Ticket_ID', ticketId)
        .single();

    if (currentTicketError) {
        console.error('Error fetching current ticket details:', currentTicketError);
        alert('Failed to fetch current ticket details. Please try again.');
        return;
    }

    let newFlightId = currentTicketData.Flight_ID; 

  
    if (selectedFlightId !== currentTicketData.Flight_ID) {
        const { data: flightData, error: flightError } = await supabase
            .from('Flight')
            .select('Flight_ID')
            .eq('Flight_ID', selectedFlightId)
            .single();

        if (flightError || !flightData) {
            console.error('Error fetching new Flight ID:', flightError);
            alert('Failed to find a matching flight for the new time. Please try again.');
            return;
        }

        newFlightId = flightData.Flight_ID; 
    }

    
    const { error: updateError } = await supabase
        .from('Ticket')
        .update({ SeatID: newSeatId, Flight_ID: newFlightId })
        .match({ Ticket_ID: ticketId });

    if (updateError) {
        console.error('Error updating ticket:', updateError);
        alert('Failed to update the ticket. Please try again.');
    } else {
        alert('Ticket updated successfully.');
    }
}




async function handleCancelTicket() {
    const ticketId = document.getElementById('userTicketsSelect').value; 
    

    if (!ticketId) {
        alert("No ticket selected for cancellation.");
        return;
    }

 
    const { error } = await supabase
        .from('Ticket')
        .update({ TicketStatus: 3 }) 
        .eq('Ticket_ID', ticketId);

    if (error) {
        console.error('Error cancelling ticket:', error);
        alert('Failed to cancel the ticket. Please try again.');
    } else {
        alert('Ticket cancellation pending. You need to pay the cancellation fee.');
        window.location.href = 'paymentv2.html'; 
    }
}

