# FROM node:12.16.3
# WORKDIR app
# COPY package*.json ./
# RUN npm install
# COPY . .
# EXPOSE 8080
# CMD ["npm","start"]
FROM node:12.16.3

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY . .

RUN npm install
EXPOSE 8080

CMD node index.js