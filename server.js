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


}).catch(err => {
    console.error('Database connection failed', err);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
