FROM node:20

WORKDIR /app

# Copiamos solo package.json para instalar dependencias
COPY package*.json ./
RUN npm install

# Montamos el código con volumen (esto se hace en docker-compose)
# COPY . .   <-- no necesario, el volumen lo monta en tiempo real

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
