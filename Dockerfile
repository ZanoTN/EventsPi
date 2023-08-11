FROM node:18-alpine
WORKDIR /app
COPY ./package.json ./yarn.lock ./
RUN yarn install --prod
COPY ./index.js ./
COPY ./app/ ./app/
CMD [ "node", "index.js" ]
