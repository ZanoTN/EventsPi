process.env.NTBA_FIX_319 = 1;
process.env.NTBA_FIX_350 = 1;

require('dotenv').config()

const TelegramBot = require('node-telegram-bot-api');
const GoogleCalendarApi = require('./app/googleCalendarDownload');


init()

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {polling: true});
const chat_id_reminders = process.env.TELEGRAM_CHAT_ID
const BOT_WEEKLY_REMINDER = (typeof process.env.BOT_WEEKLY_REMINDER === "string" && process.env.BOT_WEEKLY_REMINDER.toLowerCase() === "true");

console.log("Start loop...")
loop();



bot.on('message', async (msg) => {
	const text = msg.text;
	
	switch (text) {
		case "/id":
			bot.sendMessage(msg.chat.id, msg.chat.id);
			break;
		default:
			break;
	}
});

function UpdateFromGoogleCalendar() {
	console.log(new Date()+":");
	console.time("-> Update from Google Calendar")
	return new Promise((resolve, reject) => {	
		const promise = GoogleCalendarApi.getEvents()
		promise.then((data) => {
			resolve(data);
			console.timeEnd("-> Update from Google Calendar");
			console.log(`-> Events find: ${data.length}`)
		})
	})
}


async function checkEventForTelegram(eventList) {
	console.time("-> Check if there is an event to send")
	const now = new Date();
	now.setSeconds(0);
	now.setMilliseconds(0);
	const rangeStart = now.getTime();
	
	now.setSeconds(59);
	now.setMilliseconds(999);
	const rangeStop = now.getTime();
	
	for(let i=0;i<eventList.length;i++) { // not used map for send message in correct order
		const event = eventList[i];

		const now = new Date();
		const allertTime = new Date(event.allertDate);

		if(allertTime.getTime()>=rangeStart && allertTime.getTime()<=rangeStop) {
			await sendEventReminderMessageTelegram(event);
		}
	}
	console.timeEnd("-> Check if there is an event to send")
}

function sendEventReminderMessageTelegram(event) {
	return new Promise(async (resolve, reject) => {
		let text = "";
		text+="📢  "+titleToString(event);
		text+="🕐  "+dateTimeToString(event);
		text+="📍  "+locationToString(event)
		text+=descriptionToString(event);

		const opts = {parse_mode : "HTML","disable_web_page_preview": 1}
		bot.sendMessage(chat_id_reminders, text, opts)
		.then((data) => {
			resolve(data);
		})
	})
}

function SendReminderForAllWeek(eventList) {
	const now = new Date();
	const week_start_date = new Date();
	const week_end_date = new Date();

	week_start_date.setDate(now.getDate() + 1);
	week_end_date.setDate(now.getDate() + 8);
	resetDayAtStart(week_start_date);
	resetDayAtStart(week_end_date);

	let eventOfTheWeek = [];
	
	eventList.map((event, i) => {
		const start_date = new Date(event.start);
		
		if(week_start_date.getTime()<=start_date.getTime() && start_date.getTime()<week_end_date.getTime()) {
			eventOfTheWeek.push(event);
		}
	});
	
	if(eventOfTheWeek.length != 0) {
		const opts = {parse_mode : "HTML","disable_web_page_preview": 1}
		bot.sendMessage(chat_id_reminders, textAllWeekReminder(eventOfTheWeek), opts)		
	}
}

function textAllWeekReminder(eventOfTheWeek) {
	let toReturn = "📆  <b>EVENTS THIS WEEK</b>\n\n➖➖➖➖➖➖➖➖➖➖\n"
	
	eventOfTheWeek.forEach(event => {
		toReturn+="📢  "+titleToString(event);
		toReturn+="🕐  "+dateTimeToString(event);
		toReturn+="📍  "+locationToString(event);
		toReturn+=descriptionToString(event);
		toReturn+="➖➖➖➖➖➖➖➖➖➖\n";
	});

	return toReturn;
}


function resetDayAtStart(date) {
	date.setHours(0)
	date.setMinutes(0)
	date.setSeconds(0)
	date.setMilliseconds(0)
}

function titleToString(event) {
	return `<b>${event.summary.toUpperCase()}</b>\n`
}

function dateTimeToString(event) {
	let different_date = false;
	const start_date_time = new Date(event.start);
	const end_date_time = new Date(event.end);

	// Date
	if(!(start_date_time.getDate() == end_date_time.getDate() &&
		start_date_time.getMonth() == end_date_time.getMonth() &&
		start_date_time.getFullYear() == end_date_time.getFullYear()
	)) {
		different_date = true;
	}

	const start_date_str = (start_date_time.getDate()<10?'0':'') + start_date_time.getDate()+"/"+
		(start_date_time.getMonth()+1<10?'0':'') + (start_date_time.getMonth()+1);
	
	let end_date_str = null;

	if(different_date) {
		end_date_str = (end_date_time.getDate()<10?'0':'') + end_date_time.getDate()+"/"+
			(end_date_time.getMonth()+1<10?'0':'') + (end_date_time.getMonth()+1);
	}else{
		end_date_str = start_date_str;
	}


	// Time
	const start_time_str = (start_date_time.getHours()<10?'0':'') + start_date_time.getHours()+":"+
		(start_date_time.getMinutes()<10?'0':'') + start_date_time.getMinutes();
	const end_time_str = (end_date_time.getHours()<10?'0':'') + end_date_time.getHours()+":"+
		(end_date_time.getMinutes()<10?'0':'') + end_date_time.getMinutes();

	// To string
	let toReturn = "";
	
	if(different_date) {
		toReturn+= `<i>${start_date_str} ${start_time_str} - ${end_date_str} ${end_time_str}</i>`;
	} else {
		toReturn+= `<i>${start_date_str}  ${start_time_str} - ${end_time_str}</i>`;
	}
	toReturn+=`\n`;

	return toReturn;
}

function locationToString(event) {
	if(event.location === undefined) {
		return "-\n";
	} 

	if(event.location === "") {
		return "-\n";
	}

	let toReturn = ""
	const location_split = event.location.split(", ");
	if(location_split.length>1) {
		toReturn = `<a href='https://www.google.com/maps?q=${event.location}'>${location_split[0]}</a>\n`;
	} else {
		toReturn = location_split[0];
	}

	return toReturn
}

function descriptionToString(event) {
	if(event.description === undefined) {
		return "";
	}

	if(event.description === "") {
		return "";
	} 

	return `\n${event.description}\n`;
}

async function init() {
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
	if(process.env.BOT_REMINDER_TIME !== "google_calendar" && process.env.BOT_REMINDER_TIME !== "custom") {
		errors_list.push("BOT_REMINDER_TIME: unvalid")
	}
	if(!process.env.BOT_WEEKLY_REMINDER) {
		errors_list.push("BOT_WEEKLY_REMINDER: unset")
	}
	if(process.env.BOT_WEEKLY_REMINDER !== "false" && process.env.BOT_WEEKLY_REMINDER !== "true") {
		errors_list.push("BOT_REMINDER_TIME: not boolean")
	}


	console.log(`Errors [${errors_list.length}]:`)
	errors_list.forEach(item => {
		console.log(`- ${item}`)
	})
	console.log(`Warnings [${warnings_list.length}]:`)
	warnings_list.forEach(item => {
		console.log(`- ${item}`)
	})

}

async function loop() {
	let lastMinutes = new Date().getMinutes() - 1
	let eventList = []

	UpdateFromGoogleCalendar()
	.then((data) => {
		eventList = data;
	})

	setInterval(() => {
		const now = new Date

		if(now.getMinutes() != lastMinutes) {

			// Download google calendare
			if(now.getMinutes() % 30 === 0 && now.getSeconds() === 0) {
				UpdateFromGoogleCalendar()
				.then((data) => {
					eventList = data;
				})
			}

			// See if is sunday at 14:00
			if(BOT_WEEKLY_REMINDER) {
				if(now.getDay() === 0 && now.getHours() === 14 && now.getMinutes() === 0) {
					SendReminderForAllWeek(eventList)
				}
			}

			// See if there is message to send
			checkEventForTelegram(eventList)

			lastMinutes = now.getMinutes()
		}
	}, 1000)
}

