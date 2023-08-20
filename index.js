"use strict"

const { TypeLogs, sendLog } = require("./app/logs")
sendLog("Start app", TypeLogs.INFO);

process.env.NTBA_FIX_319 = 1;
process.env.NTBA_FIX_350 = 1;

if(process.env.NODE_ENV !== "production") {
	require('dotenv').config()
}
checkEnvVariable()

const GoogleCalendarApi = require('./app/googleCalendarDownload');
const Event = require("./app/event");
const TelegramBot = require("./app/telegramBot");

const CHAT_ID_FOR_REMINDERS = process.env.TELEGRAM_CHAT_ID;
const BOT_WEEKLY_REMINDER = (typeof process.env.BOT_WEEKLY_REMINDER === "string" && process.env.BOT_WEEKLY_REMINDER.toLowerCase() === "yes");
let events = [];


function UpdateFromGoogleCalendar() {
	sendLog("Start update from google calendar", TypeLogs.INFO);
	return new Promise((resolve, reject) => {	
		const promise = GoogleCalendarApi.getEvents()
		promise.then((data) => {
			resolve(data);
		})
	})
}


async function checkEventForTelegram() {
	const rangeStart = new Date();
	rangeStart.setSeconds(0);
	rangeStart.setMilliseconds(0);

	for(let i=0;i<events.length;i++) {
		const event = events[i];

		if(event.insideRangeNotificationTime(rangeStart, 1)) {
			await TelegramBot.sendEventTelegram(CHAT_ID_FOR_REMINDERS, event);
		}
	}
}

function sendendReminderForAllWeek() {
	const week_start_date = new Date();
	week_start_date.setDate(new Date().getDate() + 1);
	resetDayAtStart(week_start_date);

	let eventsInNextWeek = [];

	events.map((event, i) => {
		if(event.insideRangeStartTime(week_start_date, 10080)) { // 7*24*60
			eventsInNextWeek.push(event);
		}
	});

	if(eventsInNextWeek.length !== 0) {
		TelegramBot.sendGroupEventsTelegram(CHAT_ID_FOR_REMINDERS, eventsInNextWeek);
	}
}


function resetDayAtStart(date) {
	date.setHours(0)
	date.setMinutes(0)
	date.setSeconds(0)
	date.setMilliseconds(0)
}

function checkEnvVariable() {
	sendLog("Check enviroment variable", TypeLogs.INFO);
	let errors_list = []
	let warnings_list = []

	if(!process.env.TELEGRAM_BOT_TOKEN) {
		errors_list.push("TELEGRAM_BOT_TOKEN: unset")
	}
	if(!process.env.TELEGRAM_CHAT_ID) {
		warnings_list.push("TELEGRAM_CHAT_ID: unset")
	}


	if(!process.env.GOOGLE_PRIVATE_KEY) {
		errors_list.push("GOOGLE_PRIVATE_KEY: unset")
	}
	if(!process.env.GOOGLE_CLIENT_EMAIL) {
		errors_list.push("GOOGLE_CLIENT_EMAIL: unset")
	}
	if(!process.env.GOOGLE_PROJECT_NUMBER) {
		errors_list.push("GOOGLE_PROJECT_NUMBER: unset")
	}
	if(!process.env.GOOGLE_CALENDAR_ID) {
		errors_list.push("GOOGLE_CALENDAR_ID: unset")
	}


	if(!process.env.BOT_REMINDER_TIME) {
		errors_list.push("BOT_REMINDER_TIME: unset")
	}
	if(!(["1hr", "6hr", "18", "08-18"].includes(process.env.BOT_REMINDER_TIME))) {
		errors_list.push("BOT_REMINDER_TIME: unvalid")
	}
	if(!process.env.BOT_WEEKLY_REMINDER) {
		errors_list.push("BOT_WEEKLY_REMINDER: unset")
	}
	if(process.env.BOT_WEEKLY_REMINDER !== "yes" && process.env.BOT_WEEKLY_REMINDER !== "no") {
		errors_list.push("BOT_REMINDER_TIME: not yes or no")
	}


	errors_list.forEach(item => {
		sendLog(item, TypeLogs.ERROR)
	})
	warnings_list.forEach(item => {
		sendLog(item, TypeLogs.WARNING)
	})

	if(errors_list.length != 0) {
		process.exit()
	}
}

async function loop() {
	sendLog("Start loop", TypeLogs.INFO)

	let lastMinutes = new Date().getMinutes()

	UpdateFromGoogleCalendar()
	.then((data) => {
		events = data;
	})

	setInterval(() => {
		const now = new Date

		if(now.getMinutes() != lastMinutes) {

			// Get calendar
			if(now.getMinutes() % 15 === 0) {
				UpdateFromGoogleCalendar()
				.then((data) => {
					events = data;
				})
			}

			// See if is sunday at 14:00
			if(BOT_WEEKLY_REMINDER) {
				if(now.getDay() === 0 && now.getHours() === 14 && now.getMinutes() === 0) {
				 	sendendReminderForAllWeek()
				}
			}

			// See if there is message to send
			checkEventForTelegram()

			lastMinutes = now.getMinutes()
		}
	}, 1000)
}

loop();