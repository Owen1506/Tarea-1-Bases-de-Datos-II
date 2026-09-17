const express = require('express');
const { sql, conectarBD } = require('./db');
require('dotenv').config();

const app = express();

app.use(express.json());


// GET - Consultar todos los departamentos
app.get('/departments', async (req, res) => {
    try {
        const pool = await conectarBD();

        const result = await pool
            .request()
            .execute('HumanResources.sp_Department_SelectAll');

        res.json(result.recordset);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'Error al obtener los departamentos'
        });
    }
});


// POST - Insertar departamento
app.post('/departments', async (req, res) => {
    try {
        const { name, groupName } = req.body;

        const pool = await conectarBD();

        const result = await pool
            .request()
            .input('Name', sql.NVarChar(50), name)
            .input('GroupName', sql.NVarChar(50), groupName)
            .execute('HumanResources.sp_Department_Insert');

        res.status(201).json({
            message: 'Departamento creado correctamente',
            department: result.recordset[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'Error al crear el departamento'
        });
    }
});


// PUT - Actualizar departamento
app.put('/departments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, groupName } = req.body;

        const pool = await conectarBD();

        await pool
            .request()
            .input('DepartmentID', sql.SmallInt, id)
            .input('Name', sql.NVarChar(50), name)
            .input('GroupName', sql.NVarChar(50), groupName)
            .execute('HumanResources.sp_Department_Update');

        res.json({
            message: 'Departamento actualizado correctamente'
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'Error al actualizar el departamento'
        });
    }
});


// DELETE - Eliminar departamento
app.delete('/departments/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const pool = await conectarBD();

        await pool
            .request()
            .input('DepartmentID', sql.SmallInt, id)
            .execute('HumanResources.sp_Department_Delete');

        res.json({
            message: 'Departamento eliminado correctamente'
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'Error al eliminar el departamento'
        });
    }
});


// GET - Consulta con JOIN
app.get('/departments/employee-count', async (req, res) => {
    try {
        const pool = await conectarBD();

        const result = await pool
            .request()
            .execute('HumanResources.sp_Department_EmployeeCount');

        res.json(result.recordset);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'Error al consultar empleados por departamento'
        });
    }
});


app.listen(process.env.PORT || 3000, () => {
    console.log('API ejecutándose en http://localhost:3000');
});
