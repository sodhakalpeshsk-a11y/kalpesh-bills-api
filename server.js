const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// MongoDB Connect - આમાં કૌંસનો બગ નથી
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch(err => console.error('MongoDB Error:', err));

// બિલનો ડેટા કેવો સેવ થશે એનું સ્ટ્રક્ચર
const BillSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  mobile: String,
  items: [{
    name: String,
    qty: Number,
    price: Number
  }],
  total: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

const Bill = mongoose.model('Bill', BillSchema);

// API ચાલુ છે કે નહીં એ ચેક કરવા
app.get('/', (req, res) => {
  res.send('Kalpesh Bills API is Live and Running');
});

// નવું બિલ સેવ કરવા
app.post('/api/bills', async (req, res) => {
  try {
    const newBill = new Bill(req.body);
    await newBill.save();
    res.status(201).json({ message: 'Bill Saved', bill: newBill });
  } catch (error) {
    res.status(500).json({ error: 'Error saving bill' });
  }
});

// બધા બિલ લાવવા
app.get('/api/bills', async (req, res) => {
  try {
    const bills = await Bill.find().sort({ date: -1 });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching bills' });
  }
});

// સર્વર ચાલુ કર
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
