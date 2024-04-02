// Import the base URL for the API from the config file.
import { API_BASE_URL } from './config.js';


document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const itemId = params.get('itemId');
    fetchItemDetails(itemId);
});

function fetchItemDetails(itemId) {
    fetch(`${API_BASE_URL}/item?id=${itemId}`)
    .then(response => response.json())
    .then(item => {
        // Existing updates to the DOM
        document.querySelector('.item-image img').src = item.ItemImageURL;
        document.querySelector('.item-image img').alt = item.ItemName;
        document.querySelector('.item-details h1').textContent = item.ItemName;
        document.querySelector('.item-description').textContent = item.ItemDescription;
        document.querySelector('#stock-count').textContent = item.Quantity;
        document.getElementById('add-to-cart').setAttribute('data-itemid', item.ItemID);

        // Update the price
        document.querySelector('#item-price').textContent = parseFloat(item.ItemPrice).toFixed(2); // Format price to 2 decimal places
    })
    .catch(error => console.error('Error fetching item details:', error));
}


document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('add-to-cart').addEventListener('click', () => {
        const userID = localStorage.getItem('userID');
        const itemID = parseInt(document.getElementById('add-to-cart').getAttribute('data-itemid'));
        const quantity = parseInt(document.getElementById('quantity').value) || 1; // Ensure this element exists and is capturing the desired quantity


        const itemName = document.querySelector('.item-details h1').textContent; // Example: Fetch name from DOM
        const itemPrice = parseFloat(document.querySelector('#item-price').textContent); // Example: Fetch price from DOM

        // Define itemDetails object for both logged-in and non-logged-in scenarios
        const itemDetails = {
            ItemID: itemID,
            ItemName: itemName,
            ItemPrice: itemPrice,
            Quantity: quantity,
        };

        console.log(`Adding to cart - UserID: ${userID}, ItemID: ${itemID}, Quantity: ${quantity}, ItemName: ${itemName}, ItemPrice: ${itemPrice}`);

        if (!userID) {
            let cart = JSON.parse(localStorage.getItem('tempCart') || '[]');
            const existingItemIndex = cart.findIndex(item => item.ItemID === itemID);
            if (existingItemIndex > -1) {
                cart[existingItemIndex].Quantity += quantity;
            } else {
                cart.push(itemDetails);
            }
            localStorage.setItem('tempCart', JSON.stringify(cart));
            alert('Item added to cart successfully for non-logged-in user');
        } else {
            if (itemID && quantity > 0) {
                fetch(`${API_BASE_URL}/cart/add`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userID, itemID, quantity }),
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Item added to cart successfully for logged-in user');
                    } else {
                        throw new Error(data.message || 'Failed to add item to cart.');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Error adding item to cart. Please try again.');
                });
            } else {
                alert('Invalid item ID or quantity. Please check your selection.');
            }
        }
    });
});
