"use strict"

module.exports = class Event{
	/**
	 * 
	 * @param {string} calendar_id 
	 * @param {string} event_id 
	 * @param {string} title 
	 * @param {string} description 
	 * @param {string} location 
	 * @param {string} start_time 
	 * @param {string} end_time 
	 * @param {string} html_link 
	 */

	
	constructor(calendar_id, event_id, title, description, location, start_time, end_time, html_link) {
		this.calendar_id = calendar_id;
		this.event_id = event_id;
		this.title = title;
		this.description = this.#cleanDescription(description);
		this.location = location;
		this.start_time = new Date(start_time);
		this.end_time = new Date(end_time);
		this.html_link = html_link;
		this.notification_time = this.#calculateNotificationTime();
	}

	#cleanDescription(description) {
		if(description) {
			description = description.replaceAll("<span>", "");
			description = description.replaceAll("</span>", "");
			description = description.replaceAll("<br>", "\n");
		}

		return description;
	}

	#calculateNotificationTime() {
		const BOT_REMINDER_TIME = ["1hr", "6hr", "18", "08-18"].indexOf(process.env.BOT_REMINDER_TIME);
		const eventStartDate = new Date(this.start_time);
		let alertDate;

		switch (BOT_REMINDER_TIME) {
			case 0:
				alertDate = this.#getAlertDateOneHoursBefore(eventStartDate);
				break;
			case 1:
				alertDate = this.#getAlertDateSixHoursBefore(eventStartDate);
				break;
			case 2:
				alertDate = this.#getAlertDate18DayBefore(eventStartDate);
				break;
			case 3:
				alertDate = this.#getAlertDate8or18DayBefore(eventStartDate);
				break;		
		}

		return alertDate
	}

	#getAlertDateOneHoursBefore(startDate) {
		return new Date(startDate.getTime() - 60*60*1000);
	}
	
	#getAlertDateSixHoursBefore(startDate) {
		return new Date(startDate.getTime() - 6*60*60*1000);
	}
	
	#getAlertDate18DayBefore(startDate) {
		const alertDate = startDate;
		alertDate.setDate(startDate.getDate() - 1);EventEvent
		alertDate.setHours(18);
		alertDate.setMinutes(0);
		alertDate.setSeconds(0);
		alertDate.setMilliseconds(0);
		return alertDate;
	}
	
	#getAlertDate8or18DayBefore(start_date_event) {
		let isBefore18 = false;
		const startDateEvent = new Date(start_date_event);
		const alertDate = new Date(start_date_event);
	
		if(startDateEvent.getHours()*60 + startDateEvent.getMinutes() < 18*60) {
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

	telegramFormat() {
		return(
			"📢 "+ this.#toStringTitle() +
			"🕐 "+ this.#toStringTime() +
			"📍 "+ this.#toStringLocation() +
			this.#toStringDescription()
		)
	}

	/**
	 * 
	 * @param {Event[]} events 
	 */
	static telegramFormatMultiEvents(events) {
		let textToReturn = "";

		events.map((event) => {
			textToReturn += event.telegramFormat() + '\n';
		})
	}

	telegramFormatNoDescription() {
		return(
			"📢 "+ this.#toStringTitle() +
			"🕐 "+ this.#toStringTime() +
			"📍 "+ this.#toStringLocation()
		)
	}

	telegramFormatNoDescriptionButWithLink() {
		return(
			this.telegramFormatNoDescription() +
			`<a href='${this.html_link}'>Link to event</a>\n`
		)
	}

	#toStringTitle() {
		return `<b>${this.title.toUpperCase()}</b>\n`
	}
	
	#toStringTime() {
		let different_date = false;
		const start_date_time = new Date(this.start_time);
		const end_date_time = new Date(this.end_time);
	
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

	#toStringLocation() {
		if(this.location === undefined || this.location === "") {
			return "-\n";
		}

	
		let toReturn = ""
		const location_split = this.location.split(", ");
		if(location_split.length>1) {
			toReturn = `<a href='https://www.google.com/maps?q=${this.location}'>${location_split[0]}</a>\n`;
		} else {
			toReturn = location_split[0];
		}
	
		return toReturn
	}

	#toStringDescription() {
		if(this.description === undefined || this.description === "") {
			return "";
		} 
	
		return `---\n${this.description}\n---\n`;
	}

	/**
	 * 	
	 * @param {Date} range_start 
	 * @param {number} minutes_delta 
	 */
	insideRangeNotificationTime(range_start, minutes_delta) {
		return (this.notification_time.getTime() >= range_start.getTime() && this.notification_time.getTime() < (range_start.getTime() + minutes_delta*60*1000))
	}

	/**
	 * 
	 * @param {Date} range_start 
	 * @param {number} minutes_delta 
	 */
	insideRangeStartTime(range_start, minutes_delta) {
		return (this.start_time.getTime() >= range_start.getTime() && this.start_time.getTime() < (range_start.getTime() + minutes_delta*60*1000))
	}
	/**
	 * 
	 * @param {Event[]} events 
	 */
	static groupForSameCalendarID(events) {
		let obj = {};

		events.sort((a, b) => {
			return a.notification_time.getTime() - b.notification_time.getTime();
		})

		events.map((event, index) => {
			if(!obj[event.calendar_id]) {
				obj[event.calendar_id] = [];
			}
			
			obj[event.calendar_id].push(event);
		})

		return obj;
	}
}