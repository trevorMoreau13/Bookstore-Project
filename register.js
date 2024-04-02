// Import the base URL for the API from the config file.
import { API_BASE_URL } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('register-form');
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, username, password }),
        })
        .then(response => response.json())
        .then(data => {
            alert('Registration successful. Please log in.');
            // After registration, we can log the user in automatically
            // For this example, we'll just redirect them to the login page
            window.location.href = 'login.html?checkoutInitiated=true';
        })
        .catch(error => {
            console.error('Registration Error:', error);
            alert('Registration failed. Please try again.');
        });
    });
});
