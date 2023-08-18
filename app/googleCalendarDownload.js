"use strict"

const { google } = require('googleapis');
var Event = require("./event");
const { sendLog, TypeLogs } = require('./logs');

const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
const GOOGLE_PRIVATE_KEY= process.env.GOOGLE_PRIVATE_KEY
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL
const GOOGLE_PROJECT_NUMBER = process.env.GOOGLE_PROJECT_NUMBER
const GOOGLE_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID
const BOT_REMINDER_TIME = ["1hr", "6hr", "18", "08-18"].indexOf(process.env.BOT_REMINDER_TIME)

const auth = new google.auth.JWT(
	GOOGLE_CLIENT_EMAIL,
	null,
	GOOGLE_PRIVATE_KEY,
	SCOPES
);
  
const calendar = google.calendar({
	version: 'v3',
	project_number: GOOGLE_PROJECT_NUMBER,
	auth
});


async function listEvents() {
	const timeMin = new Date()
	const timeMax = new Date(timeMin.getTime() + 14*24*60*60*1000);
	
	const res = await calendar.events.list({
		calendarId: GOOGLE_CALENDAR_ID,
		timeMin: timeMin,
		timeMax: timeMax,
		singleEvents: true,
		orderBy: 'startTime',
	});

	const events = res.data.items;
	if (!events || events.length === 0) {
		return [];
	}

	let array = [];
	events.map((event, i) => {
		if(event.start.dateTime === undefined) {
			sendLog(`Google api: skippend event with no start time (title: ${event.summary})`, TypeLogs.WARNING)
			return;
		}

		const event_obj = new Event(
			event.organizer.email,
			event.id,
			event.summary,
			event.description,
			event.location,
			event.start.dateTime,
			event.end.dateTime,
			event.htmlLink
		);		
		
		array.push(event_obj)
	});

	return array;
}

async function getEvents() {
	return new Promise((resolve, rejects) => {
		listEvents()
		.then((res) => {
			resolve(res)
			sendLog(`Google api: added ${res.length} events`, TypeLogs.INFO)
		})
		.catch((error) => {
			sendLog(`Google api: unable to fetch data (status code: ${error.status})`, TypeLogs.ERROR)
		});
	})
}

module.exports = { getEvents }