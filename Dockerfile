FROM node:20

WORKDIR /usr/src/app

COPY . .

RUN npm install -g yarn --force

RUN yarn
RUN cd interface && yarn

EXPOSE 3000

CMD ["yarn", "start"]