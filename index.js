const express = require('express');
const axios = require('axios');
const app = express();

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PRIVATE_APP_ACCESS = `b9560e7a-de84-4e73-8922-bcee2876729b`;

const OBJECT_TYPE = 'songs';

app.get('/', async (req, res) => {
    const properties = [
        'title',
        'composers',
        'ccli_number',
        'year',
        'lyrics',
        'publishers',
        'performing_rights_association'
    ];

    try {
        const response = await axios.get(`https://api.hubapi.com/crm/v3/objects/${OBJECT_TYPE}`, {
            headers: {
                'Authorization': `Bearer ${PRIVATE_APP_ACCESS}`,
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
        console.error('Error fetching songs:', error.response ? error.response.data : error.message);
        res.render('home', { title: 'Songs Library', songs: [], error: 'Failed to retrieve songs.' });
    }
});

app.listen(3000, () => console.log('Listening on http://localhost:3000'));