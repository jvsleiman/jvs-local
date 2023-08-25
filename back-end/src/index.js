import express from "express";
import session from "express-session";
import MySQLStore from "express-mysql-session"

import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import { config } from "./config.js";
import { DBConn } from "./database.js";
import { AccountRouter } from "./route/account.js";
import { SessionRouter } from "./route/session.js";

const app = express();

app.set("trust proxy", 1);

if (config.isProduction) {
    const mysqlStore = new MySQLStore(session);
    const sessionStore = mysqlStore(config.sessionStore, DBConn)

    config.session = Object.assign(config.session, config.sessionProduction);
    config.session.store = sessionStore;
}

// Configuration
app.use(cors(config.cors));
app.use(session(config.session));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', true);
    res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, authorization'
    );
    res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,PUT,OPTIONS');
    res.header('Access-Control-Allow-Origin', config.cors.origin);

    req.session.loggedIn ??= false;
    req.session.accountInfo ??= {};

    return next();
})

app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json(config.bodyParser));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/account", AccountRouter);
app.use("/session", SessionRouter);

// Run
app.listen(Number(process.env.PORT ?? config.devPort), () => {
    console.log(`App running on port ${process.env.PORT ?? config.devPort}`);
});