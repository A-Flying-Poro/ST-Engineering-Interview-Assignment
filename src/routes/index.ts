import {Request, Router} from "express";
import {RowDataPacket} from "mysql2";

import database from "../util/database";
import Logger from "../util/logger";
import User from "../model/User";

const router = Router()

router.get('/', (req, res) => {
    res.render('index', {
        user: req.session.user
    })
})

// Login
router.get('/login', (req, res) => {
    // @ts-ignore
    if (req.session.user != null) {
        return res.redirect('/')
    }

    return res.render('login', { error: false })
})

router.post('/login', async (req, res, next) => {
    try {
        const { username, password } = req.body

        const [results, columns] = await database.execute<RowDataPacket[]>(
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

        req.session.user = new User(user.id, user.username, user.email)
        // @ts-ignore
        res.redirect(req.query.redirect_url || '/')
    } catch (e) {
        return next(e)
    }
})

// Logout
router.get('/logout', (req, res) => {
    req.session.user = null
    res.redirect('/')
})

// Account
router.get('/account', async (req, res) => {
    if (req.session.user == null) {
        return res.redirect('/login')
    }

    const user = await fetchUserById(req.session.user.userId)
    if (user == null) {
        req.session.user = null
        res.redirect('/login')
    }

    req.session.user = user

    res.render('account', {
        user: req.session.user,
        messages: req.session.messages,
    })
    req.session.messages?.splice(0)
    req.session.save()
})

router.post('/account', async (req, res, next) => {
    try {
        const bodyId: string = req.body.userId
        const id = Number(bodyId)
        const bodyEmail: string = req.body.email

        if (!id || isNaN(id)) {
            addMessage(req, "Error: Unknown ID provided.")
            return res.redirect('/account')
        }
        if (bodyEmail == null || bodyEmail.trim().length == 0) {
            addMessage(req, "Error: Please enter a valid email.")
            return res.redirect('/account')
        }

        try {
            await database.execute(
                'UPDATE accounts SET email=? WHERE id=?',
                [bodyEmail, id]
            )
        } catch (e) {
            addMessage(req, "Error: Could not update your account.")
            return res.redirect('/account')
        }

        addMessage(req, "Updated account successfully.")
        return res.redirect('/account')
    } catch (e) {
        return next(e)
    }
})

function addMessage(req: Request, message: string) {
    const messages = req.session.messages || []
    messages.push(message)
    req.session.messages = messages
}

async function fetchUserById(id: any) {
    const [results, columns] = await database.execute<RowDataPacket[]>(
        'SELECT id, username, password, email FROM accounts WHERE id = ?;',
        [id],
    )

    if (results.length == 0)
        return null

    const userResult = results[0]

    return new User(userResult.id, userResult.username, userResult.email)
}

module.exports = router
