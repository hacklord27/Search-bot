const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(bodyParser.json());

const GOOGLE_API_KEY = 'AIzaSyAvbVFdj4GTK3jr9N-VaV1qDdYTlw1FtgE';
const CX = '13bb74cfa19484c23';

// API route để tìm kiếm từ Google
app.post('/search', async (req, res) => {
    const { industry, location } = req.body;

    try {
        const response = await axios.get('https://developers.google.com/custom-search/v1', {
            params: {
                key: GOOGLE_API_KEY,
                cx: CX,
                q: `${industry} ${location}`,
            },
        });

        const results = response.data.items || [];
        res.json({ results });
    } catch (error) {
        console.error('Error fetching data from Google:', error);
        res.status(500).json({ error: 'Failed to fetch data from Google' });
    }
});

// Serve static files (frontend)
app.use(express.static('public'));

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
