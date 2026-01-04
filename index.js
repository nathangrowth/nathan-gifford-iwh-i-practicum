require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PRIVATE_APP_ACCESS = `pat-na1-718c969c-3419-4d0e-a377-462d5269ef96`;

app.get('/', async (req, res) => {
    const companies = 'https://api.hubspot.com/crm/v3/objects/contacts';
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    }
    try {
        const response = await axios.get(companies, { headers });
        res.json(response.data.results);    
    } catch (error) {
        console.error(error);
    }
});

const ACCESS_TOKEN = process.env.ACCESS_TOKEN ? process.env.ACCESS_TOKEN.trim() : '';

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