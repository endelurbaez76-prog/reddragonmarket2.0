const sql = require('mssql');

const config = {
    user: 'sa',
    password: '12345',
    server: 'localhost', 
    port: 1433,
    database: 'RedDragonMarket',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

let pool; 

async function connectDB() {
    try {
        if (!pool) {
            pool = await sql.connect(config);
            console.log("Conectado a la base de datos");
        }
        return pool; 
    } catch (err) {
        console.error("Error de conexión:", err);
        throw err; 
    }
}

module.exports = { sql, connectDB };
