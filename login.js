// Import the base URL for the API from the config file.
import { API_BASE_URL } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Store userID and username in localStorage for session tracking
                localStorage.setItem('userID', data.userID);
                localStorage.setItem('username', username);

                // Check if there was a pending checkout

                syncCartWithDatabase();
                completePendingCheckout();
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Login failed, please try again later.');
        });
    });
});

// Cart Sync for guests
function syncCartWithDatabase() {
    const userID = localStorage.getItem('userID');
    const localCartItems = JSON.parse(localStorage.getItem('tempCart') || '[]');

    if (localCartItems.length > 0) {
        fetch(`${API_BASE_URL}/cart/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userID, items: localCartItems }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Local cart items successfully transferred to database.');
                localStorage.removeItem('tempCart'); // Clear local cart
                // Proceed to checkout or whatever next step
            } else {
                console.error('Failed to transfer local cart items to database.');
            }
        })
        .catch(error => console.error('Error syncing cart with database:', error));
    }
}


//Check if there is a pending checkout
function completePendingCheckout() {
    const pendingCheckout = localStorage.getItem('pendingCheckout');
    if (pendingCheckout) {


        const checkoutData = JSON.parse(pendingCheckout);
        checkoutData.userID = localStorage.getItem('userID'); // Add userID to checkout data

        fetch(`${API_BASE_URL}/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(checkoutData),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to complete checkout.');
            }

            return response.json();
        })
        .then(data => {
            localStorage.removeItem('pendingCheckout'); // Cleanup
            alert('Checkout completed successfully.');
            window.location.href = 'orderManagment.html'; // Redirect to a success page
        })
        .catch(error => {
            console.error('Checkout Error:', error);
            alert('Checkout process encountered an error. Please try again.');
            window.location.href = 'cart.html'; // Optionally redirect back to the cart
        });
    } else {
        // No pending checkout, redirect to homepage or dashboard
        window.location.href = 'home.html';
    }
}
