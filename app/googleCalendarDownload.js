//const { token } = require('./config');
const { google } = require('googleapis');
require('dotenv').config()

const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
const GOOGLE_PRIVATE_KEY= process.env.GOOGLE_PRIVATE_KEY
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL
const GOOGLE_PROJECT_NUMBER = process.env.GOOGLE_PROJECT_NUMBER
const GOOGLE_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID
    
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
		console.log('No upcoming events found.');
		return [];
	}

	let array = [];
	events.map((event, i) => {

		if(event.start.dateTime === undefined) {
			return;
		}

		if(event.description) {
			event.description = event.description.replaceAll("<span>", "")
			event.description = event.description.replaceAll("</span>", "")
			event.description = event.description.replaceAll("<br>", "\n")
		} 

		array.push({
			id: event.id,
			start: new Date(event.start.dateTime),
			end: new Date(event.end.dateTime),
			summary: event.summary,
			description: event.description,
			location: event.location,
			allertDate: generateAllertDate(event.start.dateTime)
		})
	});

	return array;
}

function generateAllertDate(start_date_event) {
	let isBefore18 = false;
	const startDateEvent = new Date(start_date_event);
	const allertDate = new Date(start_date_event);

	if(startDateEvent.getHours()*60 + startDateEvent.getMinutes() <= 18*60) {
		isBefore18 = true;
	}

	if(isBefore18) {

		// Day before at 18:00
		allertDate.setDate(startDateEvent.getDate() - 1)
		allertDate.setHours(18);
	} else {

		// Same day at 12:00
		allertDate.setHours(12);
	}

	allertDate.setMinutes(0);
	allertDate.setSeconds(0);
	allertDate.setMilliseconds(0);

	return allertDate
}


async function getEvents() {
	return new Promise((resolve, rejects) => {
		listEvents()
		.then((res) => resolve(res))
		.catch(console.error);
	})
}

module.exports = { getEvents }