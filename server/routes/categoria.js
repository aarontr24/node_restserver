const express = require('express');

const _ = require('underscore');

const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

const Categoria = require('../models/categoria');

const app = express();


// ==================================
// Mostrar todas las categorias
// ==================================
app.get('/categoria', verificaToken, (req, res) => {
    //let desde = req.query.desde || 0;
    //desde = Number(desde);

    //let limite = req.query.limite || 5;
    //limite = Number(limite);

    Categoria.find({}, 'descripcion usuario')
        //.skip(desde)
        //.limit(limite)
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Categoria.countDocuments({}, (err, conteo) => {
                res.json({
                    ok: true,
                    categorias,
                    cuantos: conteo
                });
            });

        });

});

// ==================================
// Mostrar una categoria por ID
// ==================================
app.get('/categoria/:id', (req, res) => {
    //Categoria.findById(....);
    let id = req.params.id;

    Categoria.findById(id, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no es correcto'
                }
            });
        }
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });

});

// ==================================
// Crear nueva categoria
// ==================================
app.post('/categoria', verificaToken, (req, res) => {
    // regresa la nueva categoria
    // req.usuario._id
    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        //usuarioDB.password = null;

        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });
});

// ==================================
// Actualizar categoria
// ==================================

app.put('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id;
    //let body = _.pick(req.body, ['descripcion']);
    let body = req.body;

    let descCategoria = {
        descripcion: body.descripcion
    };

    Categoria.findByIdAndUpdate(id, descCategoria, { new: true, runValidators: true }, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });

});

// ==================================
// Eliminar categoria
// ==================================

app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    // solo un administrador puede borrar categorias
    // Categoria.findByIdAndRemove
    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        };

        if (!categoriaBorrada) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'La categoria no existe'
                }
            });
        }

        res.json({
            ok: true,
            message: 'Categoria Borrada'
        });
    });
});

module.exports = app;