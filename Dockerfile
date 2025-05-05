FROM node:22
WORKDIR /app
COPY . .
RUN yarn
EXPOSE 5173
CMD ["yarn", "start"]