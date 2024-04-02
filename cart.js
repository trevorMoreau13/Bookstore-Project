// Import the base URL for the API from the config file.
import { API_BASE_URL } from './config.js';


document.addEventListener('DOMContentLoaded', () => {
    // This function is responsible for fetching cart items from the backend
    fetchCartItems();
});

//Button Logic


document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('remove-item')) {
        const itemId = e.target.closest('.cart-item').getAttribute('data-itemid');
        removeItemFromCart(itemId);
    }
});

document.addEventListener('change', function(e) {
    if (e.target && e.target.classList.contains('item-quantity')) {
        const itemId = e.target.closest('.cart-item').getAttribute('data-itemid');
        const newQuantity = e.target.value;
        updateItemQuantity(itemId, newQuantity);
    }
});

document.getElementById('checkout-button').addEventListener('click', function() {
  window.location.href = 'checkout.html'; // Redirect to checkout page

});


//Cart retrieval Function
function fetchCartItems() {
    const userID = localStorage.getItem('userID');
    if (userID) {
        // Logged-in user: Fetch cart from the server
        fetch(`${API_BASE_URL}/cart/${userID}`)
        .then(response => response.json())
        .then(data => {
            if(data.items && data.items.length > 0){
                updateCartDisplay(data.items);
                document.getElementById('total-items-count').textContent = data.items.length;
                document.getElementById('total-price').textContent = data.total.toFixed(2);
            } else {
                document.getElementById('cart-items-container').innerHTML = '<p>Your cart is empty.</p>';
            }
        })
        .catch(error => console.error('Error fetching cart items:', error));
    } else {
        // Non-logged-in user: Fetch cart from local storage
        const items = JSON.parse(localStorage.getItem('tempCart') || '[]');
        if(items.length > 0){
            updateCartDisplay(items); // You may need to adjust this function to handle the format of items stored in local storage
            const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            document.getElementById('total-items-count').textContent = items.length;
        } else {
            document.getElementById('cart-items-container').innerHTML = '<p>Your cart is empty.</p>';
        }
    }
}
//Cart Item Function
function removeItemFromCart(itemId) {
    const userID = localStorage.getItem('userID');
    if (!userID) {
        let items = JSON.parse(localStorage.getItem('tempCart') || '[]');
        const originalLength = items.length;
        items = items.filter(item => item.ItemID.toString() !== itemId.toString());

        // Debugging log
        console.log(`Removed item. Original length: ${originalLength}, New length: ${items.length}`);

        localStorage.setItem('tempCart', JSON.stringify(items));

        // Verify that items are being correctly updated
        console.log("Current items in cart:", items);

        updateCartDisplay(items);
    } else {

    // If the user is logged in, proceed with the server request to remove the item
    fetch(`${API_BASE_URL}/cart/remove`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userID, itemID: itemId })
    })

    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Item removed successfully');
            fetchCartItems(); // Re-fetch cart items to update the UI
        } else {
            throw new Error(data.message || 'Failed to remove item.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to remove item from cart.');
    });
  }

}


//Item Quantity Update Function
function updateItemQuantity(itemId, newQuantity) {
    const userID = localStorage.getItem('userID');
    if (!userID) {
        let items = JSON.parse(localStorage.getItem('tempCart') || '[]');
        const itemIndex = items.findIndex(item => item.ItemID === itemId);
        if (itemIndex !== -1) {
            items[itemIndex].Quantity = parseInt(newQuantity, 10);
            localStorage.setItem('tempCart', JSON.stringify(items));
            updateCartDisplay(items); // Refresh cart display
        }
        return;
    }

    fetch(`/api/cart/update`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userID, itemID: itemId, quantity: parseInt(newQuantity, 10) })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Quantity updated successfully');
            // Optionally refresh cart display
            fetchCartItems(); // Re-fetch cart items to update the UI
        } else {
            throw new Error(data.message || 'Failed to update quantity.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to update item quantity.');
    });
}

//Cart Display Function
function updateCartDisplay(cartItems) {
    const container = document.getElementById('cart-items-container');
    container.innerHTML = ''; // Clear existing items before updating
    let totalPrice = 0;

    cartItems.forEach(item => {
        // Ensure itemPrice and quantity are numbers. Use default values if necessary.
        const itemPrice = Number(item.ItemPrice) || 0;
        const quantity = Number(item.Quantity) || 0;
        const itemTotal = itemPrice * quantity;
        totalPrice += itemTotal;

        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.setAttribute('data-itemid', item.ItemID || '');
        itemElement.innerHTML = `
            <div class="cart-item-info">
                <h3>${item.ItemName || 'Unknown Item'}</h3>
                <p>Price: $${itemPrice.toFixed(2)}</p>
                <p>Quantity: ${quantity}</p>
                <p>Total: $${itemTotal.toFixed(2)}</p>
            </div>
            <div class="cart-item-actions">
                <input type="number" class="item-quantity" value="${quantity}" min="1" data-itemid="${item.ItemID || ''}">
                <button class="remove-item" data-itemid="${item.ItemID || ''}">&#x1F5D1;</button>
            </div>
        `;
        container.appendChild(itemElement);

        itemElement.querySelector('.item-quantity').addEventListener('change', (e) => updateItemQuantity(item.ItemID || '', e.target.value));
        itemElement.querySelector('.remove-item').addEventListener('click', () => removeItemFromCart(item.ItemID || ''));


    });

    // Update total price display
    document.getElementById('total-price').textContent = isNaN(totalPrice) ? '0.00' : totalPrice.toFixed(2);
    document.getElementById('total-items-count').textContent = cartItems.length;
    localStorage.setItem('cartTotal', totalPrice.toFixed(2));
}



//Checkout Function
function handleCheckout() {
    const userID = localStorage.getItem('userID');
    const items = JSON.parse(localStorage.getItem('tempCart') || '[]'); // Retrieve items from local storage

    // using API_BASE_URL to get the URL
    fetch(`${API_BASE_URL}/checkout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userID, items }) // Include items in the request
    })
    .then(response => {
        if (!response.ok) {
            // If server response is not OK, throw an error
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            alert('Checkout successful. Your order ID is: ' + data.orderID);
            // Here you can redirect to a success page or perform other actions
            window.location.href = 'order_success.html'; // Adjust URL as necessary
        } else {
            // Handle any specific data errors here (e.g., item out of stock)
            alert('Checkout failed: ' + (data.message || 'Unknown error'));
        }
    })
    .catch(error => {
        // This catches network errors and any throws in the .then blocks
        console.error('Checkout failed:', error);
        alert('Checkout process encountered an error. Please try again.');
    });
}
