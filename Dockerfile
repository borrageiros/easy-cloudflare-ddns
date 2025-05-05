FROM node:22
WORKDIR /app
COPY . .
RUN yarn
RUN yarn build
EXPOSE 5173
CMD ["yarn", "start"]