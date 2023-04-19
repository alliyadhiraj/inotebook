const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const fetchuser = require('../middleware/fetchuser')

const JWT_SECRET = 'Alliyauwilldoit'

//Route 1: Create a user using: post "/api/auth/createuser". doesnt require auth/ createUser, no login required
router.post('/createuser', [
        body('name', "Enter valid name").isLength({ min: 3 }),
        body('email', "Enter valid password").isEmail(),
        body('password', "Password atleast 5 character").isLength({ min: 5 }),
], async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
        }
        // check whether the user with this email exist already

        try {


                let user = await User.findOne({ email: req.body.email });
                if (user) {
                        return res.status(400).json({ error: "sorry a user with this email is already exists" })
                }

                const salt = await bcrypt.genSalt(10);
                const secPass = await bcrypt.hash(req.body.password, salt);

                user = await User.create({
                        name: req.body.name,
                        password: secPass,
                        email: req.body.email,
                });

                const data = {
                        user: {
                                id: user.id
                        }
                }

                const authtoken = jwt.sign(data, JWT_SECRET);
                console.log(authtoken);

                // res.json({ user })
                res.json({ authtoken });
        } catch (error) {
                console.log(error.message);
                res.status(500).send("Internal server error");
        }
})

//Route 2: Authenticatio a user using POST "/api/auth/login" .No login required

router.post('/login', [
        body('email', "Enter valid email").isEmail(),
        body('password', "Password cancot be blank").exists(),
], async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
        }
        const {email, password} = req.body;
        try {
                let user = await User.findOne({email});
                if (!user) {
                        return res.status(400).json({ error: "Please try to login with correct credentials" })
                }
                const passwordCompare = await bcrypt.compare(password, user.password);
                if (!passwordCompare) {
                        return res.status(400).json({error: "Please try to login with correct credentials"})
                }

                const data = {
                        user: {
                                id: user.id
                        }
                }

                const authtoken = jwt.sign(data, JWT_SECRET);
                console.log(authtoken);

                // res.json({ user })
                res.json({ authtoken });

        } catch (error) {
                console.log(error.message);
                res.status(500).send("Internal server error");
        }
});

//Route 3: get loggedin User Details using: POST "/api/auth/getuser". Login required

router.post('/getuser', fetchuser ,async (req, res) => {

try {
        userid = req.user.id;
        const user = await User.findById(userid).select("-password")       
        res.send(user)
} catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
}
});
module.exports = router