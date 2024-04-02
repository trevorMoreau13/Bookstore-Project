// Import necessary modules
const express = require('express'); // Express framework for creating the server
const sql = require('mssql'); // SQL Server client for Node.js
const cors = require('cors'); // Middleware to enable CORS (Cross-Origin Resource Sharing)
const bcrypt = require('bcrypt'); // Library for hashing and salting passwords
const saltRounds = 10; // Defines the cost factor for hashing
const app = express(); // Initialize an Express application
const corsOptions = {
  origin: '*', // Allows all origins
  optionsSuccessStatus: 200 // For legacy browser support
};
app.use(cors(corsOptions));


app.use(cors()); // Apply CORS middleware to allow cross-origin requests
app.use(cors(corsOptions));

app.use(express.json()); // Parse JSON bodies (as sent by API clients)

// Serve static files from the current directory
app.use(express.static('.'));

const port = 80; // Server port

// Database configuration
const config = {
    user: 'test',
    password: 'password',
    server: 'WIN-LQPGKRTIAF1\\SCHOOLWORK', // Update as per your SQL server instance
    database: 'BookStore',
    options: {
        encrypt: false, // Depends on your database's configuration
        trustServerCertificate: true // For development purposes, in production it should be properly configured
    }
};

// Connect to SQL Server with the provided configuration
sql.connect(config).then(() => {
    console.log('Connected to SQL Server successfully');

    // Endpoint to get a list of stock items from the database
    app.get('/api/stockitems', async (req, res) => {
        try {
            const result = await sql.query`
                SELECT i.ItemID, i.ItemName, i.ItemDescription, i.ItemPrice, i.ItemSKU, i.ItemCategory, i.CreateDate, i.ItemImageURL, s.Quantity
                FROM Items i
                JOIN Stock s ON i.ItemID = s.ItemID`;
            res.json(result.recordset); // Send back the results to the client
        } catch (err) {
            console.error('Database query error', err);
            res.status(500).send('Error retrieving items from database');
        }
    });

    // Endpoint for user registration
    app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        let userRequest = new sql.Request();
        await userRequest.query(`
            INSERT INTO Users (Username, Email, PasswordHash)
            VALUES ('${username}', '${email}', '${hashedPassword}')
        `);

        // Retrieve the new user's ID
        const userResult = await userRequest.query(`SELECT UserID FROM Users WHERE Username = '${username}'`);
        const newUserID = userResult.recordset[0].UserID;

        // Create a cart for the new user
        await userRequest.query(`INSERT INTO Cart (UserID) VALUES (${newUserID})`);

        res.status(201).json({ message: 'User created successfully.' });
    } catch (error) {
        if (error.number === 2627) {
            res.status(409).json({ error: 'An account with this email or username already exists.' });
        } else {
            console.error('Database query error', error);
            res.status(500).json({ error: 'Failed to create user.' });
        }
    }
});




    // Example server-side login route adjustment to include userID
    app.post('/api/login', async (req, res) => {
        const { username, password } = req.body;

        try {
            let request = new sql.Request();
            const userResult = await request.query(`SELECT UserID, PasswordHash FROM Users WHERE Username = '${username}'`);

            if (userResult.recordset.length > 0) {
                const match = await bcrypt.compare(password, userResult.recordset[0].PasswordHash);

                if (match) {
                    const userID = userResult.recordset[0].UserID;

                    // Check if a cart exists for the user
                    const cartResult = await request.query(`SELECT CartID FROM Cart WHERE UserID = ${userID}`);
                    if (cartResult.recordset.length === 0) {
                        // No cart exists, so create one
                        await request.query(`INSERT INTO Cart (UserID) VALUES (${userID})`);
                    }

                    // Successful login
                    res.json({ success: true, message: 'Login successful.', userID: userID });
                } else {
                    res.status(401).json({ success: false, message: 'Incorrect username or password.' });
                }
            } else {
                res.status(401).json({ success: false, message: 'User not found.' });
            }
        } catch (error) {
            console.error('Login error', error);
            res.status(500).json({ success: false, message: 'Login failed, please try again later.' });
        }
    });




//Endpoint to add guest's carts to the Database upon login
app.post('/api/cart/sync', async (req, res) => {
    const { userID, items } = req.body;

    // Validate request body
    if (!userID || items.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid request' });
    }

    try {
        const pool = await sql.connect(config);

        for (const item of items) {
            // Check if the item exists in the user's cart
            const existingItemResult = await pool.request()
                .input('UserID', sql.Int, userID)
                .input('ItemID', sql.Int, item.ItemID)
                .query(`
                    SELECT Quantity FROM CartItems
                    WHERE CartID = (SELECT CartID FROM Cart WHERE UserID = @UserID)
                    AND ItemID = @ItemID
                `);

            // If item exists, update its quantity
            if (existingItemResult.recordset.length > 0) {
                const newQuantity = existingItemResult.recordset[0].Quantity + item.Quantity;
                await pool.request()
                    .input('UserID', sql.Int, userID)
                    .input('ItemID', sql.Int, item.ItemID)
                    .input('Quantity', sql.Int, newQuantity)
                    .query(`
                        UPDATE CartItems
                        SET Quantity = @Quantity
                        WHERE CartID = (SELECT CartID FROM Cart WHERE UserID = @UserID)
                        AND ItemID = @ItemID
                    `);
            } else {
                // If item does not exist, insert it into the cart
                await pool.request()
                    .input('UserID', sql.Int, userID)
                    .input('ItemID', sql.Int, item.ItemID)
                    .input('Quantity', sql.Int, item.Quantity)
                    .query(`
                        INSERT INTO CartItems (CartID, ItemID, Quantity)
                        VALUES ((SELECT CartID FROM Cart WHERE UserID = @UserID), @ItemID, @Quantity)
                    `);
            }
        }

        res.json({ success: true, message: 'Cart synced successfully' });
    } catch (error) {
        console.error('Error syncing cart:', error);
        res.status(500).json({ success: false, message: 'Error syncing cart' });
    }
});



    //  route to fetch only the 3 newest items
    app.get('/api/neweststockitems', async (req, res) => {
        try {
            const result = await sql.query`
                SELECT TOP 3 i.ItemID, i.ItemName, i.ItemDescription, i.ItemPrice, i.ItemSKU, i.ItemCategory, i.CreateDate, i.ItemImageURL, s.Quantity
                FROM Items i
                JOIN Stock s ON i.ItemID = s.ItemID
                ORDER BY i.CreateDate DESC`;
            res.json(result.recordset);
        } catch (err) {
            console.error('Database query error', err);
            res.status(500).send('Error retrieving newest items from database');
        }
    });


    app.get('/api/searchitems', async (req, res) => {
      const { query, category } = req.query;
      let sqlQuery = `
          SELECT Items.ItemID, Items.ItemName, Items.ItemDescription, Items.ItemPrice, Items.ItemSKU, Items.ItemCategory, Items.CreateDate, Items.ItemImageURL, Stock.Quantity
          FROM Items
          JOIN Stock ON Items.ItemID = Stock.ItemID`;

      let whereClauses = [];

      if (query) {
          whereClauses.push(`(Items.ItemName COLLATE Latin1_General_CI_AI LIKE '%' + @query + '%' OR Items.ItemDescription COLLATE Latin1_General_CI_AI LIKE '%' + @query + '%')`);
      }
      if (category) {
          whereClauses.push("Items.ItemCategory = @category");
      }

      if (whereClauses.length > 0) {
          sqlQuery += ` WHERE ${whereClauses.join(' AND ')}`;
      }

      try {
          let request = new sql.Request();
          if (query) {
              request.input('query', sql.VarChar, query);
          }
          if (category) {
              request.input('category', sql.VarChar, category);
          }
          const result = await request.query(sqlQuery);
          res.json(result.recordset);
      } catch (err) {
          console.error('Database search query error', err);
          res.status(500).send('Error searching items in the database');
      }
  });

    // Endpoint to get the order status
    app.get('/api/order/status/:orderId', async (req, res) => {
      const orderId = req.params.orderId;
      try {
          let request = new sql.Request();
          const result = await request.query(`SELECT OrderStatus FROM Orders WHERE OrderID = ${orderId}`);
          if (result.recordset.length > 0) {
              res.json({ status: result.recordset[0].OrderStatus });
          } else {
              res.status(404).send('Order not found');
          }
      } catch (err) {
          console.error('Database query error', err);
          res.status(500).send('Error retrieving order status');
      }
  });

    // Endpoint to cancel an order
    app.post('/api/order/cancel/:orderId', async (req, res) => {
      const orderId = req.params.orderId;
      try {


          let request = new sql.Request();
          // First, check the current status
          const currentStatusResult = await request.query(`SELECT OrderStatus FROM Orders WHERE OrderID = ${orderId}`);
          if (currentStatusResult.recordset.length > 0 && currentStatusResult.recordset[0].OrderStatus === 'Not Shipped') {
              // Proceed with cancellation
              await request.query(`UPDATE Orders SET OrderStatus = 'Cancelled' WHERE OrderID = ${orderId}`);
              res.json({ success: true, message: 'Order cancelled successfully.' });
          } else {
              res.status(400).json({ success: false, message: 'Order cannot be cancelled. It may have already been shipped or does not exist.' });
          }
      } catch (err) {
          console.error('Database query error', err);
          res.status(500).send('Error processing cancellation request');
      }
  });

  // Get or create a cart for the user and add item to the cart


  app.post('/api/cart/add', async (req, res) => {
      const { userID, itemID, quantity } = req.body;

      if (!userID || !itemID || quantity == null || quantity <= 0) {
          return res.status(400).json({ success: false, message: 'Invalid parameters: userID, itemID, and quantity are required. Quantity must be greater than 0.' });
      }

      try {
          await sql.connect(config);
          const pool = new sql.ConnectionPool(config);
          const poolConnect = pool.connect();

          await poolConnect; // ensures that the pool has been created

          // First, check or create a cart for the user
          let cartResult = await pool.request()
              .input('UserID', sql.Int, userID)
              .query('SELECT CartID FROM Cart WHERE UserID = @UserID');

          let cartID;
          if (cartResult.recordset.length === 0) {
              // No cart exists for this user, so create one
              cartResult = await pool.request()
                  .input('UserID', sql.Int, userID)
                  .query('INSERT INTO Cart (UserID) OUTPUT INSERTED.CartID VALUES (@UserID)');
              cartID = cartResult.recordset[0].CartID;
          } else {
              // Use the existing cart
              cartID = cartResult.recordset[0].CartID;
          }

          // Now proceed to add the item to the user's cart or update the quantity if it already exists
          const itemResult = await pool.request()
              .input('CartID', sql.Int, cartID)
              .input('ItemID', sql.Int, itemID)
              .query(`
                  SELECT Quantity FROM CartItems WHERE CartID = @CartID AND ItemID = @ItemID
              `);

          if (itemResult.recordset.length > 0) {
              // Item exists in the cart, update the quantity
              const newQuantity = itemResult.recordset[0].Quantity + quantity;
              await pool.request()
                  .input('CartID', sql.Int, cartID)
                  .input('ItemID', sql.Int, itemID)
                  .input('Quantity', sql.Int, newQuantity)
                  .query(`
                      UPDATE CartItems SET Quantity = @Quantity WHERE CartID = @CartID AND ItemID = @ItemID
                  `);
                } else {
                    // Item does not exist in cart, insert new
                    await pool.request()
                        .input('UserID', sql.Int, userID)
                        .input('ItemID', sql.Int, itemID)
                        .input('Quantity', sql.Int, quantity)
                        .query(`
                            INSERT INTO CartItems (CartID, ItemID, Quantity)
                            VALUES ((SELECT CartID FROM Cart WHERE UserID = @UserID), @ItemID, @Quantity)
                        `);
                }

                res.json({ success: true, message: 'Cart updated successfully.' });
              } catch (error) {
                console.error('Error updating cart:', error);
                res.status(500).json({ success: false, message: 'Error processing request. Please try again.' });
              }
              });

    // Fetch items in the user's cart
    app.get('/api/cart/:userID', async (req, res) => {
      const { userID } = req.params;
      try {
          const pool = await sql.connect(config);
          const result = await pool.request()
              .input('UserID', sql.Int, userID)
              .query(`
                  SELECT ci.Quantity, i.ItemName, i.ItemPrice, i.ItemID, (ci.Quantity * i.ItemPrice) AS TotalPrice
                  FROM CartItems ci
                  JOIN Cart c ON ci.CartID = c.CartID
                  JOIN Items i ON ci.ItemID = i.ItemID
                  WHERE c.UserID = @UserID`);

          let total = result.recordset.reduce((acc, curr) => acc + curr.TotalPrice, 0);
          res.json({ items: result.recordset, total });
      } catch (error) {
          console.error('Error fetching cart items:', error);
          res.status(500).send('Error processing request');
      }
  });



    async function getOrCreateCartForUser(userID) {
      // Logic to either fetch an existing cartID for the user or create a new cart and return its ID
  }

    async function addItemToCart(cartID, itemID, quantity) {
      // Logic to add an item to the CartItems table
  }

    app.put('/api/cart/update', async (req, res) => {
      const { userID, itemID, quantity } = req.body;

      if (!userID || !itemID || quantity == null) {
          return res.status(400).send('Missing parameters');
      }

      try {
          const pool = await sql.connect(config);
          await pool.request()
              .input('UserID', sql.Int, userID)
              .input('ItemID', sql.Int, itemID)
              .input('Quantity', sql.Int, quantity)
              .query(`
                  UPDATE CartItems
                  SET Quantity = @Quantity
                  WHERE CartID = (SELECT CartID FROM Cart WHERE UserID = @UserID)
                  AND ItemID = @ItemID`);

          res.json({ success: true, message: 'Quantity updated successfully.' });
      } catch (error) {
          console.error('Error updating cart item quantity:', error);
          res.status(500).send('Error processing request');
      }
  });

    app.delete('/api/cart/remove', async (req, res) => {
      const { userID, itemID } = req.body;

      if (!userID || !itemID) {
          return res.status(400).send('Missing parameters');
      }

      try {
          const pool = await sql.connect(config);
          await pool.request()
              .input('UserID', sql.Int, userID)
              .input('ItemID', sql.Int, itemID)
              .query(`
                  DELETE FROM CartItems
                  WHERE CartID = (SELECT CartID FROM Cart WHERE UserID = @UserID)
                  AND ItemID = @ItemID`);

          res.json({ success: true, message: 'Item removed from cart successfully.' });
      } catch (error) {
          console.error('Error removing cart item:', error);
          res.status(500).send('Error processing request');
      }
  });


  //Checkout
  app.post('/api/checkout', async (req, res) => {
      const { userID, address, city, state, zipCode, totalAfterTaxes } = req.body;

      if (!userID) {
          return res.status(401).json({ success: false, message: 'User not logged in.' });
      }

      let transaction; // Declare transaction at a scope accessible to both try and catch blocks

      try {
          const pool = await sql.connect(config);
          transaction = new sql.Transaction(pool); // Initialize transaction
          await transaction.begin();


      // Insert the order
      let orderInsertResult = await new sql.Request(transaction)
          .input('CustomerID', sql.Int, userID)
          .input('TotalPrice', sql.Decimal(10, 2), totalAfterTaxes)
          .input('Address', sql.NVarChar, address)
          .input('City', sql.NVarChar, city)
          .input('State', sql.NVarChar, state)
          .input('ZipCode', sql.NVarChar, zipCode)
          .query(`
              INSERT INTO Orders (CustomerID, OrderStatus, OrderDate, TotalPrice, Address, City, State, ZipCode)
              OUTPUT INSERTED.OrderID
              VALUES (@CustomerID, 'Not Shipped', GETDATE(), @TotalPrice, @Address, @City, @State, @ZipCode);
          `);

      const orderID = orderInsertResult.recordset[0].OrderID;

      // Ensure there are items in the cart before attempting to transfer

          await pool.request()
              .input('OrderID', sql.Int, orderID)
              .input('UserID', sql.Int, userID)
              .query(`
                  INSERT INTO OrderItems (OrderID, ItemID, Quantity, PricePerUnit)
                  SELECT @OrderID, ci.ItemID, ci.Quantity, i.ItemPrice
                  FROM CartItems ci
                  JOIN Cart c ON ci.CartID = c.CartID
                  JOIN Items i ON ci.ItemID = i.ItemID
                  WHERE c.UserID = @UserID;
              `);

          // Clear the user's cart
          await pool.request()
              .input('UserID', sql.Int, userID)
              .query('DELETE FROM CartItems WHERE CartID = (SELECT CartID FROM Cart WHERE UserID = @UserID);');


      await transaction.commit();
      res.json({ success: true, message: 'Checkout successful', orderID: orderID });
  } catch (error) {
      console.error('Checkout process failed:', error);
      await transaction.rollback();
      res.status(500).json({ success: false, message: 'Checkout process failed. ' + error.message });
  }
});




    // Fetch items in the user's orders
  app.get('/api/orders', async (req, res) => {
      const { userID } = req.query; // userID is passed as a query parameter

      if (!userID) {
          return res.status(400).send('Missing userID parameter');
      }

      try {
          const pool = await sql.connect(config);
          const result = await pool.request()
              .input('UserID', sql.Int, userID)
              .query(`
                  SELECT o.OrderID, o.OrderStatus, o.OrderDate, o.TotalPrice, o.Address, o.City , o.State, o.ZipCode,
                         oi.Quantity, oi.PricePerUnit, i.ItemName
                  FROM Orders o
                  JOIN OrderItems oi ON o.OrderID = oi.OrderID
                  JOIN Items i ON oi.ItemID = i.ItemID
                  WHERE o.CustomerID = @UserID
                  ORDER BY o.OrderDate DESC`);
          res.json(result.recordset);
      } catch (error) {
          console.error('Error fetching orders:', error);
          res.status(500).send('Error processing request');
      }
  });




  //Connection confirmation
    sql.connect(config).then(() => {
      console.log('Connected to SQL Server successfully');

      // Route handler for '/api/item'
      app.get('/api/item', async (req, res) => {
          const itemId = req.query.id; // The item ID is passed as a query parameter 'id'
          if (!itemId) {
              return res.status(400).send('Item ID is required');
          }

          try {
              let request = new sql.Request();
              request.input('id', sql.Int, itemId); // Declare the input parameter 'id'

              const result = await request.query(`
                  SELECT i.ItemID, i.ItemName, i.ItemDescription, i.ItemPrice, i.ItemSKU, i.ItemCategory, i.CreateDate, i.ItemImageURL, s.Quantity
                  FROM Items i
                  JOIN Stock s ON i.ItemID = s.ItemID
                  WHERE i.ItemID = @id
              `);

              if (result.recordset.length > 0) {
                  res.json(result.recordset[0]); // Send back the first (and should be only) item
              } else {
                  res.status(404).send('Item not found');
              }
          } catch (err) {
              console.error('Database query error', err);
              res.status(500).send('Error retrieving item from database');
          }
      });


      app.get('/api/searchitems', async (req, res) => {
      const { query, category, sort } = req.query;
      let sqlQuery = `
          SELECT Items.ItemID, Items.ItemName, Items.ItemDescription, Items.ItemPrice, Items.ItemSKU, Items.ItemCategory, Items.CreateDate, Items.ItemImageURL, Stock.Quantity
          FROM Items
          JOIN Stock ON Items.ItemID = Stock.ItemID`;

      let whereClauses = [];
      if (query) {
          whereClauses.push(`(Items.ItemName LIKE '%' + @query + '%' OR Items.ItemDescription LIKE '%' + @query + '%')`);
      }
      if (category) {
          whereClauses.push("Items.ItemCategory = @category");
      }
      if (whereClauses.length > 0) {
          sqlQuery += ` WHERE ${whereClauses.join(' AND ')}`;
      }

      // Sort logic
      switch(sort) {
          case 'name-asc': sqlQuery += ' ORDER BY Items.ItemName ASC'; break;
          case 'name-desc': sqlQuery += ' ORDER BY Items.ItemName DESC'; break;
          case 'price-asc': sqlQuery += ' ORDER BY Items.ItemPrice ASC'; break;
          case 'price-desc': sqlQuery += ' ORDER BY Items.ItemPrice DESC'; break;
          // Add other sort criteria as needed
      }

      try {
          let request = new sql.Request();
          if (query) {
              request.input('query', sql.VarChar, query);
          }
          if (category) {
              request.input('category', sql.VarChar, category);
          }
          const result = await request.query(sqlQuery);
          res.json(result.recordset);
      } catch (err) {
          console.error('Database search query error', err);
          res.status(500).send('Error searching items in the database');
      }
  });

    }).catch(err => {
        // Handle errors related to SQL server connection
        console.error('Database connection failed', err);
    });

    }).catch(err => {
        // Handle errors related to SQL server connection
        console.error('Database connection failed', err);
    });

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
