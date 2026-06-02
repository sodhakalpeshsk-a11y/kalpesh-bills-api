const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();

app.use(express.json({ limit: '50mb' })); // મોટો ડેટા હેન્ડલ કરવા

const MONGO_URL = 'mongodb://localhost:27017';
const DB_NAME = 'dairy_db';
let db;

MongoClient.connect(MONGO_URL).then(client => {
    console.log('MongoDB કનેક્ટ થઈ ગયું');
    db = client.db(DB_NAME);
}).catch(err => console.error('MongoDB Error:', err));

// 1. VB6 માંથી ડેટા અપલોડ કરવાનો API
app.post('/api/dairy/upload', async (req, res) => {
    try {
        const dairyData = req.body; // VB6 માંથી Array આવે છે

        if (!Array.isArray(dairyData) || dairyData.length === 0) {
            return res.status(400).json({ error: 'ડેટા ખાલી છે' });
        }

        // દરેક રેકોર્ડમાં upload_date અને createdAt ઉમેરો
        const dataToInsert = dairyData.map(item => ({
            currdate: new Date(item.currdate), // String ને Date માં કન્વર્ટ
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
            uploadedAt: new Date() // ક્યારે અપલોડ થયું
        }));

        const result = await db.collection('dairy_records').insertMany(dataToInsert);

        res.json({
            success: true,
            message: `${result.insertedCount} રેકોર્ડ સેવ થયા`
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error: ' + err.message });
    }
});

// 2. તારીખ + Shift પ્રમાણે ડેટા પાછો લેવાનો API
app.get('/api/dairy/date/:date/shift/:shift', async (req, res) => {
    try {
        const { date, shift } = req.params; // date = 2026-11-02
        
        // 2026-11-02 00:00:00 થી 23:59:59 સુધીનો ડેટા
        const startDate = new Date(date + 'T00:00:00.000Z');
        const endDate = new Date(date + 'T23:59:59.999Z');

        const records = await db.collection('dairy_records').find({
            currdate: { $gte: startDate, $lte: endDate },
            session1: shift.toUpperCase() // MORNING, EVENING
        }).toArray();

        res.json(records);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. બધો ડેટા જોવા માટે - ટેસ્ટિંગ માટે
app.get('/api/dairy/all', async (req, res) => {
    const records = await db.collection('dairy_records').find({}).limit(100).toArray();
    res.json(records);
});
app.get('/', (req, res) => {
    res.send('Kalpesh Dairy API is running ✅');
});
app.listen(3000, () => console.log('Server ચાલુ છે http://localhost:3000'));
