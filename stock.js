// Import the base URL for the API from the config file.
import { API_BASE_URL } from './config.js';

let items = []; // This will hold the fetched items globally

window.addEventListener('DOMContentLoaded', (event) => {
    // Declare variables here
    const urlParams = new URLSearchParams(window.location.search);
    let currentSearchQuery = urlParams.get('query') || '';
    let currentSearchCategory = urlParams.get('category') || '';

    // Use these variables in your fetch call
    fetch(`${API_BASE_URL}/searchitems?query=${encodeURIComponent(currentSearchQuery)}&category=${encodeURIComponent(currentSearchCategory)}`)
    .then(response => response.json())
    .then(items => {
        displayItems(items);
    })
    .catch(error => console.error('Error fetching items:', error));
});


// Displays items in the DOM
function displayItems(itemsToDisplay) {
    const container = document.getElementById('search-results-container');
    container.innerHTML = ''; // Clear existing content
items = itemsToDisplay;
    itemsToDisplay.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'stock-item';
        itemElement.innerHTML = `
            <div style="flex: 0 0 300px;">
                <img src="${item.ItemImageURL}" alt="${item.ItemName}" style="width: 300px; height: 300px; object-fit: cover;">
            </div>
            <div class="item-info" style="flex: 1; padding-left: 20px; position: relative;">
                <div class="quantity-badge" style="position: absolute; top: 0; right: -50px; background-color: #007bff; color: white; padding: 5px; border-radius: 5px;">
                    Qty: ${item.Quantity}
                </div>
                <h2><a href="item_desc.html?itemId=${item.ItemID}">${item.ItemName}</a></h2>
                <p>${item.ItemDescription}</p>
                <p>Price: $${parseFloat(item.ItemPrice).toFixed(2)}</p>
                <p>SKU: ${item.ItemSKU}</p>
                <p>Category: ${item.ItemCategory}</p>
                <p>Create Date: ${new Date(item.CreateDate).toLocaleDateString()}</p>
            </div>
        `;
        container.appendChild(itemElement);
    });

}

// Sorts items based on the selected criteria and displays them
function sortItems(sortCriteria) {
    console.log('Sorting items by:', sortCriteria); // Debug log to confirm function call
    const sortedItems = items.slice(); // Create a copy of the items array

    console.log('Items before sorting:', sortedItems); // Debug log to see items before sorting

    sortedItems.sort((a, b) => {
        switch (sortCriteria) {
            case 'name-asc':
                return a.ItemName.localeCompare(b.ItemName);
            case 'name-desc':
                return b.ItemName.localeCompare(a.ItemName);
            case 'price-asc':
                return parseFloat(a.ItemPrice) - parseFloat(b.ItemPrice);
            case 'price-desc':
                return parseFloat(b.ItemPrice) - parseFloat(a.ItemPrice);
            default:
                return 0;
        }
    });

    console.log('Items after sorting:', sortedItems); // Debug log to see items after sorting
    items = sortedItems;
    displayItems(sortedItems);
}
