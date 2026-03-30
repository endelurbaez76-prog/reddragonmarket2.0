
const express = require('express');
const path = require('path');
const session = require('express-session');
const { connectDB } = require('./db');

const app = express();
const PORT = 3000;

// =======================
// SESIONES
// =======================
app.use(session({
    secret: 'miSecreto123',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 } // 1 hora
}));

// =======================
// MIDDLEWARE
// =======================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// =======================
// VISTAS
// =======================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// =======================
// MIDDLEWARE PARA RUTAS PRIVADAS
// =======================
function authMiddleware(req, res, next) {
    if (req.session && req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

// =======================
// LOGIN
// =======================
app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const pool = await connectDB();
        const result = await pool.request()
            .input('username', username)
            .input('password', password)
            .query('SELECT * FROM Usuarios WHERE username=@username AND password=@password');

        if (result.recordset.length > 0) {
            req.session.user = username;
            res.redirect('/');
        } else {
            res.render('login', { error: 'Usuario o contraseña incorrectos' });
        }
    } catch (err) {
        console.error(err);
        res.send("Error al iniciar sesión");
    }
});

// =======================
// REGISTRO
// =======================
app.get('/registro', (req, res) => {
    res.render('registro', { error: null });
});

app.post('/registro', async (req, res) => {
    const { username, password } = req.body;

    try {
        const pool = await connectDB();
        await pool.request()
            .input('username', username)
            .input('password', password)
            .query('INSERT INTO Usuarios (username, password) VALUES (@username, @password)');
        res.redirect('/login');
    } catch (err) {
        console.error(err);
        res.render('registro', { error: 'Error al registrar usuario' });
    }
});

// =======================
// LOGOUT
// =======================
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) console.error(err);
        res.redirect('/login');
    });
});

// =======================
// DASHBOARD - LISTAR PRODUCTOS
// =======================
app.get('/', authMiddleware, async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query('SELECT * FROM Productos');
        res.render('index', { productos: result.recordset });
    } catch (err) {
        console.error(err);
        res.send("Error al cargar productos");
    }
});

// =======================
// AGREGAR PRODUCTO
// =======================
app.get('/producto/nuevo', authMiddleware, (req, res) => {
    res.render('crear');
});

app.post('/producto/nuevo', authMiddleware, async (req, res) => {
    try {
        const { nombre, precio, cantidad } = req.body;
        const pool = await connectDB();
        await pool.request()
            .input('nombre', nombre)
            .input('precio', precio)
            .input('cantidad', cantidad)
            .query('INSERT INTO Productos (nombre, precio, cantidad) VALUES (@nombre, @precio, @cantidad)');
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.send("Error al agregar producto");
    }
});

// =======================
// EDITAR PRODUCTO
// =======================
app.get('/producto/editar/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await connectDB();
        const result = await pool.request()
            .input('id', id)
            .query('SELECT * FROM Productos WHERE id=@id');

        res.render('actualizar', { producto: result.recordset[0] });
    } catch (err) {
        console.error(err);
        res.send("Error al cargar producto");
    }
});

app.post('/producto/editar/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, precio, cantidad } = req.body;
        const pool = await connectDB();
        await pool.request()
            .input('id', id)
            .input('nombre', nombre)
            .input('precio', precio)
            .input('cantidad', cantidad)
            .query('UPDATE Productos SET nombre=@nombre, precio=@precio, cantidad=@cantidad WHERE id=@id');

        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.send("Error al actualizar producto");
    }
});

// =======================
// ELIMINAR PRODUCTO
// =======================
app.get('/producto/eliminar/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await connectDB();
        await pool.request()
            .input('id', id)
            .query('DELETE FROM Productos WHERE id=@id');

        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.send("Error al eliminar producto");
    }
});

// =======================
// INICIAR SERVIDOR
// =======================
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});// cambio registro
