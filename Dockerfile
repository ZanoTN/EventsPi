FROM node:18-alpine AS BUILD
ENV NODE_ENV=production

# couchbase sdk requirements
RUN apk update && apk add yarn curl bash python3 g++ make && rm -rf /var/cache/apk/*

WORKDIR /home/node/app


# install node-prune (https://github.com/tj/node-prune)
# RUN curl -sf https://gobinaries.com/tj/node-prune | sh

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
#RUN /usr/local/bin/node-prune

# remove unused dependencies
# RUN rm -rf node_modules/rxjs/src/[name]

FROM node:18-alpine AS RUN
ENV NODE_ENV=production
RUN apk add --no-cache tzdata

USER node
WORKDIR /home/node/app
RUN mkdir ./database

# copy from build image
COPY  --from=BUILD /home/node/app/node_modules/ ./node_modules/
COPY  --from=BUILD /home/node/app/index.js ./
COPY  --from=BUILD /home/node/app/app/ ./app/

CMD [ "node", "index.js" ]