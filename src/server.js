const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const https = require('https');
const fs = require('fs');

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

// In-memory store for credentials and users
const credentialsStore = {};
const usersStore = {};

app.post('/register', (req, res) => {
    console.log('Register request received:', req.body);
    const { id, rawId, response, type, email } = req.body;
    credentialsStore[id] = { rawId, response, type };
    usersStore[email] = { id, email }; // Store user with email
    res.status(200).send('Registered successfully');
});

app.post('/login', (req, res) => {
    console.log('Login request received:', req.body);
    const { id, rawId, response, type } = req.body;
    console.log('The id is ', id);
    // Verify the assertion here (this example just checks if the credential exists)
    if (credentialsStore[id]) {
        res.status(200).send('Logged in successfully');
    } else {
        res.status(400).send('Credential not found');
    }
});

app.get('/getCredentialId', (req, res) => {
    const { email } = req.query;
    const user = usersStore[email];
    if (user) {
        res.json({ credentialId: user.id.replace(/\+/g, '-').replace(/\//g, '_') });
    } else {
        res.status(404).send('User not found');
    }
});

app.get('/users', (req, res) => {
    res.json(Object.values(usersStore));
});

const options = {
    key: fs.readFileSync('./localhost-key.pem'),
    cert: fs.readFileSync('./localhost.pem')
};

https.createServer(options, app).listen(443, () => {
    console.log('Server is running on https://localhost:443');
});
