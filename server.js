const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());

mongoose.connect(mongodb+srv://sodhakalpeshsk_db_user:<DDOEc7u8PqeMeu54>@bills-cluster.b5ovvc5.mongodb.net/kalpeshbills?appName=bills-cluster);

const BillSchema = new mongoose.Schema({
    billNo: String,
    amount: Number,
    date: { type: Date, default: Date.now }
});
const Bill = mongoose.model('Bill', BillSchema);

app.post('/save-bill', async (req, res) => {
    const bill = new Bill(req.body);
    await bill.save();
    res.send('Bill Saved');
});

app.get('/', (req, res) => res.send('Kalpesh API is Running'));

app.listen(process.env.PORT || 3000);
