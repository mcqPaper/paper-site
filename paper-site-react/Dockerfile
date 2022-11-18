
FROM node:16-alpine 

WORKDIR /app

COPY . .

RUN npm ci 

RUN npm run build

ENV HOST=0.0.0.0 PORT=8085

EXPOSE 8085

CMD [ "node", "server.js"]