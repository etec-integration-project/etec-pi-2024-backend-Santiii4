FROM node:18-slim

WORKDIR /myapp
COPY package.json .
RUN npm install

COPY . .
CMD npm start