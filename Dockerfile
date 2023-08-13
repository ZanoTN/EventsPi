FROM node:18-alpine
RUN apk add --no-cache tzdata
WORKDIR /app
COPY ./package.json ./yarn.lock ./
RUN yarn install --prod
COPY ./index.js ./
COPY ./app/ ./app/
CMD [ "node", "index.js" ]
