const sql = require('mssql');

const config = {
    user: 'sa',
    password: '12345',
    server: 'localhost',
    database: 'RedDragonMarket',
    options: {
        instanceName: 'SQLEXPRESS', 
        encrypt: false,
        trustServerCertificate: true
    }
};

sql.connect(config)
    .then(() => console.log("CONECTADO"))
    .catch(err => console.log("ERROR:", err.message));console.log('feature registro v3');
