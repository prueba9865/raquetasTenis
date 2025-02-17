const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Esquema para el modelo de Usuario
const usuarioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    contrasena: {
        type: String,
        required: true
    }
});

// Middleware para encriptar la contraseña antes de guardarla
usuarioSchema.pre('save', function(next) {
    if (this.isModified('contrasena')) {
        bcrypt.hash(this.contrasena, 10, (err, hashedPassword) => {
            if (err) {
                return next(err);
            }
            this.contrasena = hashedPassword;
            next();
        });
    } else {
        next();
    }
});

// Método para verificar la contraseña al hacer login
usuarioSchema.methods.verificarContrasena = function(contrasena) {
    return bcrypt.compare(contrasena, this.contrasena);
};

// Creamos el modelo para Usuarios
const UsuarioModel = mongoose.model('Usuario', usuarioSchema, 'usuarios');

// Clase para manejar los usuarios
class Usuario {
    // Crear un nuevo usuario
    static crearUsuario(nombre, email, contrasena) {
        const nuevoUsuario = new UsuarioModel({ nombre, email, contrasena });
        return nuevoUsuario.save()
            .then(usuario => usuario)
            .catch(err => { throw err });
    }

    // Buscar un usuario por email
    static buscarPorEmail(email) {
        return UsuarioModel.findOne({ email })
            .then(usuario => usuario)
            .catch(err => { throw err });
    }
}

// Exportamos el modelo
module.exports = Usuario;