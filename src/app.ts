import createError, {HttpError} from "http-errors";
import express, {Express, NextFunction, Request, Response} from 'express'
import session from 'express-session'
import bodyParser from 'body-parser'

import path from 'path'

import morganLogger from "./util/morganLogger";
import User from "./model/User";

require('dotenv').config()

const app: Express = express()
const port = Number(process.env.PORT) || 3000

const sessionSecret = process.env.SESSION_SECRET

if (sessionSecret == null) {
    console.error(`Session secret is not defined! Please set it via the environment variable 'SESSION_SECRET'.`)
    process.exit(1)
}

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// Setup session structure
declare module 'express-session' {
    interface SessionData {
        user: User | null;
        messages: string[] | null;
    }
}

// Morgan + Winston logger
app.use(morganLogger)
app.use(express.json())
// app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({ secret: sessionSecret }))
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes/index'))

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError.NotFound());
});

// error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page

    const errorStatusCode = err instanceof HttpError ? err.status : 500;

    res.status(errorStatusCode);
    res.render('error');
});


app.listen(port)
