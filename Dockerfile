FROM node:18-alpine

WORKDIR /myapp

COPY package*.json ./

RUN npm install


COPY . .

CMD ["npm", "start"]
