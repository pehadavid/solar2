FROM node:12-alpine as buildContainer
WORKDIR /app
COPY . /app
RUN npm install
RUN npm run build:ssr
# RUN npm run generate:prerender


FROM node:12-alpine

WORKDIR /app
# Copy dependency definitions
COPY --from=buildContainer /app/package.json /app

# Get all the code needed to run the app
COPY --from=buildContainer /app/dist /app/dist

# Expose the port the app runs in
EXPOSE 4000

# Serve the app
ENTRYPOINT ["node",  "dist/solar2/server/main.js"]
