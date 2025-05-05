FROM node:22
WORKDIR /app
COPY . .
RUN yarn
RUN yarn build
EXPOSE 3000 5173
CMD ["yarn", "start"]