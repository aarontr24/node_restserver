const express = require('express');

const { verificaToken } = require('../middlewares/autenticacion');

let app = express();
let Producto = require('../models/producto');

// =====================================
// Obtener productos
// =====================================

app.get('/producto', verificaToken, (req, res) => {
    // trae todos los productos
    // populate: usuario categoria
    // paginado
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 25;
    limite = Number(limite);

    Producto.find({ disponible: true }, 'nombre precioUni descripcion disponible categoria usuario')
        .skip(desde)
        .limit(limite)
        .sort('nombre')
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            Producto.countDocuments({ disponible: true }, (err, conteo) => {
                res.json({
                    ok: true,
                    productos,
                    cuantos: conteo
                });
            });

        });
});

// =====================================
// Obtener un producto por ID
// =====================================

app.get('/producto/:id', verificaToken, (req, res) => {
    // populate: usuario categoria
    // paginado
    let id = req.params.id;

    Producto.findById(id)
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'El ID no es correcto'
                    }
                });
            }
            res.json({
                ok: true,
                producto: productoDB
            });
        });
});

// =====================================
// Buscar productos
// =====================================

app.get('/producto/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');


    Producto.find({ nombre: regex })
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            };
            res.status(201).json({
                ok: true,
                productos
            });
        });
});



// =====================================
// Crear un nuevo producto
// =====================================

app.post('/producto', verificaToken, (req, res) => {
    // grabar el usuario
    // grabar una categoria del listado
    let body = req.body;
    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria,
        usuario: req.usuario._id
    });

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        };
        res.status(201).json({
            ok: true,
            producto: productoDB
        });

    });

});

// =====================================
// Actualizar un producto
// =====================================

app.put('/producto/:id', verificaToken, (req, res) => {
    // grabar el usuario
    // grabar una categoria del listado
    let id = req.params.id;

    let body = req.body;

    let descProducto = {
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria
    }

    Producto.findByIdAndUpdate(id, descProducto, { new: true, runValidators: true }, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                message: 'El producto no existe'
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });
    });

});

// =====================================
// Borrar un producto
// =====================================

app.delete('/producto/:id', verificaToken, (req, res) => {
    // grabar el usuario
    // grabar una categoria del listado
    let id = req.params.id;

    let cambiaDisponible = {
        disponible: false
    }

    Producto.findByIdAndUpdate(id, cambiaDisponible, { new: true }, (err, productoBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        };

        if (!productoBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            producto: productoBorrado
        });
    });

});

module.exports = app;