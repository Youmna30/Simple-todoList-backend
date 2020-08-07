var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
import indexRouter from './routes'
import config from './config';
import mongoose from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import { apiError } from './helpers/checkMethods';

var app = express();


mongoose.Promise = global.Promise;
mongoose.connect(config.mongoUrl, { useNewUrlParser: true });

autoIncrement.initialize(mongoose.connection);

mongoose.connection.on('connected', () => console.log('\x1b[32m%s\x1b[0m', '[DB] Connected...'));
mongoose.connection.on('error', err => console.log('\x1b[31m%s\x1b[0m', '[DB] Error : ' + err));
mongoose.connection.on('disconnected', () => console.log('\x1b[31m%s\x1b[0m', '[DB] Disconnected...'));




app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  next();
});

app.use('/', indexRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(new apiError(404, 'Not Found...'));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  // render the error page
  res.status(err.status || 500).json({
    errors: err.message
});
});

module.exports = app;
