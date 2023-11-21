FROM --platform=linux/amd64 node:18-alpine AS build

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

WORKDIR /app

COPY . /app

RUN npm install

RUN npm run build

FROM pierrezemb/gostatic
CMD [ "-fallback", "index.html", "-enable-logging"]
COPY --from=build /app/dist /srv/http
