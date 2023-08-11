# EventsPi
EventsPi is a script that allows you to send google calendar event reminders on a telegram chat.

## ToDo
- [ ] Add multiple calendar and telegram chat
- [ ] Add different notification time:
  - [ ] 1 hours before
  - [ ] 6 hours before
  - [ ] At 18:00 of the day before
  - [ ] Google calendar setting (if possible)

## Installation
### Docker (compose)
1. Create file or copy from repository: docker-compose.yml
```yaml
version: '3'
services:
  bot:
    image: ghcr.io/zanotn/events-pi:latest
    restart: unless-stopped
    environment:
      # Telegram configs:
      # See for more info: https://core.telegram.org/bots#how-do-i-create-a-bot
      TELEGRAM_BOT_TOKEN:         # Token telegram
      # Can skip this field at start, go on target chat (with bot) run "/id" and then recrate the container with this field
      TELEGRAM_CHAT_ID:           # Chat id to send reminders

      # Google caledar configs:
      # See for more info: https://support.google.com/a/answer/7378726?hl=en
      GOOGLE_PRIVATE_KEY:         # "-----BEGIN PRIVATE KEY-----\n ... \n-----END PRIVATE KEY-----\n"
      GOOGLE_CLIENT_EMAIL:        # Client email
      GOOGLE_PROJECT_NUMBER:      # Number project
      GOOGLE_CALENDAR_ID:         # Calendar id (if is the default put the email of account)

      # Bot settings:
      BOT_REMINDER_TIME: notNow   # Leave that for now  
      BOT_WEEKLY_REMINDER: true   # Send an extra message at 14:00 of sunday with all events of the next week (true|false)
```
2. Run in same directory of docker-compose.yml: ```docker compose up -d``` or ```docker-compose up -d```

### Manual
Not recommended for production, use only for test or developing.
1. Clone the repository: ```git clone https://github.com/ZanoTN/EventsPi.git```
2. Enter in folder: ```cd EventsPi```
3. Install node module: ```yarn install```
4. Complete ".env" file
5. Run: ```node index.js```