import http from 'http';
import express from 'express';
import nunjucks from 'nunjucks';
import cors from 'cors';
import path from 'path';
import favicon from 'serve-favicon';
import logger from 'morgan';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import Sequelize from 'sequelize';
import apicache from 'apicache'
import database from './db';

let index = require('./routes/index');
let pokemons = require('./routes/pokemons');

let app = express();

let cache = apicache.middleware

/* USAR https://pokeapi.co/docsv2/#pokedexes */

app.use(cache('5 minutes'));

/*  view engine setup */

nunjucks.configure('views', {
    autoescape: true,
    express: app
});


app.use(function (req, res, next) {
    console.log('Time:', Date.now());
    next();
});


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

/*  uncomment after placing your favicon in /public */
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

/*  connect to db */
database( db => {

    var sequelize = new Sequelize('pokemons', null, null, {
        dialect: 'sqlite'
    });

    app.use('/public',express.static(path.join(__dirname, 'public')));

    app.use('/conteudo',express.static(path.join(__dirname, 'conteudo')));

    app.use('/', index);
    app.use('/pokemons', pokemons);

    /*  catch 404 and forward to error handler */
    app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    /*  error handler */
    app.use(function(err, req, res, next) {
        /*  set locals, only providing error in development */
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        /*  render the error page */
        res.status(err.status || 500);

        if (err instanceof NotFound) {
            res.render('error', { locals: { 
                title : '404 - Not Found'
                ,description: ''
                ,author: ''
                ,analyticssiteid: 'XXXXXXX' 
            },status: 404 });
        } else {
            res.render('error', { locals: { 
                title : 'The Server Encountered an Error'
                ,description: ''
                ,author: ''
                ,analyticssiteid: 'XXXXXXX'
                ,error: err 
            },status: 500 });
        }
    });


});

export default app;


