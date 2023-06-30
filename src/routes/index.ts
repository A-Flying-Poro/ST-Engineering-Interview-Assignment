import { Router } from "express";
import {RowDataPacket} from "mysql2";

import database from "../util/database";
import Logger from "../util/logger";

const router = Router()

router.get('/', (req, res, next) => {
    res.render('index', {})
})

// Login
router.get('/login', (req, res) => {
    // @ts-ignore
    if (req.session.isLoggedIn === true) {
        return res.redirect('/')
    }

    return res.render('login', { error: false })
})

router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body

        const [results, columns] = await database.query<RowDataPacket[]>(
            'SELECT id, username, password, email FROM accounts WHERE username = ?;',
            [username],
        )

        if (results == null || results.length == 0) {
            return res.render('login', {
                error: 'Username not found.'
            })
        }

        const user = results[0]
        const userPassword = user.password
        if (userPassword !== password) {
            return res.render('login', {
                error: 'Invalid password.'
            })
        }

        // @ts-ignore
        req.session.isLoggedIn = true
        // @ts-ignore
        res.redirect(req.query.redirect_url || '/')
    } catch (e) {
        return next(e)
    }
})

// Logout
router.get('/logout', (req, res) => {
    // @ts-ignore
    req.session.isLoggedIn = false
    res.redirect('/')
})

module.exports = router
