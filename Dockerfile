FROM node:boron

RUN mkdir /app
WORKDIR /app

COPY package.json /app
COPY .env.docker /app/.env
RUN npm install

COPY . /app

EXPOSE 3000

CMD ["npm", "start"]
