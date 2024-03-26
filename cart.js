document.addEventListener('DOMContentLoaded', () => {
    // This function would be responsible for fetching cart items from the backend
    fetchCartItems();
});

function fetchCartItems() {
    // Example function to fetch cart items and display them
    // TODO: Replace this with the actual backend API call
    fetch('/api/get-cart')
    .then(response => response.json())
    .then(cartItems => {
        updateCartDisplay(cartItems);
    })
    .catch(error => console.error('Error fetching cart items:', error));
}

function updateCartDisplay(cartItems) {
    const container = document.getElementById('cart-items-container');
    const totalPriceElement = document.getElementById('total-price');
    const totalItemsCountElement = document.getElementById('total-items-count');

    // Reset content
    container.innerHTML = '';
    let totalPrice = 0;
    let totalItemsCount = 0;

    // Add each cart item to the container
    cartItems.forEach(item => {
        totalPrice += item.price * item.quantity;
        totalItemsCount += item.quantity;

        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <img src="${item.imageURL}" alt="${item.name}">
            <div>
                <h3>${item.name}</h3>
                <p>$${item.price}</p>
                <p>Quantity: ${item.quantity}</p>
            </div>
        `;
        container.appendChild(itemElement);
    });

    // Update total price and item count
    totalPriceElement.textContent = totalPrice.toFixed(2);
    totalItemsCountElement.textContent = totalItemsCount;
}
