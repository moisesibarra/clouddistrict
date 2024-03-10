# Cloud District

## Descripción

Este proyecto es una API REST desarrollada utilizando NestJS, diseñada para gestionar clubes, jugadores y entrenadores. Soporta operaciones como crear, actualizar y eliminar entidades, además de gestionar presupuestos y listar entidades con filtros y paginación. Utiliza MySQL para la persistencia de datos y se puede contenerizar fácilmente usando Docker para el desarrollo y despliegue.

## Características

- Operaciones CRUD para clubes, jugadores y entrenadores.
- Gestión de presupuestos para los clubes.
- Filtrado y paginación para la lista de entidades.
- Entorno dockerizado para una configuración y despliegue fáciles.
- Integración con base de datos MySQL.

## Prerrequisitos

Antes de comenzar, asegúrate de cumplir con los siguientes requisitos:
- Docker y Docker Compose instalados en tu máquina.
- Node.js (versión especificada en el `Dockerfile`, por ejemplo, 20) si planeas ejecutar el proyecto fuera de Docker por alguna razón.

## Instalación y Ejecución del Proyecto

Para configurar y ejecutar el proyecto, sigue estos pasos:

1. **Clonar el repositorio:**

```
git clone https://github.com/moisesibarra/clouddistrict
cd clouddistrict
```
2. **Configuración del Entorno:**

Crea un archivo .env en la raíz del proyecto con el siguiente contenido, ajustando los valores de acuerdo a tu entorno. Para ejecutar el entorno en docker, esos son los valores por defecto:

```
# Application configuration
PORT=3000
# DB configuration
DB_TYPE=mysql
DB_HOST=mysql
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=cloud_district
```

Si quieres configurar un servidor SMTP para el envío de notificaciones también puedes aquí:
```
# SMTP configuration 

MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=
MAIL_PASS=
MAIL_FROM=email@example.com

```

3. **Configuración de Docker:**

Para construir e iniciar los contenedores, ejecuta:

```
docker-compose up --build
```
Este comando construye los contenedores de la aplicación y MySQL, establece la red y inicia los servicios según se define en docker-compose.yml. Además iniciará un dump de la base de datos en mysql, y al iniciarse la aplicación, la propia configuración del entorno de desarrollo configurará la base de datos. 

## Uso sin Docker: 

Para iniciar el proyecto desde la máquina ejecuta `npm install ` para instalar las dependencias.

A continuación crea un servidor de Mysql y configura las variables de entorno en el `.env` para conectar con ese servidor. 

Para lanzar el proyecto en modo desarrollo (con watch) usa `npm run start:dev`

Para correr todos los tests unitarios usa `npm run test`

## Acceder a la Aplicación:
Una vez que los contenedores estén en funcionamiento, puedes acceder a la API a través de ``http://localhost:3000``.

# Documentación de la API

La API permite gestionar clubes, jugadores y entrenadores, incluyendo operaciones como la creación, asociación, actualización y eliminación de estos recursos.

## Clubes

### Dar de alta un nuevo club

- **Endpoint:** `POST /clubs`
- **Body:**
  - `name`: Nombre del club. (Obligatorio)
  - `budget`: Presupuesto inicial del club. (Obligatorio)

### Actualizar el presupuesto de un club

- **Endpoint:** `PATCH /clubs/{clubId}`
- **Body:**
  - `budget`: Nuevo presupuesto del club. (Obligatorio)

### Dar de alta un jugador en un club

- **Endpoint:** `POST /clubs/{clubId}/players`
- **Body:**
  - `id`: ID del jugador. (opcional, si no se incluye, se entenderá que es un jugador nuevo)
  - `name`: Nombre del jugador. (Obligatorio)
  - `surname`: Apellido del jugador. (Obligatorio)
  - `email`: Email del jugador. (Obligatorio)
  - `salary`: Salario asignado al jugador dentro del club. (Obligatorio)
  Si se envía id, y el jugador puede darse de alta en el club, se dará de alta sin tener en cuenta el resto de parámetros. 

### Dar de baja a un jugador de un club

- **Endpoint:** `DELETE /clubs/{clubId}/players/{playerId}`
- **Nota:** No requiere body. La acción se especifica en la URL.

### Listar jugadores de un club

- **Endpoint:** `GET /clubs/{clubId}/players`
- **Parámetros de Query (opcionales):**
  - `searchTerm`: Filtrar jugadores por nombre.
  - `offset`: Número de página para paginación.
  - `limit`: Tamaño de página para paginación.

### Dar de alta un entrenador en un club

- **Endpoint:** `POST /clubs/{clubId}/coaches`
- **Body:**
  - `id`: ID del entrenador. (opcional si el entrenador ya existe)
  - `name`: Nombre del entrenador. (Obligatorio)
  - `surname`: Apellido del entrenador. (Obligatorio)
  - `email`: Email del entrenador. (Obligatorio)
  - `salary`: Salario asignado al entrenador dentro del club. (Obligatorio)
  Si se envía id, y el entrenador puede darse de alta en el club, se dará de alta sin tener en cuenta el resto de parámetros. 

### Dar de baja a un entrenador de un club

- **Endpoint:** `DELETE /clubs/{clubId}/coaches/{coachId}`
- **Nota:** No requiere body. La acción se especifica en la URL.


## Jugadores

### Dar de alta a un nuevo jugador sin club

- **Endpoint:** `POST /players`
- **Body:**
  - `name`: Nombre del jugador. (Obligatorio)
  - `surname`: Apellido del jugador. (Obligatorio)
  - `email`: Email del jugador. (Obligatorio)
  - `salary`: Salario asignado al jugador dentro del club. (Obligatorio)

## Entrenadores

### Dar de alta a un nuevo entrenador sin club

- **Endpoint:** `POST /coaches`
- **Body:**
  - `name`: Nombre del entrenador. (Obligatorio)
  - `surname`: Apellido del entrenador. (Obligatorio)
  - `email`: Email del entrenador. (Obligatorio)
  - `salary`: Salario asignado al entrenador dentro del club. (Obligatorio)

(En la raíz del proyecto se puede encontrar una colección de Postman, bajo el nombre de `clouddistrict.postman_collection.json`)

# Decisiones de diseño 

Las tecnologías que acompañan a Nest.js para implementar las funcionalidades (TypeORM como ORM, NodeMailer como Mailer, Event Emitter para el patrón observer,... ) han sido seleccionadas en base al soporte y comunidad que tienen detrás, tratando siempre de implementar tecnologías muy testadas y escalables. 

Respecto a la arquitectura del proyecto, está basada en DDD. Las propias buenas prácticas de modularización de componentes de Nest.js invitan a estructurar el proyecto teniendo el cuenta el vertical slicing. No obstante, dada la simpleza del mismo, actualmente no se ha considerado necesario dividir en diferentes carpetas las tres capas de dominio, aplicación, e infraestructura; ya que hay pocos archivos, estructurados de misma forma y con nombres muy descriptivos. Dadas las operaciones tán básicas, incluso ha resultado innecesario implementar repositorios para las entidades, y se ha podido hacer uso de los repositorios por defecto de TypeORM. No obstante podría ser una mejora de cara a un hipotético escalado de la aplicación. 

En el diseño de la API se han priorizado las normas REST, para legibilidad de los endpoints. Es por eso que el alta de los jugadores y los entrenadores, así como la paginación de jugadores, pertenecen a la entidad de club. Esto podría entenderse como una ruptura de responsabilidades que complica la mantenibilidad de las lógicas de negocio, pero en este caso la decisión ha sido priorizar la coherencia de los endpoints, y a su vez, la coherencia de la estructura de código con la implementación de los endpoints. 

Las entidades jugador y entrenador, tal y como han sido definidas, podrían ser dos tipos diferentes de una misma entidad, y eso habría supuesto mucha menos repetición de código. Pero se han mantenido como dos entidades diferentes pensando en una hipotética escalabilidad, donde ambos conceptos en un futuro llegaran a ser lo suficientemente diferentes como para no caber dicha abstracción. 

Entre las posibles mejoras del proyecto cabe destacar: 

    - **Implementar Bull para un sistema de colas al enviar los correos**

    - **Implementar tests de integración que complementen la estructura de tests unitarios actual**

    - **Implementar logs del sistema con una solución de monitoreo de terceros**