FROM node:14-alpine AS build-stage

WORKDIR /websnapse

COPY package.json ./

RUN npm install

COPY . .

ENV VITE_WS_API="ws://localhost:8000"

RUN npm run build

# production stage
FROM nginx AS production-stage

COPY --from=build-stage /websnapse/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]