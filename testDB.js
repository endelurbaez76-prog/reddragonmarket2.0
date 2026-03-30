
const sql = require('mssql');
const { connectDB } = require('./db'); // asegúrate de que connectDB apunta a tu config

async function testDB() {
    try {
        const pool = await connectDB();
        console.log("Conexión exitosa a la base de datos.");

        // ---------------------------
        // INSERT de prueba
        // ---------------------------
        const insertResult = await pool.request()
            .input('nombre', 'Producto Test')
            .input('precio', 123.45)
            .input('cantidad', 10)
            .query(`
                INSERT INTO Productos (nombre, precio, cantidad)
                VALUES (@nombre, @precio, @cantidad)
            `);
        console.log("Insert ejecutado correctamente.");

        // ---------------------------
        // SELECT de prueba
        // ---------------------------
        const selectResult = await pool.request()
            .query(`SELECT TOP 1 * FROM Productos ORDER BY id DESC`);
        console.log("Último producto insertado:", selectResult.recordset[0]);

        // ---------------------------
        // UPDATE de prueba
        // ---------------------------
        const id = selectResult.recordset[0].id;
        await pool.request()
            .input('id', id)
            .input('nombre', 'Producto Test Editado')
            .input('precio', 999.99)
            .input('cantidad', 5)
            .query(`
                UPDATE Productos
                SET nombre = @nombre,
                    precio = @precio,
                    cantidad = @cantidad
                WHERE id = @id
            `);
        console.log(`Producto con id ${id} actualizado correctamente.`);

    } catch (err) {
        console.error("Error en la prueba de base de datos:", err);
    } finally {
        sql.close();
    }
}

testDB();