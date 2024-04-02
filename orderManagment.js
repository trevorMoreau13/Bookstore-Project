// Import the base URL for the API from the config file.
import { API_BASE_URL } from './config.js';


document.getElementById('cancel-order-button').onclick = function() {
    const orderId = document.getElementById('order-id-input').value;
    fetch(`/api/order/cancel/${orderId}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Order canceled successfully.');
            } else {
                alert('Failed to cancel order. It may have already been shipped.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('There was a problem with your request. Please try again.');
        });
};


document.addEventListener('DOMContentLoaded', () => {
    const checkStatusButton = document.getElementById('check-status-button');
    const cancelOrderButton = document.getElementById('cancel-order-button');
    const orderIdInput = document.getElementById('order-id-input');
    const orderStatusDisplay = document.getElementById('order-status-display');

    checkStatusButton.onclick = function() {
        const orderId = orderIdInput.value;
        fetch(`/api/order/status/${orderId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Order not found');
                }
                return response.json();
            })
            .then(data => {
                orderStatusDisplay.textContent = `Status: ${data.status}`;
                // Show cancel button if the order is not shipped
                if (data.status === 'Not Shipped') {
                    cancelOrderButton.style.display = 'block';
                } else {
                    cancelOrderButton.style.display = 'none';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                orderStatusDisplay.textContent = error.message;
                cancelOrderButton.style.display = 'none';
            });
    };

    cancelOrderButton.onclick = function() {
        const orderId = orderIdInput.value;
        fetch(`/api/order/cancel/${orderId}`, { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Order canceled successfully.');
                    // Update the status display and hide cancel button
                    orderStatusDisplay.textContent = `Status: Cancelled`;
                    cancelOrderButton.style.display = 'none';
                } else {
                    alert(data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('There was a problem with your request. Please try again.');
            });
    };
});

document.addEventListener('DOMContentLoaded', () => {
    fetchAllOrders();
});

//Retrieving orders
function fetchAllOrders() {
    const userID = localStorage.getItem('userID');
    if (!userID) {
        console.error('User is not logged in.');
        return;
    }
    // Notice how the URL is constructed here
    fetch(`${API_BASE_URL}/orders?userID=${userID}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const groupedOrders = groupByOrderID(data);
            displayOrders(groupedOrders);
        })
        .catch(error => {
            console.error('Error fetching orders:', error);
        });
}

 //Displaying and formatting the orders
function displayOrders(groupedOrders) {
    const ordersContainer = document.getElementById('orders-container');
    ordersContainer.innerHTML = ''; // Clear existing orders

    Object.keys(groupedOrders).forEach(orderID => {
        const order = groupedOrders[orderID][0]; // all items in the group share common order properties
        const orderElement = document.createElement('div');
        orderElement.classList.add('order-box');

        let itemsHtml = groupedOrders[orderID].map(item => `
            <p>${item.ItemName} - Quantity: ${item.Quantity} - Price per unit: $${item.PricePerUnit.toFixed(2)}</p>
        `).join('');

        orderElement.innerHTML = `
            <h3>Order ID: ${orderID}</h3>
            <p>Status: ${order.OrderStatus}</p>
            <p>Date: ${new Date(order.OrderDate).toLocaleDateString()}</p>
            <p>Total Price: $${order.TotalPrice.toFixed(2)}</p>
            <p>Address: ${order.Address} ${order.City}, ${order.State}, ${order.ZipCode}</p>
            ${itemsHtml}
            <button class="cancel-order-btn" data-order-id="${orderID}">Cancel Order</button>
        `;
        ordersContainer.appendChild(orderElement);
    });

    // Add click event listener for all cancel buttons
    document.querySelectorAll('.cancel-order-btn').forEach(button => {
        button.addEventListener('click', function() {
            const orderId = this.getAttribute('data-order-id');
            cancelOrder(orderId); // Implement this function to cancel the order
        });
    });
}
//Grouping the orders
function groupByOrderID(data) {
    return data.reduce((group, item) => {
        const { OrderID } = item;
        group[OrderID] = group[OrderID] || [];
        group[OrderID].push(item);
        return group;
    }, {});
}

// Implement the cancelOrder function to cancel the order
function cancelOrder(orderId) {
    if (confirm('Are you sure you want to cancel this order?')) {
        fetch(`/api/order/cancel/${orderId}`, { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Order canceled successfully.');
                    fetchAllOrders(); // Refresh the list of orders
                } else {
                    alert('Failed to cancel order. It may have already been shipped.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('There was a problem with your request. Please try again.');
            });
    }
}
