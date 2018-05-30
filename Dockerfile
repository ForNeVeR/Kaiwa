FROM node:9

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

ENV NODE_ENV development
RUN npm install

COPY config.json ./

COPY . .

RUN npm run webpack

EXPOSE 8000
CMD [ "npm", "start" ]
