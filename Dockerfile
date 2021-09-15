FROM node:15.13.0-buster


WORKDIR /app
RUN npm i --g  ganache-cli truffle
