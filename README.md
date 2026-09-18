# Tarea 1 - API REST con SQL Server

## Introducción

El objetivo de esta tarea es implementar una arquitectura en la que la comunicación entre una aplicación y una base de datos se realice mediante una API REST.

Para el desarrollo se utilizó una máquina virtual con Ubuntu 22.04.5 LTS, SQL Server 2022, la base de datos AdventureWorks2022 y Node.js.

La API permite realizar operaciones CRUD sobre la tabla `HumanResources.Department` mediante procedimientos almacenados, además de realizar una consulta con `JOIN` para obtener la cantidad de empleados asociados a cada departamento.

---

## Tecnologías utilizadas

- Ubuntu 22.04.5 LTS
- SQL Server 2022 Developer Edition
- AdventureWorks2022
- Node.js 20
- Express
- mssql
- dotenv
- Git
- GitHub

---

# 1. Instalación de Ubuntu

Para el desarrollo se utilizó una máquina virtual creada con VirtualBox.

Configuración utilizada:

- Sistema operativo: Ubuntu 22.04.5 LTS
- Memoria RAM: 6 GB
- Procesadores: 4
- Disco virtual: 40 GB

Una vez instalado Ubuntu, se actualizó el sistema:

```bash
sudo apt update
sudo apt upgrade -y
```

---

# 2. Instalación de SQL Server 2022

Primero se instaló `curl`:

```bash
sudo apt install curl -y
```

Se agregó la clave de Microsoft:

```bash
curl -fsSL https://packages.microsoft.com/keys/microsoft.asc | sudo gpg --dearmor -o /usr/share/keyrings/microsoft-prod.gpg
```

Se agregó el repositorio de SQL Server 2022:

```bash
curl -fsSL https://packages.microsoft.com/config/ubuntu/22.04/mssql-server-2022.list | sudo tee /etc/apt/sources.list.d/mssql-server-2022.list
```

Se agregó también la clave de Microsoft a los repositorios confiables:

```bash
curl https://packages.microsoft.com/keys/microsoft.asc | sudo tee /etc/apt/trusted.gpg.d/microsoft.asc
```

Luego:

```bash
sudo apt update
sudo apt install -y mssql-server
```

Para configurar SQL Server:

```bash
sudo /opt/mssql/bin/mssql-conf setup
```

Se seleccionó:

- Edición: Developer
- Idioma: Español
- Usuario administrador: `sa`

Para comprobar el estado del servicio:

```bash
systemctl status mssql-server --no-pager
```

El servicio debe aparecer como:

```text
Active: active (running)
```

---

# 3. Instalación de las herramientas de SQL Server

Se agregó el repositorio:

```bash
curl https://packages.microsoft.com/config/ubuntu/22.04/prod.list | sudo tee /etc/apt/sources.list.d/mssql-release.list
```

Luego:

```bash
sudo apt update
sudo ACCEPT_EULA=Y apt install -y mssql-tools18 unixodbc-dev
```

Se agregó `sqlcmd` al PATH:

```bash
echo 'export PATH="$PATH:/opt/mssql-tools18/bin"' >> ~/.bashrc
source ~/.bashrc
```

Para comprobar la instalación:

```bash
sqlcmd -?
```

La conexión a SQL Server puede realizarse con:

```bash
sqlcmd -S localhost -U sa -C
```

---

# 4. Instalación de AdventureWorks2022

Se creó una carpeta para respaldos:

```bash
sudo mkdir -p /var/opt/mssql/backup
sudo chown mssql:mssql /var/opt/mssql/backup
```

Se descargó AdventureWorks2022:

```bash
sudo curl -L -o /var/opt/mssql/backup/AdventureWorks2022.bak \
https://github.com/Microsoft/sql-server-samples/releases/download/adventureworks/AdventureWorks2022.bak
```

Dentro de `sqlcmd` se verificaron los nombres lógicos del respaldo:

```sql
RESTORE FILELISTONLY
FROM DISK = '/var/opt/mssql/backup/AdventureWorks2022.bak';
GO
```

Posteriormente se restauró la base:

```sql
RESTORE DATABASE AdventureWorks2022
FROM DISK = '/var/opt/mssql/backup/AdventureWorks2022.bak'
WITH
    MOVE 'AdventureWorks2022'
        TO '/var/opt/mssql/data/AdventureWorks2022.mdf',
    MOVE 'AdventureWorks2022_log'
        TO '/var/opt/mssql/data/AdventureWorks2022_log.ldf',
    STATS = 5;
GO
```

Para comprobar su funcionamiento:

```sql
USE AdventureWorks2022;
GO

SELECT TOP 5
    BusinessEntityID,
    FirstName,
    LastName
FROM Person.Person;
GO
```

---

# 5. Procedimientos almacenados

Los procedimientos utilizados se encuentran en:

```text
Script sql/stored_procedures.sql
```

Se implementaron los siguientes:

| Procedimiento | Función |
|---|---|
| `sp_Department_Insert` | Insertar un departamento |
| `sp_Department_SelectAll` | Consultar departamentos |
| `sp_Department_Update` | Actualizar un departamento |
| `sp_Department_Delete` | Eliminar un departamento |
| `sp_Department_EmployeeCount` | Consultar departamentos y cantidad de empleados mediante JOIN |

Los procedimientos trabajan principalmente con:

```text
HumanResources.Department
```

La consulta con `JOIN` utiliza:

```text
HumanResources.Department
HumanResources.EmployeeDepartmentHistory
```

---

# 6. Instalación de Node.js

Se instaló Node.js 20:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x -o nodesource_setup.sh
sudo -E bash nodesource_setup.sh
sudo apt install -y nodejs
```

Para comprobar las versiones:

```bash
node -v
npm -v
```

---

# 7. Configuración del proyecto

El código de la API se encuentra en:

```text
codigo/
```

Para instalar las dependencias:

```bash
cd codigo
npm install
```

Las principales dependencias utilizadas son:

- `express`
- `mssql`
- `dotenv`

---

# 8. Variables de entorno

Por seguridad, el archivo `.env` no se encuentra almacenado en GitHub.

Debe crearse dentro de la carpeta `codigo`:

```bash
nano .env
```

Con la siguiente estructura:

```env
DB_USER=sa
DB_PASSWORD=CONTRASEÑA_SQL_SERVER
DB_SERVER=localhost
DB_DATABASE=AdventureWorks2022
DB_PORT=1433
PORT=3000
```

Se debe sustituir:

```text
CONTRASENA_SQL_SERVER
```

por la contraseña configurada para el usuario `sa`.

---

# 9. Ejecución de la API

Desde la carpeta `codigo`:

```bash
node server.js
```

Si la ejecución es correcta aparecerá:

```text
API ejecutándose en http://localhost:3000
Conectado a SQL Server
```

---

# 10. Servicios REST implementados

## Consultar departamentos

```http
GET /departments
```

Ejemplo:

```text
http://localhost:3000/departments
```

Este servicio ejecuta:

```text
HumanResources.sp_Department_SelectAll
```

---

## Insertar departamento

```http
POST /departments
```

Ejemplo de datos:

```json
{
    "name": "Tecnologia",
    "groupName": "Sistemas"
}
```

Prueba con `curl`:

```bash
curl -X POST http://localhost:3000/departments \
-H "Content-Type: application/json" \
-d '{"name":"Tecnologia","groupName":"Sistemas"}'
```

Este servicio ejecuta:

```text
HumanResources.sp_Department_Insert
```

---

## Actualizar departamento

```http
PUT /departments/:id
```

Ejemplo:

```bash
curl -X PUT http://localhost:3000/departments/18 \
-H "Content-Type: application/json" \
-d '{"name":"Tecnologia Actualizada","groupName":"Sistemas TI"}'
```

Este servicio ejecuta:

```text
HumanResources.sp_Department_Update
```

---

## Eliminar departamento

```http
DELETE /departments/:id
```

Ejemplo:

```bash
curl -X DELETE http://localhost:3000/departments/18
```

Este servicio ejecuta:

```text
HumanResources.sp_Department_Delete
```

---

## Consulta con JOIN

```http
GET /departments/employee-count
```

Ejemplo:

```text
http://localhost:3000/departments/employee-count
```

Este servicio ejecuta:

```text
HumanResources.sp_Department_EmployeeCount
```

La consulta relaciona los departamentos con el historial de asignaciones de empleados y retorna la cantidad de empleados actualmente asociados a cada departamento.

Ejemplo de respuesta:

```json
[
    {
        "DepartmentID": 1,
        "DepartmentName": "Engineering",
        "GroupName": "Research and Development",
        "EmployeeCount": 6
    },
    {
        "DepartmentID": 3,
        "DepartmentName": "Sales",
        "GroupName": "Sales and Marketing",
        "EmployeeCount": 18
    }
]
```

---

# 11. Correspondencia CRUD

| Operación | Método HTTP | Procedimiento |
|---|---|---|
| Create | POST | `sp_Department_Insert` |
| Read | GET | `sp_Department_SelectAll` |
| Update | PUT | `sp_Department_Update` |
| Delete | DELETE | `sp_Department_Delete` |

---

# 12. Datos de prueba

Para comprobar el funcionamiento del CRUD se utilizó el siguiente departamento:

```json
{
    "name": "Tecnologia",
    "groupName": "Sistemas"
}
```

Posteriormente se actualizó a:

```json
{
    "name": "Tecnologia Actualizada",
    "groupName": "Sistemas TI"
}
```

Finalmente el registro fue eliminado mediante el servicio `DELETE`.

Para verificar las consultas se utilizaron también los registros originales incluidos en AdventureWorks2022.



---

# 13. Estructura del proyecto

```text
Tarea-1-Bases-de-Datos-II/
│
├── codigo/
│   ├── db.js
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── Script sql/
│   └── stored_procedures.sql
│
├── .gitignore
└── README.md
```

Los archivos `.env` y `node_modules` son excluidos del repositorio mediante `.gitignore`.

---

# 14. Video de demostración

Enlace al video:

```text
https://www.youtube.com/watch?v=5S7F2jyMsb4
```

