FROM node:12

# Setup dependencies on container
WORKDIR /opt/robotnik
COPY package*.json ./

RUN npm install

# Copy the code
COPY . .

# Run the bot
CMD [ "node", "app.js"]