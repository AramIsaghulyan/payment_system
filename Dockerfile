# 1. Base Image
FROM node:lts-alpine

# 2. Set the working directory
WORKDIR /app

# 3. Copy *only* the package files first
COPY package.json ./

# 5. Now, run npm install.
RUN npm install --omit=dev

# 6. Copy the rest of your project files (like src/app.js)
COPY . .

# 7. Expose the port
EXPOSE 3000

# 8. Set the run command
CMD ["node", "src/app.js"]