require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const ACCESS_TOKEN = process.env.ACCESS_TOKEN ? process.env.ACCESS_TOKEN.trim() : '';

app.get('/', async (req, res) => {
    // Use the OBJECT_TYPE from your .env file (should be "songs" or "2-12345...")
    const objectType = process.env.OBJECT_TYPE || 'songs';
    
    // We request specific properties like 'name' and 'artist' (adjust these if your properties are named differently)
    const songsUrl = `https://api.hubapi.com/crm/v3/objects/${objectType}?properties=name,artist`;
    
    const headers = {
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
    };

    console.log("Headers: ", headers);

    try {
        const response = await axios.get(songsUrl, { headers });
        
        // Render the 'home' pug template and pass the data as 'songs'
        res.render('home', { songs: response.data.results });    
    } catch (error) {
        console.error('Error fetching songs:', error.response ? error.response.data : error.message);
        res.status(500).send('Error retrieving songs. Check console for details.');
    }
});

app.get('/', async (req, res) => {
    const OBJECT_TYPE = 'songs';
    const properties = [
        'title',
        'composers',
        'ccli_number',
        'year',
        'lyrics',
        'publishers',
        'performing_rights_association'
    ];

    console.log(`Making request to HubSpot... Token length: ${ACCESS_TOKEN.length}`);

    try {
        const response = await axios.get(`https://api.hubapi.com/crm/v3/objects/${OBJECT_TYPE}`, {
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            params: {
                properties: properties.join(','),
                limit: 100
            }
        });

        const songs = response.data.results;
        res.render('home', { title: 'Songs Library', songs });
        
    } catch (error) {
        console.error('Error details:', error.response ? error.response.data : error.message);
        
        if (error.config && error.config.headers) {
            const headers = {...error.config.headers};
            if (headers.Authorization) {
                headers.Authorization = headers.Authorization.substring(0, 15) + '...';
            }
            console.error("DEBUG: Request Headers sent:", headers);
        }

        res.render('home', { 
            title: 'Songs Library', 
            songs: [], 
            error: `Error: ${error.response ? error.response.data.message : error.message}` 
        });
    }
});

app.listen(3000, () => console.log('Listening on http://localhost:3000'));