document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username');
    if (username) {
        document.getElementById('username').textContent = username;
    } else {
        // If not logged in, redirect to login page or hide user-specific content
        window.location.href = 'login.html';
    }

    document.getElementById('logout-button').addEventListener('click', () => {
        // Clear session information from local storage
        localStorage.removeItem('username');
        localStorage.removeItem('userID');

        // Redirect to login page or home page after logout
        window.location.href = 'login.html';
    });
});
