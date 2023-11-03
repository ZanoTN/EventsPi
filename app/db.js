"use strict"

const sqlite3 = require("sqlite3").verbose();
const filepath = "./db_data/storage.db";

const db = createDbConnection();

function createDbConnection() {
	const db = new sqlite3.Database(filepath, (error) => {
		if (error) {
			return console.error(error.message);
		}
		checkIfExistTable("setup")
		console.log("Connection with SQLite has been established");

	});
	return db;
}


function checkIfExistDatabase() {
	db.all(`SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}'`, (err, rows) => {
		if(err) {
			console.log(err)
		} else {
			onAfterConnect()
		}
	})
}

function onAfterConnect() {
	db.run(`CREATE TABLE IF NOT EXISTS 'setup' ('version' INTEGER)`, (err, ret) => console.log(ret));
	db.run(`CREATE TABLE IF NOT EXISTS 'reminder_pin' ('weekNr' INTEGER, 'chatId' INTEGER, 'msgId' INTEGER, PRIMARY KEY (weekNr))`, (err, ret) => console.log(ret));

}


module.exports = { createDbConnection }