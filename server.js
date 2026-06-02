const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();

app.use(express.json({ limit: '50mb' }));

const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = 'dairy_db';
let db;

MongoClient.connect(MONGO_URL).then(client => {
    console.log('MongoDB Connected to dairy_db');
    db = client.db(DB_NAME);
    
    app.listen(3000, () => {
        console.log('Server ચાલુ છે');
    });

}).catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
});

app.get('/', (req, res) => {
    res.send('Kalpesh Dairy API Live ✅');
});

// ડેટા અપલોડ કરવા માટે
app.post('/api/dairy/upload', async (req, res) => {
    try {
        if (!db) return res.status(503).json({ error: 'DB not connected yet' });
        
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

// ડેટા જોવા માટે - આ નવું ઉમેર્યું છે
app.get('/api/dairy/records', async (req, res) => {
    try {
        if (!db) return res.status(503).json({ error: 'DB not connected yet' });
        
        const records = await db.collection('dairy_records')
            .find({})
            .sort({ uploadedAt: -1 })
            .limit(100)
            .toArray();
            
        res.json({ success: true, count: records.length, data: records });
        
    } catch (err) {
        res.status(500).json({ error: 'Server Error: ' + err.message });
    }
});
app.delete('/api/dairy/records', async (req, res) => {
    try {
        if (!db) return res.status(503).json({ error: 'DB not connected yet' });

        // સબ ડીલરની જરૂર નથી, આખું કલેક્શન ખાલી કરો
        const result = await db.collection('dairy_records').deleteMany({}); 

        res.json({ 
            success: true, 
            message: `All ${result.deletedCount} records deleted` 
        });

    } catch (err) {
        res.status(500).json({ error: 'Server Error: ' + err.message });
    }
});
app.get('/api/dairy/records', async (req, res) => {
    try {
        if (!db) return res.status(503).json({ error: 'DB not connected yet' });

        // બધો ડેટા લાવો, સબ ડીલર વગર
        const records = await db.collection('dairy_records').find({}).toArray();

        res.json({ 
            success: true, 
            count: records.length,
            data: records 
        });

    } catch (err) {
        res.status(500).json({ error: 'Server Error: ' + err.message });
    }
});
