"use strict"

const { TypeLogs, sendLog } = require("./logs")
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {polling: true});

bot.on('message', async (msg) => {
	const text = msg.text;
	
	switch (text) {
		case "/id":
			sendLog(`Tselegram "/id" command in chat ${msg.chat.id}`);
			bot.sendMessage(msg.chat.id, msg.chat.id);
			break;
		default:
			break;
	}
});


/**
 * 
 * @param {number} chat_id 
 * @param {Event} event 
 * @returns 
 */
async function sendEventTelegram(chat_id, event) {
	return new Promise(async (resolve, reject) => {
		const opts = {parse_mode : "HTML","disable_web_page_preview": 1}
		bot.sendMessage(chat_id, event.telegramFormat(), opts)
		.then((data) => {
			sendLog(`Sended event reminder (chat id: ${chat_id}, event title: ${event.title})`, TypeLogs.INFO)
			resolve(data);
		})
		.catch((error) => {
			sendLog("Error on send message telegram", TypeLogs.ERROR)
			console.log(error)
			reject(error)
		})
	})
}

/**
 * 
 * @param {number} chat_id 
 * @param {Event[]} events
 * @returns 
 */
async function sendGroupEventsTelegram(chat_id, events) {
	let messageText = "📆 <b>EVENTS THIS WEEK</b>\n\n\n"
	
	events.forEach(event => {
		messageText+=event.telegramFormat() + "\n";
	});

	return new Promise(async (resolve, reject) => {
		const opts = {parse_mode : "HTML","disable_web_page_preview": 1}
		bot.sendMessage(chat_id, messageText, opts)
		.then((data) => {
			sendLog(`Sended events reminder for the week (chat id: ${chat_id})`, TypeLogs.INFO)
			resolve(data);
		})
		.catch((error) => {
			sendLog("Error on send message telegram", TypeLogs.ERROR)
			console.log(error)
			reject(error)
		})
	})
}

module.exports = { sendEventTelegram, sendGroupEventsTelegram }