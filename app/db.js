"use strict"

const sqlite3 = require("sqlite3").verbose();
const filepath = "./db_data/storage.db";

const db = createDbConnection();

function createDbConnection() {
	const db = new sqlite3.Database(filepath, (error) => {
		if (error) {
			return console.error(error.message);
		}
		onAfterConnect()
	});
	return db;
}

function onAfterConnect() {
	db.run(`CREATE TABLE IF NOT EXISTS 'setup' ('version' INTEGER)`, (err, ret) => {});
	db.run(`CREATE TABLE IF NOT EXISTS 'reminder_pin' ('weekNr' INTEGER, 'chatId' INTEGER, 'msgId' INTEGER, PRIMARY KEY (weekNr))`, (err, ret) => {});
}


module.exports = { createDbConnection }