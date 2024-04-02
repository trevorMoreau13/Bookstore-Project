// auth.js
document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username');
    if (username) {
        // User is logged in
        console.log(`User ${username} is logged in.`);
        // Update the UI or fetch user-specific data
        // For example, updating user's name display or showing a logout button
    } else {
        // User is not logged in
        console.log('No user is logged in.');
        // Redirect to login page or show login option
        // window.location.href = '/login.html'; // Uncomment to redirect to login page
    }
});
