const mongoose = require('mongoose');

// Conexión a la base de datos
const password = process.env.PASSWORD;

mongoose.connect(`mongodb+srv://alberto:${password}@cluster0.bregh.mongodb.net/almacen`)
    .then(() => console.log('Conexión exitosa a la base de datos'))
    .catch(err => console.error('Error de conexión:', err));

// Esquema del documento para Raquetas de Tenis
const raquetaSchema = new mongoose.Schema({
    marca: String,
    precio: Number,
    modelo: String,
    peso: Number,
    material: String
});

// Creamos el modelo para Raquetas de Tenis
const RaquetaModel = mongoose.model('Raqueta', raquetaSchema, 'raquetas');

// Clase Raqueta
class Raqueta {
    // Buscar la primera raqueta
    static buscarPrimera() {
        RaquetaModel.findOne()
            .then(raqueta => {
                if (raqueta) {
                    console.log('Primera raqueta encontrada', raqueta);
                } else {
                    console.log('No se encontró ninguna raqueta');
                }
            })
            .catch(err => console.error('Error al obtener la raqueta', err));
    }

    // Buscar todas las raquetas
    static buscarTodas() {
        return RaquetaModel.find()
            .then(raquetas => {
                if (raquetas.length > 0) {
                    console.log('Raquetas encontradas', raquetas);
                    return raquetas;
                } else {
                    console.log('No se encontró ninguna raqueta');
                    return null;
                }
            })
            .catch(err => {
                console.error('Error al obtener las raquetas', err);
                throw err;
            });
    }

    // Buscar raqueta por ID
    static buscarPorId(id) {
        return RaquetaModel.findById(id)
            .then(raqueta => {
                if (raqueta) {
                    console.log('Raqueta encontrada', raqueta);
                    return raqueta;
                } else {
                    console.log('No se encontró ninguna raqueta con ese ID');
                }
            })
            .catch(err => {
                console.error('Error al obtener la raqueta', err);
                throw err;
            });
    }

    // Buscar por precio mayor a un valor
    static buscarPorPrecioMayorA(precio) {
        RaquetaModel.find({ precio: { $gt: precio } })
            .then(raquetas => {
                if (raquetas.length > 0) {
                    console.log('Raquetas encontradas con precio mayor a ' + precio, raquetas);
                } else {
                    console.log('No se encontró ninguna raqueta');
                }
            })
            .catch(err => console.error('Error al obtener las raquetas', err));
    }

    // Crear una nueva raqueta en el modelo
    static crearRaqueta(marca, precio, modelo, peso, material) {
        const nuevaRaqueta = new RaquetaModel({
            marca: marca,
            precio: precio,
            modelo: modelo,
            peso: peso,
            material: material
        });

        // Devuelve la promesa de guardar la raqueta
        return nuevaRaqueta.save()
            .then(raquetaGuardada => {
                console.log('Raqueta guardada:', raquetaGuardada);
                return raquetaGuardada;  // Devuelve la raqueta guardada
            })
            .catch(err => {
                console.error('Error al guardar la raqueta:', err);
                throw err;  // Lanza el error para que pueda ser manejado por el controlador
            });
    }


    // Actualizar una raqueta
    static actualizarRaqueta(id, marca, precio, modelo, peso, material) {
        return RaquetaModel.findByIdAndUpdate(id,
            {
                marca: marca,
                precio: precio,
                modelo: modelo,
                peso: peso,
                material: material
            },
            { new: true }) // Devuelve el documento actualizado
            .then(raquetaActualizada => {
                if (raquetaActualizada) {
                    console.log('Raqueta actualizada:', raquetaActualizada);
                    return raquetaActualizada; // Puedes devolver la raqueta actualizada si lo deseas
                } else {
                    throw new Error('No se encontró ninguna raqueta con ese ID');
                }
            })
            .catch(err => {
                console.error('Error al actualizar la raqueta:', err);
                throw err; // Lanza el error para que lo maneje el controlador
            });
    }


    static eliminarRaqueta(id) {
        return RaquetaModel.findByIdAndDelete(id)  // Devolver la promesa
            .then(raquetaEliminada => {
                if (raquetaEliminada) {
                    console.log('Raqueta eliminada:', raquetaEliminada);
                } else {
                    console.log('No se encontró ninguna raqueta con ese ID.');
                }
            })
            .catch(err => console.error('Error al eliminar la raqueta:', err));
    }    

    // Insertar varias raquetas
    static insertarVariasRaquetas() {
        const raquetas = [
            { marca: 'Wilson', precio: 180, modelo: 'Pro Staff', peso: 305, material: 'Grafito' },
            { marca: 'Babolat', precio: 220, modelo: 'Pure Drive', peso: 300, material: 'Fibra de carbono' }
        ];

        RaquetaModel.create(raquetas)
            .then(raquetasCreadas => {
                console.log('Raquetas creadas:', raquetasCreadas);
            })
            .catch(err => console.error('Error al crear las raquetas:', err));
    }
}

// Exporta el modelo y las funciones de la clase
module.exports = Raqueta;