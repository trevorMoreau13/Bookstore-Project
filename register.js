document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('register-form');
    form.onsubmit = function(event) {
        // Perform client-side validation
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (password !== confirmPassword) {
            event.preventDefault(); // Stop the form from submitting
            alert('Passwords do not match.');
        }
    };
});
