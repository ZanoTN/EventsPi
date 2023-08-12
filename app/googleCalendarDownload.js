//const { token } = require('./config');
const { google } = require('googleapis');
require('dotenv').config()

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
			allertDate: getAlertDate(event.start.dateTime)
		})
	});

	return array;
}

function getAlertDate(start_date_event) {
	const eventStartDate = new Date(start_date_event)
	let alertDate

	switch (BOT_REMINDER_TIME) {
		case 0:
			alertDate = getAlertDateOneHoursBefore(eventStartDate)
			break;
		case 1:
			alertDate = getAlertDateSixHoursBefore(eventStartDate)
			break;
		case 2:
			alertDate = getAlertDate18DayBefore(eventStartDate)
			break;
		case 3:
			alertDate = getAlertDate8or18DayBefore(eventStartDate)
			break;		
	}

	return alertDate
}

function getAlertDateOneHoursBefore(startDate) {
	return new Date(startDate.getTime() - 60*60*1000)
}

function getAlertDateSixHoursBefore(startDate) {
	return new Date(startDate.getTime() - 6*60*60*1000)
}

function getAlertDate18DayBefore(startDate) {
	const alertDate = startDate
	alertDate.setDate(startDate.getDate() - 1)
	alertDate.setHours(18);
	alertDate.setMinutes(0);
	alertDate.setSeconds(0);
	alertDate.setMilliseconds(0);
	return alertDate
}

function getAlertDate8or18DayBefore(start_date_event) {
	let isBefore18 = false;
	const startDateEvent = new Date(start_date_event);
	const alertDate = new Date(start_date_event);

	if(startDateEvent.getHours()*60 + startDateEvent.getMinutes() <= 18*60) {
		isBefore18 = true;
	}

	if(isBefore18) {
		// Day before at 18:00
		alertDate.setDate(startDateEvent.getDate() - 1)
		alertDate.setHours(18);
	} else {
		// Same day at 08:00
		alertDate.setHours(8);
	}

	alertDate.setMinutes(0);
	alertDate.setSeconds(0);
	alertDate.setMilliseconds(0);

	return alertDate
}


async function getEvents() {
	return new Promise((resolve, rejects) => {
		listEvents()
		.then((res) => resolve(res))
		.catch(console.error);
	})
}

module.exports = { getEvents }