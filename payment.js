const { supabase } = require('./supabaseClient');

// Initialize all event listeners and load initial data
function init() {
    console.log('Initialization started for the payment page');
    loadTotalPrice();
    // Ensuring elements are present
    const confirmButton = document.getElementById('confirmButton');
    const cancelButton = document.getElementById('cancelButton');
    const form = document.getElementById('paymentForm');

    if (!confirmButton || !cancelButton) {
        console.error('Payment buttons are not found, check HTML IDs and button existence in DOM.');
        return;  // Stop the function if buttons are not found
    }

    // Attaching event listeners
    confirmButton.addEventListener('click', async (e) => {
        e.preventDefault();
        console.log("Confirming payment...");
        await handleConfirmPayment();
    });

    cancelButton.addEventListener('click', (e) => {
        e.preventDefault();
        console.log("Cancelling payment...");
        handleCancelPayment();
    });

    // Optional: Adding a submission event listener to the form for additional control
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();  // Prevent the default form submission
            console.log("Form submitted");
        });
    } else {
        console.log('Payment form not found.');
    }
}

// Check if DOM is fully loaded before initializing
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
async function loadTotalPrice() {
    const ticketId = sessionStorage.getItem('reservedTicketId');
    if (!ticketId) {
        console.log('No ticket ID found in sessionStorage.');
        return;
    }
    
    const { data, error } = await supabase
        .from('TotalPrice')
        .select('TotalPrice')
        .eq('Ticket_ID', ticketId)
        .single();

    if (error) {
        console.error('Error fetching total price:', error);
        return;
    }

    const totalPriceDisplay = document.getElementById('totalPriceDisplay').querySelector('span');
    totalPriceDisplay.textContent = data.TotalPrice;
    console.log('Total price loaded:', data.TotalPrice);
}

async function handleConfirmPayment() {
    const creditCardNo = document.getElementById('creditCardNumber').value;
    const nameOnCard = document.getElementById('cardHolderName').value;
    const expiryDate = document.getElementById('expiryDate').value;
    const cvv = document.getElementById('cvv').value;
    const userId = sessionStorage.getItem('userId');

    if (!validatePaymentDetails(creditCardNo, nameOnCard, expiryDate, cvv)) {
        alert('Please check your payment details and try again.');
        return;
    }

    const { data, error } = await supabase.from('payment').insert([{
        CreditCardNo: creditCardNo,
        Name: nameOnCard,
        ExpiryDate: expiryDate,
        CVV: cvv,
        userid: userId
    }]);

    if (error) {
        console.error('Error processing payment:', error);
        alert('Payment processing failed. Please try again.');
    } else {
        alert('Payment successful!');
        sessionStorage.removeItem('reservedTicketId'); 
        window.location.href = 'passenger_dashboard.html'; 
    }
}

async function handleCancelPayment() {
    const ticketId = sessionStorage.getItem('reservedTicketId');
    if (ticketId) {
        const { error } = await supabase
            .from('Ticket')
            .delete()
            .match({ Ticket_ID: ticketId });

        if (error) {
            console.error('Error cancelling reservation:', error);
            alert('Failed to cancel the reservation. Please try again.');
        } else {
            alert('Reservation cancelled successfully.');
        }
    } else {
        alert('No reservation found to cancel.');
    }
    sessionStorage.removeItem('reservedTicketId'); 
    window.location.href = 'passenger_dashboard.html';  
}

function validatePaymentDetails(cardNo, name, expiry, cvv) {
    const isNumber = (n) => !isNaN(parseFloat(n)) && isFinite(n);
    return isNumber(cardNo) && name.trim().length > 0 && isNumber(cvv) && validateExpiryDate(expiry);
}

function validateExpiryDate(expiry) {
    const parts = expiry.split('/');
    const year = parseInt(parts[1], 10) + 2000; 
    const month = parseInt(parts[0], 10);
    const date = new Date(year, month - 1);
    return date > new Date(); 
}
