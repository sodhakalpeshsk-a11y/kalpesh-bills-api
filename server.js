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

   const records = req.body;
        if (!Array.isArray(records) || records.length === 0) {
            return res.status(400).send('ડેટા ખાલી છે');
        }

        // પહેલા રેકોર્ડમાંથી વિગત કાઢો
        const vendorCode = records[0].vendorCode || '000';
        const currdate = records[0].currdate; // '2026-06-03'
        const session = records[0].session1 || 'M'; // M અથવા E

        // તારીખ: 2026-06-03 → 03062026
        const dateParts = currdate.split('-');
        const fileDate = dateParts[2] + dateParts[1] + dateParts[0];

        // ફાઈલનું નામ: 03062026M.Txt
        const filename = fileDate + session + '.Txt';

        // ફોલ્ડર: dairy_data/001/
        const dir = path.join(__dirname, 'dairy_data', vendorCode);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        //.Txt ફાઈલનો કન્ટેન્ટ બનાવો - MDB જેવો જ ઓર્ડર
        let fileContent = '';
        records.forEach(rec => {
            // તમારા ફોટા વાળા ઓર્ડર પ્રમાણે: Currdate,SrNo,VendorCode,Type,Fat,Ltr,Amount,CurrTime,Session1,Rate,prv_prc,jama_prc,pmtamt
            fileContent += `${rec.currdate},${rec.srNo},${rec.vendorCode},${rec.type},${rec.fat},${rec.ltr},${rec.amount},${rec.currTime},${rec.session1},${rec.rate},${rec.prv_prc},${rec.jama_prc},${rec.pmtamt}\n`;
        });

        const filepath = path.join(dir, filename);
        fs.writeFileSync(filepath, fileContent, 'utf8');

        res.send(`ફાઈલ સેવ થઈ: ${vendorCode}/${filename} - ${records.length} રેકોર્ડ`);

    } catch (err) {
        console.error("Save Error:", err);
        res.status(500).send('ફાઈલ સેવ કરવામાં એરર: ' + err.message);
    }
});

// ડાઉનલોડ રૂટ
app.get('/download/dairy_data/:vendor/:file', (req, res) => {
    const filepath = path.join(__dirname, 'dairy_data', req.params.vendor, req.params.file);
    if (fs.existsSync(filepath)) {
        res.download(filepath);
    } else {
        res.status(404).send('ફાઈલ મળી નથી');
    }
});

app.get('/', (req, res) => {
    res.send('Kalpesh Dairy API Live ✅.Txt ફાઈલ સેવ સિસ્ટમ');
});

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



// ==================================
// 3. સર્વર ચાલુ કરો - આ સૌથી છેલ્લે જ
// ==================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server ચાલુ છે Port: ${PORT}`);
});
