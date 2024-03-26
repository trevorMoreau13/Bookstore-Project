document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const itemId = params.get('itemId');
    fetchItemDetails(itemId);
});

function fetchItemDetails(itemId) {
    fetch(`http://localhost:3000/api/item?id=${itemId}`)
    .then(response => response.json())
    .then(item => {
        document.querySelector('.item-image img').src = item.ItemImageURL; // Ensure the key matches the response
        document.querySelector('.item-image img').alt = item.ItemName; // Ensure the key matches the response
        document.querySelector('.item-details h1').textContent = item.ItemName; // Ensure the key matches the response
        document.querySelector('.item-description').textContent = item.ItemDescription; // Ensure the key matches the response
        document.querySelector('#stock-count').textContent = item.Quantity; // Changed to #stock-count to match the ID in the HTML
    })
    .catch(error => console.error('Error fetching item details:', error));
}
