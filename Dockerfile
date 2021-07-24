FROM node:alpine

COPY *.js* /app/
COPY ./src /app/src/

WORKDIR /app

RUN npm install

CMD [ "npm", "start" ]

# HEALTHCHECK --interval=15s --timeout=15s --start-period=5s --retries=3 CMD [ "wget -O - localhost/healthcheck" ]