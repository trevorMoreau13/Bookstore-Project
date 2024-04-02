// Import the base URL for the API from the config file.
import { API_BASE_URL } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
    // Collect and display the cart total and initialize tax calculations
    displayCartTotalAndCalculateTax();

    // Setup form submission handler
    document.getElementById('checkout-form').addEventListener('submit', handleCheckoutFormSubmit);
});

function displayCartTotalAndCalculateTax() {
    const cartTotal = parseFloat(localStorage.getItem('cartTotal')) || 0;
    if(cartTotal) {
        // Update the total before tax display
        document.getElementById('totalBeforeTax').textContent = cartTotal.toFixed(2);

        // Calculate and display tax and final total based on the user's zip code
        const zipCodeInput = document.getElementById('zipCode');
        zipCodeInput.addEventListener('change', function() {
            updateTaxAndTotalBasedOnZip(this.value, cartTotal);
        });

        // Manually trigger change event to initialize tax and total calculation
        zipCodeInput.dispatchEvent(new Event('change'));
    } else {
        console.log("Cart total not found in localStorage.");
    }
}
function updateTaxAndTotalBasedOnZip(zipCode, cartTotal) {
    const taxRate = getTaxRate(zipCode);
    const taxAmount = cartTotal * taxRate;
    const finalTotal = cartTotal + taxAmount;

    // Store finalTotal in localStorage
    localStorage.setItem('finalTotal', finalTotal.toString());

    // Update the DOM with the new values
    document.getElementById('taxAmount').textContent = taxAmount.toFixed(2);
    document.getElementById('finalTotal').textContent = finalTotal.toFixed(2);
}


function handleCheckoutFormSubmit(e) {
    e.preventDefault();

    // Retrieve user ID from localStorage to check if the user is logged in
    const userID = localStorage.getItem('userID');

    // Collect form data
    const formData = {
        userID: userID, // This may be undefined if the user isn't logged in
        name: document.getElementById('name').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        zipCode: document.getElementById('zipCode').value,
        state: document.getElementById('state').value,
        cardNumber: document.getElementById('cardNumber').value,
        expiryDate: document.getElementById('expiryDate').value,
        cvv: document.getElementById('cvv').value,
        totalAfterTaxes: parseFloat(localStorage.getItem('finalTotal')) // Retrieve the final total from localStorage
    };

    if (!userID) {
        // If the user isn't logged in, redirect them to the login page
        // But first, temporarily store the checkout details in localStorage
        localStorage.setItem('pendingCheckout', JSON.stringify(formData));

        //alert('To continue with the checkout please login or register.');

        // Redirect user to login page with a special query parameter to indicate a checkout process initiated
        window.location.href = `login.html?checkoutInitiated=true`;
    } else {
        // If the user is logged in, proceed with the checkout process
        fetch(`${API_BASE_URL}/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // On successful checkout, clear the cart and redirect to a confirmation page
                localStorage.removeItem('cartTotal'); //   cart total
                localStorage.removeItem('finalTotal'); // Clear final total
                alert('Order placed successfully!');
                window.location.href = 'orderManagment.html'; // Redirect to a confirmation page
            } else {
                // Handle failure (e.g., item out of stock, payment declined)
                alert('There was an error placing your order. Please try again.');
            }
        })
        .catch(error => {
            console.error('Checkout error:', error);
            alert('An error occurred during checkout. Please try again.');
        });
    }
}




function getTaxRate(zipCode) {
    // Return a fixed tax rate for demonstration; implement actual logic as needed
    return 0.07; // Example: 7% tax rate
}
