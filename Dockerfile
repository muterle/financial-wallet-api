FROM node:latest

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . /usr/src/app

EXPOSE 3001

#CMD ["npm", "run", "start:prod"]
CMD npm run start:dev