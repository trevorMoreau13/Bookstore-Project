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

// Fetch only the newest stock items
fetch('http://localhost:3000/api/neweststockitems')
.then(response => response.json())
.then(items => {
    const container = document.getElementById('new-items'); // This is the correct ID for your new items container
    container.innerHTML = ''; // Clear existing content before appending new items

    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'stock-item';
        // Assuming the item has a unique identifier such as `ItemID`
  itemElement.innerHTML = `
      <div class="item-image-container">
          <a href="item_Desc.html?itemId=${item.ItemID}">
              <img src="${item.ItemImageURL}" alt="${item.ItemName}" style="width: 100%; height: auto; object-fit: cover;">
          </a>
      </div>
      <div class="item-info">
          <a href="item_Desc.html?itemId=${item.ItemID}">
              <h3>${item.ItemName}</h3>
          </a>
          <p>${item.ItemDescription}</p>
          <!-- other info -->
      </div>
  `;

        container.appendChild(itemElement);
    });
})
.catch(error => console.error('Error fetching new items:', error));

document.addEventListener('DOMContentLoaded', (event) => {
    const stockItemsContainer = document.getElementById('stock-items');
    const newItemsContainer = document.getElementById('new-items');

    if (stockItemsContainer) {
        fetch('http://localhost:3000/api/stockitems')
        .then(response => response.json())
        .then(items => {
            items.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'stock-item';
                itemElement.innerHTML = `
                    <div style="flex: 0 0 300px;"><img src="${item.ItemImageURL}" alt="${item.ItemName}" style="width: 300px; height: 300px; object-fit: cover;"></div>
                    <div class="item-info" style="flex: 1; padding-left: 20px; position: relative;">
                        <div class="quantity-badge" style="position: absolute; top: 0; right: 0; background-color: #007bff; color: white; padding: 5px; border-radius: 5px;">Qty: ${item.Quantity}</div>
                        <h2><a href="item_Desc.html?itemId=${item.ItemID}">${item.ItemName}</a> </h2>
                        <p>${item.ItemDescription}</p>
                        <p>Price: $${parseFloat(item.ItemPrice).toFixed(2)}</p>
                        <p>SKU: ${item.ItemSKU}</p>
                        <p>Category: ${item.ItemCategory}</p>
                        <p>Create Date: ${new Date(item.CreateDate).toLocaleDateString()}</p>
                    </div>
                `;
                stockItemsContainer.appendChild(itemElement);
            });
        })
        .catch(error => console.error('Error fetching items:', error));
    }

    if (newItemsContainer) {
        // If there's specific logic for new items, it should go here, similar to the above
        // fetch('http://localhost:3000/api/neweststockitems')...
    }
});
