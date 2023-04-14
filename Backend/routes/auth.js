const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');

//Create a user using: post "/api/auth". doesnt require auth
router.post('/', [
        body('name', "Enter valid name").isLength({ min: 3 }),
        body('email', "Enter valid password").isEmail(),
        body('password', "Password atleast 5 character").isLength({ min: 5 }),
], (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
        }

        User.create({
                name: req.body.name,
                password: req.body.password,
                email: req.body.email,
        }).then(user => res.json(user))
        .catch(err => {console.log(err)
        res.json({error: 'Please enter a unique value for email', message: err.message })});

})

module.exports = router