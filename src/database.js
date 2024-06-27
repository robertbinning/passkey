const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite'); // Use a file-based database

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, id TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS credentials (id TEXT PRIMARY KEY, rawId TEXT, response TEXT, type TEXT, email TEXT)");
});

const addUser = (email, id) => {
    return new Promise((resolve, reject) => {
        db.run("INSERT INTO users (email, id) VALUES (?, ?)", [email, id], function(err) {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
};

const getUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
            if (err) {
                return reject(err);
            }
            resolve(row);
        });
    });
};

const addCredential = (id, rawId, response, type, email) => {
    return new Promise((resolve, reject) => {
        db.run("INSERT INTO credentials (id, rawId, response, type, email) VALUES (?, ?, ?, ?, ?)", [id, rawId, response, type, email], function(err) {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
};

const getCredentialById = (id) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM credentials WHERE id = ?", [id], (err, row) => {
            if (err) {
                return reject(err);
            }
            resolve(row);
        });
    });
};

module.exports = {
    addUser,
    getUserByEmail,
    addCredential,
    getCredentialById
};
