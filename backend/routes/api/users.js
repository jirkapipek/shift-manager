const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const key = require('../../config/keys').secret;
const User = require('../../model/User');
const JobPosition = require('../../model/JobPosition');
const WorkingTime = require('../../model/WorkingTime');
require('dotenv').config();
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey('');
var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/**
 * @route POST api/users/register
 * @description register the user
 * @access Private
 */
router.post('/register', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    if (req.user.role == 'admin' || req.user.role == 'manager') {
        if (emailRegex.test(req.body.email) && (req.body.role == 'admin' || req.body.role == 'manager' || req.body.role == 'employee')) {
            let {
                name,
                lastname,
                email,
                position,
                workingTime,
                role
            } = req.body

            //create random password
            var password = ("" + Math.random()).substring(2, 6);

            User.findOne({
                email: email
            }).then(user => {
                if (user) {
                    return res.status(404).json({
                        success: false,
                        msg: "Email is already registered."
                    });
                }
                else {
                    //create new user
                    let newUser = new User({
                        name,
                        lastname,
                        email,
                        password,
                        role,
                    });
                    //hash our password
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err;
                            newUser.password = hash;
                            newUser.save().then(user => {
                                setPositionAndTime(user, position, workingTime);
                                if (sendConfirmMail(name, lastname, email, password)) {
                                    return res.status(201).json({
                                        success: true,
                                        msg: "The user was registered and sent an email with credentials!"
                                    });
                                }
                            });
                        });
                    });

                }

            });
        } else {
            return res.status(400).json({
                success: false,
                msg: "Email must be in format name@server.domain and roles only (admin, manager, employee)."
            });
        }
    } else {
        return res.status(404).json({
            success: false,
            msg: "You must be admin/manager, if you want register users."
        });
    }
});

/**
* @route POST api/users/login
* @description singing the user
* @access Public
*/
router.post('/login', (req, res) => {
    User.findOne({ email: req.body.email }).then(user => {
        if (!user) {
            return res.status(401).json({
                msg: "Email is not found!",
                success: false
            });
        }
        //if there is user, compare password
        bcrypt.compare(req.body.password, user.password).then(isMatch => {
            if (isMatch) {
                //User password is correct and we send json token
                const payload = {
                    _id: user._id,
                    name: user.name,
                    lastname: user.lastname,
                    email: user.email,
                    role: user.role
                }
                jwt.sign(payload, key, {
                }, (err, token) => {
                    res.status(200).json({
                        token: `Bearer ${token}`,
                    });
                });
            } else {
                res.status(404).json({
                    msg: "Incorrect password.",
                    success: false
                });

            }
        });
    });
});

/**
* @route POST api/users/me
* @description Data of the logged-in user
* @access Private
*/
router.get('/me', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    User.findOne({ _id: req.user._id }).select('_id name lastname email role').populate('position', 'name description default_salary').populate('workingTime', 'name hours holiday_hours').exec().then(user => {
        res.status(200).json({
            user: user
        })
    })
});


/**
 * @route DELETE api/users/delete/:id
 * @description Delete user
 * @access Private
 */
router.delete('/delete/:id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    if (req.user.role == 'admin' || req.user.role == 'manager') {
        User.findById(req.params.id).then(user => {
            return user.deleteOne().then(() => {
                unsetPositionAndTime(user);
                Shift.deleteMany({ owner: user._id }).then(() => {
                    res.status(201).json({
                        msg: "The user has been deleted!",
                        success: true
                    })
                })

            })
        }).catch(err => {
            res.status(404).json({
                msg: "Error deleting user!"
            });
        })
    } else {
        return res.status(403).json({
            msg: "You must be admin, if you want delete user.",
            success: false
        })
    }
});

/**
 * @route PUT api/users/update/:id
 * @description Update user data
 * @access Private
 */
router.put('/update/:id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    if (req.user.role == 'admin') {
        let items = {
            name: req.body.name,
            lastname: req.body.lastname,
            email: req.body.email,
            role: req.body.role
        }
        User.findById(req.params.id).then(user => {
            unsetPositionAndTime(user);
            setPositionAndTime(user, req.body.position, req.body.workingTime)
            User.updateOne({ _id: user._id }, items).then(() => {
                res.status(201).json({
                    msg: "The user has been updated!",
                    success: true
                })
            })

        }).catch(err => {
            res.status(404).json({
                msg: "err"
            });
        })
    } else {
        return res.status(403).json({
            msg: "You must be admin, if you want update user.",
            success: false
        })
    }
});

/**
* @route GET api/users/
* @description list all users
* @access Private
*/
router.get('/', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    if (req.user.role == 'admin' || req.user.role == 'manager') {
        User.find({}, (err, users) => {
            return res.status(200).json(users);
        }).select(['-password', '-__v']).populate('position', '_id name').populate('workingTime', '_id name').exec()
    }
});

/**
 * @route POST api/users/changepassword
 * @description change password the user
 * @access Private
 */
router.post('/changepassword', passport.authenticate('jwt', {
    session: false
}), (req, res) => {

    let {
        password,
        newpassword
    } = req.body
    bcrypt.compare(password, req.user.password).then(isMatch => {
        if (isMatch) {
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newpassword, salt, (err, hash) => {
                    if (err) throw err;
                    newpassword = hash;
                    User.findOneAndUpdate({ _id: req.user._id }, { password: newpassword }, (err, user) => {
                        if (err) { return res.status(400).json({ status: false, msg: "error" }) }
                        return res.status(200).json({ status: true, msg: "PIN has been changed, please log-in with the new PIN" });

                    });
                });
            });
        } else {
            return res.status(404).json({ status: false, msg: "Incorect password!" });
        }
    });
});

/**
 * @route POST api/users/resetpassword/:id
 * @description Reset user password to default
 * @access Private
 */
router.post('/resetpassword/:id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    if (req.user.role == 'admin') {
        var default_password = "0000"
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(default_password, salt, (err, hash) => {
                if (err) throw err;
                default_password = hash;
                User.findOneAndUpdate({ _id: req.params.id }, { password: default_password }, (err) => {
                    if (err) {
                        return res.status(400).json(
                            {
                                status: false,
                                msg: "Error with reset password!"
                            })
                    }
                    return res.status(200).json(
                        {
                            status: true,
                            msg: "PIN has been reseted, please log-in with the default PIN (0000)!"
                        });
                });
            });
        });
    }
});

//This function send confirmation email and credencials
async function sendConfirmMail(name, lastname, email, password) {
    // send mail with defined transport object
    sgMail.send({
        from: 'Shift Manager <mailershiftmanager@gmail.com>', // sender address
        to: email, // list of receivers
        subject: "Registration to system Shift Manager", // Subject line
        html: `You are successfully registered to <b>Shift Manager</b>
      <br>Name: ${name}
      <br>Lastname: ${lastname}
      <br>Your login email: ${email}
      <br>Your password: ${password}`, // html body
    }).then(() => {
        console.log("E-mail was successfully sent!")
    }).catch((error) => {
        console.log(error);
    })
}

//Function set references to jobposition and workingtime from user
async function setPositionAndTime(user, position, workingTime) {
    var newPosition = await JobPosition.findById(position);
    if (newPosition !== null) {
        user.position = newPosition;
        newPosition.employees.push(user);
        await newPosition.save();
    }
    var newWorkingTime = await WorkingTime.findById(workingTime);
    if (newWorkingTime !== null) {
        user.workingTime = newWorkingTime;
        newWorkingTime.employees.push(user);
        await newWorkingTime.save();
    }
    await user.save();
}

//Function unset references to jobposition and workingtime from user
async function unsetPositionAndTime(user) {
    WorkingTime.updateOne({ _id: user.workingTime },
        { $pull: { employees: user._id } }
    ).then(() => {
        JobPosition.updateOne({ _id: user.position },
            { $pull: { employees: user._id } }
        ).then(() => {
            return true;
        })
    }).catch(err => {
        return false;
    })
}

module.exports = router;
