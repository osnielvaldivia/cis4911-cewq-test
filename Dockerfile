# Base image
FROM node:12-slim as base
ENV NODE=ENV=production
EXPOSE 5000
WORKDIR /app
COPY package.json package-lock*.json ./
RUN npm install && npm cache clean --force

# Source
FROM base as source
COPY . .

# Will only build if tests pass
FROM source as test
ENV NODE_ENV=development
RUN npm install --only=development
RUN npm test
CMD ["npm", "run", "test"]

# Prod image
FROM source as prod
CMD ["npm", "start"]