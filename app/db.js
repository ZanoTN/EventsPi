"use strict"

const sqlite3 = require("sqlite3").verbose();
const filepath = "./db_data/storage.db";
const version = "0.0.1";

const db = createDbConnection();

function createDbConnection() {
	const db = new sqlite3.Database(filepath, (error) => {
		if (error) {
			console.error(error.message);
		}
		onAfterConnect()
	});
	return db;
}

function onAfterConnect() {
	db.run(`CREATE TABLE IF NOT EXISTS 'setup' ('version' TEXT)`, (res, err) => {if(err) {console.log(err)}});
	db.run(`INSERT INTO 'setup' ('version') VALUES ('${version}')`, (res, err) => {if(err) {console.log(err)}});
}


module.exports = { createDbConnection }