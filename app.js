require('dotenv').config();
const Raqueta = require("./entities/Raquetas.js");
const Usuario = require("./entities/Usuarios.js");
const express = require('express');
const multer = require('multer');  // Para la subida de archivos
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const cookieParser = require('cookie-parser');
const port = 3000;
const fs = require('fs');
const path = require('path');
const methodOverride = require('method-override');
const session = require('express-session');

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

// Habilitar cookie-parser
app.use(cookieParser());

const uploadDirectory = path.join(__dirname, 'uploads');

// Verificar si el directorio existe, y si no, crearlo
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory);
}

app.use(methodOverride('_method'));  // Le indica al servidor que use _method en la URL


app.use(express.urlencoded({ extended: true }));  // Para parsear los datos de formularios

// Configura EJS como motor de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));
app.use(express.json());  // Para parsear el cuerpo de la solicitud como JSON

const verificarJWT = (req, res, next) => {
    // Acceder al token desde las cookies (en lugar de la cabecera Authorization)
    const token = req.cookies.jwt;  // Usamos 'jwt' porque ese es el nombre de la cookie donde guardamos el token
  
    if (!token) {
        return res.status(401).json({ message: "Acceso no autorizado, se requiere token" });
    }
  
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuarioId = decoded.id; // Agregar el id del usuario al request para usarlo más adelante
        next();
    } catch (err) {
        res.status(400).json({ message: "Token inválido" });
    }
  };
  

// Configuración de Multer para subida de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// ------------------------------
// CRUD Raquetas
// ------------------------------

// Ruta para cargar el formulario de creación de raqueta
app.get("/raquetas/nueva", verificarJWT, (req, res) => {
  res.render('raquetas/nueva');
});

app.get("/subir", verificarJWT, (req, res) => {
  res.render('subir');
});

app.get("/raquetas/edit/:id", verificarJWT, (req, res) => {
  Raqueta.buscarPorId(req.params.id)
      .then(raqueta => {
          res.render('raquetas/editar', { raqueta });
      })
      .catch(err => {
          res.status(500).json({ error: err.message });
      });
});


app.get("/raquetas", (req, res) => {
    Raqueta.buscarTodas()
        .then(raquetas => {
            const message = req.session.message; // Recuperar el mensaje de la sesión
            delete req.session.message; // Limpiar el mensaje de la sesión después de usarlo para evitar que persista

            res.render('raquetas/index', { 
                raquetas: raquetas, 
                message: message // Pasar el mensaje a la vista
            });
        })
        .catch(err => {
            res.status(500).json({ "error": err });
        });
});

// Obtener una raqueta por ID
app.get("/raquetas/:id", (req, res) => {
    Raqueta.buscarPorId(req.params.id)
        .then(raqueta => {
            if (raqueta) {
              res.render('raquetas/ver', { raqueta: raqueta });
            } else {
                res.status(404).json({ message: "Raqueta no encontrada" });
            }
        })
        .catch(err => res.status(500).json({ "error": err }));
});

// Crear una raqueta en el controlador
app.post("/raquetas", verificarJWT, (req, res) => {
  const { marca, precio, modelo, peso, material } = req.body;

  Raqueta.crearRaqueta(marca, precio, modelo, peso, material)
      .then(nuevaRaqueta => {
        req.session.message = 'Raqueta creada con exito';
        res.redirect("/raquetas")
          //res.status(201).json({ message: "Raqueta creada con éxito", raqueta: nuevaRaqueta });
      })
      .catch(err => {
          res.status(500).json({ error: "Error al crear la raqueta", details: err.message });
      });
});

// Actualizar una raqueta
app.put("/raquetas/:id", verificarJWT, (req, res) => {
  const { marca, precio, modelo, peso, material } = req.body;
  const idRaqueta = req.params.id;

  Raqueta.actualizarRaqueta(idRaqueta, marca, precio, modelo, peso, material)
      .then(() => {
        req.session.message = 'Raqueta editada con exito';
        res.redirect("/raquetas")
        //res.status(200).json({ message: "Raqueta actualizada con éxito" });
      })
      .catch(err => {
          res.status(500).json({ error: err.message });
      });
});

app.delete("/raquetas/:id", verificarJWT, (req, res) => {
  const idRaqueta = req.params.id;

  Raqueta.eliminarRaqueta(idRaqueta)
      .then(() => {
        req.session.message = 'Raqueta eliminada con exito';
        res.redirect("/raquetas")
        //res.status(200).json({ message: "Raqueta eliminada con éxito" });
      })
      .catch(err => {
          res.status(500).json({ error: err.message });
      });
});


// ------------------------------
// Rutas para Usuarios (Registro y Login)
// ------------------------------

// Registro de usuario
app.post("/registro", (req, res) => {
    const { nombre, email, contrasena } = req.body;
    Usuario.crearUsuario(nombre, email, contrasena)
        .then(usuario => {
            req.session.message = "Usuario registrado correctamente"
            res.redirect("/login")
            //res.status(201).json({ message: "Usuario registrado con éxito" });
        })
        .catch(err => res.status(500).json({ "error": err }));
});

// Ruta para cargar el formulario de creación de raqueta
app.get("/login", (req, res) => {
  res.render('login');
});

// Ruta para cargar el formulario de creación de raqueta
app.get("/registro", (req, res) => {
  res.render('registro');
});


// Ruta para el login con cookies httpOnly
app.post("/login", (req, res) => {
    const { email, contrasena } = req.body;
  
    Usuario.buscarPorEmail(email)
        .then(usuario => {
            if (!usuario) {
                return res.status(400).json({ message: "Usuario no encontrado" });
            }
  
            usuario.verificarContrasena(contrasena)
                .then(esValida => {
                    if (esValida) {
                        const token = jwt.sign(
                            { id: usuario._id, email: usuario.email },
                            process.env.JWT_SECRET,
                            { expiresIn: '1h' }
                        );
  
                        // Configurar cookie httpOnly con el token
                        res.cookie('jwt', token, {
                            httpOnly: true,  // La cookie no es accesible desde JavaScript
                            secure: process.env.NODE_ENV === 'production',  // Solo en producción usaremos cookies seguras (requiere HTTPS)
                            sameSite: 'Strict',  // Evita el envío de cookies en solicitudes cross-origin
                            maxAge: 3600000 // Duración de la cookie en milisegundos (1 hora en este caso)
                        });
  
                        // Responder con éxito
                        res.json({ message: "Login exitoso" });
  
                    } else {
                        res.status(400).json({ message: "Contraseña incorrecta" });
                    }
                })
                .catch(err => res.status(500).json({ "error": err }));
        })
        .catch(err => res.status(500).json({ "error": err }));
  });  

// ------------------------------
// Subida de archivos
// ------------------------------

// Subir un archivo
app.post("/subir", verificarJWT, upload.single('archivo'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No se ha subido ningún archivo" });
    }
    req.session.message = 'Imagen subida con exito';
    res.redirect("/raquetas")
    //res.json({ message: "Archivo subido con éxito", file: req.file });
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`App escuchando en el puerto ${port}`);
});