const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
app.use(cors());

// Serve static files from the current directory
app.use(express.static('.'));

const port = 3000;

const config = {
    user: 'test',
    password: 'password',
    server: 'DARKGOKU13\\SCHOOLWORK',
    database: 'BookStore',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

sql.connect(config).then(() => {
    console.log('Connected to SQL Server successfully');

    app.get('/api/stockitems', async (req, res) => {
    try {
        const result = await sql.query`
            SELECT i.ItemID, i.ItemName, i.ItemDescription, i.ItemPrice, i.ItemSKU, i.ItemCategory, i.CreateDate, i.ItemImageURL, s.Quantity
            FROM Items i
            JOIN Stock s ON i.ItemID = s.ItemID`;
        res.json(result.recordset);
    } catch (err) {
        console.error('Database query error', err);
        res.status(500).send('Error retrieving items from database');
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


sql.connect(config).then(() => {
    console.log('Connected to SQL Server successfully');

    // Route handler for '/api/item'
    app.get('/api/item', async (req, res) => {
        const itemId = req.query.id; // Assuming the item ID is passed as a query parameter 'id'
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
    console.error('Database connection failed', err);
});

}).catch(err => {
    console.error('Database connection failed', err);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
