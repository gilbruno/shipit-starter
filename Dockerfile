# Dockerfile volontairement NAÏF (mono-étage) : on l'améliorera en séance 3.
FROM node:24
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
