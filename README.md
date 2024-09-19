Santiago Sanchez
--Iniciar el proyecto:
Paso 1:
Traer proyecto:
```
git clone https://github.com/etec-integration-project/etec-pi-2024-backend-Santiii4.git
```
```
cd etec-pi-2024-backend-Santiii4
```
Paso 2:
Levantar docker compose:
```
docker compose up --build
```
Paso 3:

Atravez del navegador ingresar a 
```
localhost:3000/ping
```
en la barra de busqueda.


--Enviar una peticion post de prueba:

Paso 1:
Iniciar el proyecto como se dijo anteriormente.

Paso 2:

Ingresar en la consola:

```
curl -X POST http://localhost:3000/users -H "Content-Type: application/json" -d '{"name": "Nombre del Usuario", "email": "email@example.com"}'

```

Paso 3:

Para verificar ingresar en la consola:

```
curl -X GET http://localhost:3000/users
```








