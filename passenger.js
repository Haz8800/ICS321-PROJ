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

    const takeOffCitySelect = document.getElementById('takeOffCity');
    const arrivalCitySelect = document.getElementById('arrivalCity');

    takeOffCitySelect.addEventListener('change', debounce(() => {
        const city = takeOffCitySelect.value;
        if(city) {
            console.log(`Loading arrival cities for take-off city: ${city}`);
            loadArrivalCities(city);
        }
    }, 300));

    arrivalCitySelect.addEventListener('change', debounce(() => {
        const takeoffCity = takeOffCitySelect.value;
        const arrivalCity = arrivalCitySelect.value;
        if(takeoffCity && arrivalCity) {
            console.log(`Loading take-off times and dates for ${takeoffCity} to ${arrivalCity}`);
            loadTakeOffTimes(takeoffCity, arrivalCity);
            loadTakeOffDates(takeoffCity, arrivalCity);
        }
    }, 300));

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

    const { data, error } = await supabase
        .from('Ticket')
        .insert([
            { User_ID: userID, TicketStatus: 1, SeatID: seatID, Flight_ID: flightData.Flight_ID }
        ]);

    if (error) {
        console.error('Error making reservation:', error);
        alert('Reservation failed. Please try again.');
        return;
    } else {
        alert('Reservation successful! Click OK to proceed to payment.');
        
        window.location.href = 'payment.html'; 
    }
}
