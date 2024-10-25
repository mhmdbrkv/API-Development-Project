# Use the official Node.js image as the base
FROM node:18

# Create and set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app files
COPY . .

# Compile TypeScript
RUN npm run build

# Expose the port the app runs on
EXPOSE 8080

# Start the app
CMD ["npm", "run", "start"]
