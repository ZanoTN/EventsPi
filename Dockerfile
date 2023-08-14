FROM node:alpine AS BUILD
ENV NODE_ENV=production
WORKDIR /app

# couchbase sdk requirements
RUN apk update && apk add yarn curl bash python3 g++ make && rm -rf /var/cache/apk/*

# install node-prune (https://github.com/tj/node-prune)
RUN curl -sf https://gobinaries.com/tj/node-prune | sh

COPY package.json yarn.lock ./

# install dependencies
RUN yarn --frozen-lockfile --production

COPY . .

# lint & test
# RUN yarn lint & yarn test

# build application
# RUN yarn build

# remove development dependencies
RUN npm prune --production

# run node prune
RUN /usr/local/bin/node-prune

# remove unused dependencies
# RUN rm -rf node_modules/rxjs/src/[name]

FROM node:18-alpine
ENV NODE_ENV=production
RUN apk add --no-cache tzdata

WORKDIR /app

# copy from build image
COPY  --from=BUILD /app/node_modules/ ./node_modules/
COPY  --from=BUILD /app/index.js ./
COPY  --from=BUILD /app/app/ ./app/

RUN ls

CMD [ "node", "index.js" ]