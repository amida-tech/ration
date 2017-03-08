FROM node:boron

RUN mkdir /app
WORKDIR /app

COPY package.json ./
COPY .env.docker .env
RUN npm install

COPY . /app

EXPOSE 3000

CMD ["npm", "start"]
