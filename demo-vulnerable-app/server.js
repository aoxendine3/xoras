const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const _ = require('lodash'); // Bloat example

const app = express();
const port = 3000;
const db = new sqlite3.Database(':memory:');

app.use(bodyParser.json());

// INITIALIZE DB
db.serialize(() => {
    db.run("CREATE TABLE orders (id INT, customer TEXT, status TEXT, amount REAL)");
    for (let i = 0; i < 1000; i++) {
        db.run("INSERT INTO orders VALUES (?, ?, ?, ?)", [i, `Customer ${i}`, 'PENDING', Math.random() * 100]);
    }
});

// REGRESSION 1: Performance Drift (Linear scan search)
app.get('/orders/search', (req, res) => {
    const start = Date.now();
    const query = req.query.q || '';
    
    // Intentionally inefficient search simulating drift
    db.all("SELECT * FROM orders", (err, rows) => {
        const filtered = rows.filter(row => row.customer.includes(query));
        
        // Simulating "real-world" pressure blocking loop
        for(let i=0; i<2e7; i++) { Math.sqrt(i); } 

        const end = Date.now();
        res.json({
            count: filtered.length,
            latency: `${end - start}ms`,
            status: 'success'
        });
    });
});

app.get('/health', (req, res) => res.send('OK'));

app.listen(port, () => {
    console.log(`Demo SaaS Order API listening at http://localhost:${port}`);
});
