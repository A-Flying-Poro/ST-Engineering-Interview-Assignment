import mysql from "mysql2/promise";

import Logger from "../util/logger";



const databaseHost = process.env.DATABASE_HOST || 'localhost'
const databasePort = Number(process.env.DATABASE_PORT) || 3306
const databaseUser = process.env.DATABASE_USER
const databasePassword = process.env.DATABASE_PASSWORD
const databaseDatabase = process.env.DATABASE_DATABASE

const connection = mysql.createPool({
    host: databaseHost,
    port: databasePort,
    user: databaseUser,
    password: databasePassword,
    database: databaseDatabase,
})

/*connection.connect((error) => {
    if (error) {
        Logger.error('Error while connecting to database!', error)
        // process.exit(1)
        throw error
    }

    Logger.info('Connected to database.')
    Logger.debug('Database:')
    Logger.debug(`  Host: ${databaseHost}`)
    Logger.debug(`  Port: ${databasePort}`)
    Logger.debug(`  User: ${databaseUser}`)
    Logger.debug(`  Database: ${databaseDatabase}`)
})*/

export default connection
