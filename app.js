fetch('http://localhost:3000/api/stockitems')
.then(response => response.json())
.then(items => {
    const container = document.getElementById('stock-items');
    items.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.className = 'stock-item';
    itemElement.innerHTML = `
        <div style="flex: 0 0 300px;"><img src="${item.ItemImageURL}" alt="${item.ItemName}" style="width: 300px; height: 300px; object-fit: cover;"></div>
        <div class="item-info" style="flex: 1; padding-left: 20px; position: relative;">
            <div class="quantity-badge" style="position: absolute; top: 0; right: 0; background-color: #007bff; color: white; padding: 5px; border-radius: 5px;">Qty: ${item.Quantity}</div>
            <h2>${item.ItemName} </h2>
            <p>${item.ItemDescription}</p>
            <p>Price: $${parseFloat(item.ItemPrice).toFixed(2)}</p>
            <p>SKU: ${item.ItemSKU}</p>
            <p>Category: ${item.ItemCategory}</p>
            <p>Create Date: ${new Date(item.CreateDate).toLocaleDateString()}</p>
        </div>
    `;

    container.appendChild(itemElement);
});
})
.catch(error => console.error('Error fetching items:', error));
