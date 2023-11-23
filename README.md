# EventsPi

> Actual the project is in beta version, when go out of this stage the package will be upload in Docker Hub and will be add a version list.

![GitHub](https://img.shields.io/github/license/ZanoTN/EventsPi?style=flat-square&color=5ba839)
![GitHub Workflow Status (with event)](https://img.shields.io/github/actions/workflow/status/ZanoTN/EventsPi/publish-ghcr.yaml?style=flat-square&color=5ba839)

EventsPi is a script that allows you to send google calendar event reminders on a telegram chat.

## ToDo
- [ ] Add multiple calendar and telegram chat

## Installation
### Docker (compose)
```linux/amd64``` ```linux/arm/v7``` ```linux/arm64```

1. Create file or copy from repository: docker-compose.yml
```yaml
version: '3'

services:
  bot:
    image: ghcr.io/zanotn/events-pi:latest
    restart: unless-stopped
    volumes:
      - db-data:/app/db-data
    environment:
      # Telegram configs:
      # See for more info: https://core.telegram.org/bots#how-do-i-create-a-bot
      # Token of telegram bot
      TELEGRAM_BOT_TOKEN:         
      # Chat id to send reminders
      # Can skip this field at start, go on target chat (with bot) run "/id" and recrate the container with this field
      TELEGRAM_CHAT_ID:

      # Google caledar configs:
      # See for more info: https://support.google.com/a/answer/7378726?hl=en
      GOOGLE_PRIVATE_KEY: # "-----BEGIN PRIVATE KEY-----\n ... \n-----END PRIVATE KEY-----\n"
      GOOGLE_CLIENT_EMAIL:        
      GOOGLE_PROJECT_NUMBER:
      # Calendar id (if is the default put the email of account)      
      GOOGLE_CALENDAR_ID:

      # Bot settings:
      # 1hr: notification 1 hours before
      # 6hr: notification 6 hours before
      # 18: notification at 18:00 of the day before
      # 08-18: notification at 08:00 of the same day if the event start after 18:00 otherwise at 18:00 of the day before
      BOT_REMINDER_TIME: "1hr|6hr|18|08-18"
      # Send an extra message at 14:00 of sunday with all events of the next week (yes|no)
      BOT_WEEKLY_REMINDER: yes
      # Set local time zone, See: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
      TZ:

volumes:
  db-data:
```
2. Run in same directory of docker-compose.yml: ```docker compose up -d``` or ```docker-compose up -d```

#### Update (manual)
1. Update local image: ```docker-compose pull```
2. Reload container: ```docker-compose up -d```

### PM2
Official site: [pm2.keymetrics.io](https://pm2.keymetrics.io/)
1. Clone the repository: ```git clone https://github.com/ZanoTN/EventsPi.git```
2. Enter in folder: ```cd EventsPi```
3. Install pm2: ```npm install pm2 -g``` or ```yarn global add pm2```
4. Install node module: ```yarn install```
5. Complete ".env" file from ".env.example"
6. Start pm2: ```pm2 start index.js --name "EventsPi"```

### Manual
Not recommended for production, use only for test or developing.
1. Clone the repository: ```git clone https://github.com/ZanoTN/EventsPi.git```
2. Enter in folder: ```cd EventsPi```
3. Install node module: ```yarn install```
4. Complete ".env" file from ".env.example"
5. Run: ```node index.js```
