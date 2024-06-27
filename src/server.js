const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const { addUser, getUserByEmail, addCredential, getCredentialById } = require('./database');

const app = express();
app.use(bodyParser.json());
app.use(cors({
    origin: 'https://localhost:3000', // Adjust as necessary
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Cross-Origin-Opener-Policy', 'Cross-Origin-Embedder-Policy']
}));

app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    next();
});

app.post('/register', async (req, res) => {
    console.log('Register request received:', req.body);
    const { id, rawId, response, type, email } = req.body;
    try {
        await addCredential(id, rawId, response, type, email);
        await addUser(email, id);
        res.status(200).send('Registered successfully');
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Registration failed');
    }
});

app.post('/login', async (req, res) => {
    console.log('Login request received:', req.body);
    const { id, rawId, response, type } = req.body;
    console.log('The id is ', id);
    try {
        const credential = await getCredentialById(id);
        if (credential) {
            res.status(200).send('Logged in successfully');
        } else {
            res.status(400).send('Credential not found');
        }
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send('Login failed');
    }
});

app.get('/getCredentialId', async (req, res) => {
    const { email } = req.query;
    try {
        const user = await getUserByEmail(email);
        if (user) {
            res.json({ credentialId: user.id.replace(/\+/g, '-').replace(/\//g, '_') });
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).send('Failed to fetch user');
    }
});

app.get('/users', async (req, res) => {
    try {
        const users = await new Promise((resolve, reject) => {
            db.all("SELECT * FROM users", (err, rows) => {
                if (err) {
                    return reject(err);
                }
                resolve(rows);
            });
        });
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Failed to fetch users');
    }
});

const options = {
    key: fs.readFileSync('./localhost-key.pem'),
    cert: fs.readFileSync('./localhost.pem')
};

https.createServer(options, app).listen(443, () => {
    console.log('Server is running on https://localhost:443');
});
