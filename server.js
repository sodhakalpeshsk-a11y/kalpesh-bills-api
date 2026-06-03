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

// ==================================
// 3. સર્વર ચાલુ કરો - આ સૌથી છેલ્લે જ
// ==================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server ચાલુ છે Port: ${PORT}`);
});
