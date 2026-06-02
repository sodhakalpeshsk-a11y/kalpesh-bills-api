const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();

app.use(express.json({ limit: '50mb' }));

const MONGO_URL = 'mongodb://localhost:27017'; // Render પર આ બદલાશે
const DB_NAME = 'dairy_db';
let db;

MongoClient.connect(MONGO_URL).then(client => {
    console.log('MongoDB Connected Successfully');
    db = client.db(DB_NAME);
}).catch(err => console.error('MongoDB Error:', err));

// ✅ રૂટ 1: હોમ પેજ
app.get('/', (req, res) => {
    res.send('Kalpesh Dairy API Live ✅');
});

// ✅ રૂટ 2: બધા બિલ જોવા - આ જ મિસિંગ હતો
app.get('/api/bills', async (req, res) => {
    try {
        const records = await db.collection('dairy_records').find({}).limit(100).toArray();
        res.json(records);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ રૂટ 3: VB6 માંથી ડેટા અપલોડ
app.post('/api/dairy/upload', async (req, res) => {
    try {
        const dairyData = req.body;
        if (!Array.isArray(dairyData) || dairyData.length === 0) {
            return res.status(400).json({ error: 'ડેટા ખાલી છે' });
        }
        const dataToInsert = dairyData.map(item => ({
            currdate: new Date(item.currdate),
            srNo: item.srNo,
            vendorCode: item.vendorCode,
            type: item.type,
            fat: parseFloat(item.fat),
            ltr: parseFloat(item.ltr),
            amount: parseFloat(item.amount),
            currTime: item.currTime,
            session1: item.session1,
            rate: parseFloat(item.rate),
            prv_prc: parseFloat(item.prv_prc),
            jama_prc: parseFloat(item.jama_prc),
            pmtamt: parseFloat(item.pmtamt),
            uploadedAt: new Date()
        }));
        const result = await db.collection('dairy_records').insertMany(dataToInsert);
        res.json({ success: true, message: `${result.insertedCount} રેકોર્ડ સેવ થયા` });
    } catch (err) {
        res.status(500).json({ error: 'Server Error: ' + err.message });
    }
});

app.listen(3000, () => console.log('Server ચાલુ છે http://localhost:3000'));
