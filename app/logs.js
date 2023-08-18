"use strict"

const TypeLogs = {
	INFO: "INFO",
	DEBUG: "DEBUG",
	ERROR: "ERROR",
	WARNING: "WARNING"
}

/**
 * @param {string} msg 
 * @param {TypeLogs} type 
 */
function sendLog(msg, type) {
	console.log(`[${new Date().toISOString()}] [${type}] \t ${msg}`)
}

module.exports = { TypeLogs, sendLog };