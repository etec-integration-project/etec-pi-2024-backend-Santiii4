# Usar una imagen ligera de Node.js
FROM node:18-alpine

# Establecer el directorio de trabajo en el contenedor
WORKDIR /myapp

# Copiar solo los archivos de dependencias para optimizar la cacheabilidad
COPY package*.json ./

# Instalar dependencias en un paso separado
RUN npm install --production

# Copiar el resto del código fuente
COPY . .

# Exponer el puerto que la aplicación utiliza (opcional, pero útil para depuración)
EXPOSE 3000

# Comando por defecto para ejecutar la aplicación
CMD ["npm", "start"]

