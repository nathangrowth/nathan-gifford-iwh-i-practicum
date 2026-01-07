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
    const OBJECT_TYPE = process.env.OBJECT_TYPE;
    const properties = [
        'title',
        'composers',
        'ccli_number',
        'year',
        'publishers',
        'performing_rights_association'
    ];

    //console.log(`Making request to HubSpot... Token length: ${ACCESS_TOKEN.length}`);

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

app.get('/update-cobj', async (req, res) => {
    const objectId = req.query.id;
    const OBJECT_TYPE = process.env.OBJECT_TYPE;

    if (!objectId) {
        return res.render('update-cobj', { title: 'Add New Song', song: null });
    }

    const getSongUrl = `https://api.hubapi.com/crm/v3/objects/${OBJECT_TYPE}/${objectId}`;
    const properties = ['title', 'composers', 'ccli_number', 'year', 'publishers', 'performing_rights_association'];

    try {
        const response = await axios.get(getSongUrl, {
            headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            params: { properties: properties.join(',') }
        });

        res.render('update-cobj', { title: 'Update Song', song: response.data });
    } catch (error) {
        console.error(error);
        res.render('update-cobj', { title: 'Error', song: null, error: error.message });
    }
});

app.post('/update-cobj', async (req, res) => {
    const objectId = req.query.id;
    const OBJECT_TYPE = process.env.OBJECT_TYPE;

    const properties = {
        title: req.body.title,
        composers: req.body.composers,
        ccli_number: req.body.ccli_number,
        year: req.body.year,
        publishers: req.body.publishers,
        performing_rights_association: req.body.performing_rights_association
    };

    const headers = {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
    };

    try {
        if (objectId) {
            const updateUrl = `https://api.hubapi.com/crm/v3/objects/${OBJECT_TYPE}/${objectId}`;
            await axios.patch(updateUrl, { properties }, { headers });
        } else {
            const createUrl = `https://api.hubapi.com/crm/v3/objects/${OBJECT_TYPE}`;
            await axios.post(createUrl, { properties }, { headers });
        }

        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating/creating song.');
    }
});

app.get('/delete-cobj', async (req, res) => {
    const objectId = req.query.id;
    const OBJECT_TYPE = process.env.OBJECT_TYPE;

    if (!objectId) {
        return res.redirect('/');
    }

    const deleteUrl = `https://api.hubapi.com/crm/v3/objects/${OBJECT_TYPE}/${objectId}`;
    const headers = {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
    };

    try {
        await axios.delete(deleteUrl, { headers });
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting song.');
    }
});

app.listen(3000, () => console.log('Listening on http://localhost:3000'));