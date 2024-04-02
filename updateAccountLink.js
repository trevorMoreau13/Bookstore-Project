document.addEventListener('DOMContentLoaded', () => {
    const accountLink = document.getElementById('account-link');
    const userID = localStorage.getItem('userID');

    if (userID) {
        // User is logged in
        accountLink.href = 'user_page.html'; // Update this to the correct path of your user page
    } else {
        // User is not logged in or session expired
        accountLink.href = 'login.html'; // Keep or update this to the login page path if needed
    }
});
