const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json({ limit: '10mb' }));

app.post('/api/dairy/upload', (req, res) => {
    try {
        // ફોલ્ડર કોડ અલગ લો, ડેટાના વેન્ડર કોડ સાથે લેવા-દેવા નથી
        const folderCode = req.body.folderCode || '000';
        const records = req.body.records; // ડેટા અલગ

        if (!Array.isArray(records) || records.length === 0) {
            return res.status(400).send('ડેટા ખાલી છે');
        }

        const currdate = records[0].currdate;
        const session = records[0].session1 || 'M';

        // 2026-06-03 → 03062026
        const fileDate = currdate.split('-').reverse().join('');
        const filename = fileDate + session + '.Txt';

        // ફોલ્ડર: Dairy-data/001/ - આ folderCode થી બનશે
        const dir = path.join(__dirname, 'Dairy-data', folderCode);
        fs.mkdirSync(dir, { recursive: true });

        // ફાઈલની અંદર: ડેટા એમ ને એમ, જે.mdb માં છે એ
        let fileContent = '';
        records.forEach(rec => {
            fileContent += `${rec.currdate},${rec.srNo},${rec.vendorCode},${rec.type},${rec.fat},${rec.ltr},${rec.amount},${rec.currTime},${rec.session1},${rec.rate},${rec.prv_prc},${rec.jama_prc},${rec.pmtamt}\n`;
        });

        fs.writeFileSync(path.join(dir, filename), fileContent, 'utf8');
        res.send(`સેવ થયું: Dairy-data/${folderCode}/${filename}`);

    } catch (err) {
        res.status(500).send('એરર: ' + err.message);
    }
});
app.get('/download/:folderCode/:filename', (req, res) => {
    const folderCode = req.params.folderCode;
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'Dairy-data', folderCode, filename);
    
    if (fs.existsSync(filePath)) {
        res.download(filePath); // ફાઈલ ડાઉનલોડ થશે
    } else {
        res.status(404).send('File not found: ' + filename);
    }
});
app.get('/', (req, res) => res.send('API Live ✅'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Port: ${PORT}`));
