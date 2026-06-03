
const express = require('express');
const fs = require('fs');
const path = require('path');
// const mongoose = require('mongoose'); // જો MongoDB ન વાપરતા હો તો // રહેવા દો
const app = express();
app.use(express.json());

// ==================================
// જો MongoDB વાપરતા હો તો આ કોમેન્ટ કાઢજો
// ==================================
// mongoose.connect('તમારી_MONGO_URL')
//.then(() => console.log('MongoDB Connected'))
//.catch(err => {
// console.error('MongoDB Connection Error:', err);
// process.exit(1);
// });

// ==================================
// 1. તમારો જૂનો /api/dairy/upload વાળો રૂટ
// ==================================
app.post('/api/dairy/upload', async (req, res) => {
    // તમારો એક્સલ વાળો જૂનો કોડ અહીં પેસ્ટ કરો
    res.send('Upload API Working');
});

// ==================================
// 2. નવા ફોલ્ડર વાળા રૂટ
// ==================================
app.post('/save-data', (req, res) => {
    try {
        const { folder, mobile, fat, ltr, amount } = req.body;
        if (!folder) return res.status(400).send('Folder name required');

        const dir = path.join(__dirname, folder);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const date = new Date().toISOString().slice(0, 10);
        const filepath = path.join(dir, date + '.txt');
        const data = `Mobile: ${mobile}, Fat: ${fat}, Ltr: ${ltr}, Amount: ${amount}\n`;

        fs.appendFileSync(filepath, data);
        res.send('Saved successfully');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/list-data', (req, res) => {
    try {
        const folders = fs.readdirSync(__dirname).filter(f => {
            return fs.statSync(path.join(__dirname, f)).isDirectory() &&!isNaN(f);
        });

        let result = {};
        folders.forEach(folder => {
            const files = fs.readdirSync(path.join(__dirname, folder));
            result[folder] = files;
        });

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/download/:folder/:file', (req, res) => {
    try {
        const filepath = path.join(__dirname, req.params.folder, req.params.file);
        if (fs.existsSync(filepath)) {
            res.download(filepath);
        } else {
            res.status(404).send('File not found');
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/', (req, res) => {
    res.send('Kalpesh Dairy API Live ✅');
});

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
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server ચાલુ છે Port: ${PORT}`);
});
