const express = require('express');
const router = express.Router();
const passport = require('passport');
const Shift = require('../../model/Shift');
var timeRegex = /^[0-9]{2}:[0-9]{2}$/
var dateRegex = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/

/**
 * @route POST api/shifts/newrequest
 * @description Add new job position
 * @access Private
 */
router.post('/newrequest', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    if (req.user.role == 'employee') {

        Shift.findOne({ owner: req.user._id, date: req.body.date }).then(shift => {
            if (shift) {
                return res.status(403).json({
                    success: false,
                    msg: "You have shift for actual date. If you want change request, you must edit shift!"
                });
            }
            else {

                if (timeRegex.test(req.body.time_from) && timeRegex.test(req.body.time_to) && dateRegex.test(req.body.date)) {
                    // console.log(length)
                    let newShift = new Shift({
                        time_from: req.body.time_from,
                        time_to: req.body.time_to,
                        date: req.body.date,
                        length: getShiftLength(req.body.time_from, req.body.time_to),
                        request: true
                    });

                    newShift.save().then(() => {
                        setShift(req.user, newShift);
                        return res.status(201).json({
                            success: true,
                            msg: "The request has been accepted! Please, wait for manager check!"
                        });
                    }).catch(error => {
                        return res.status(405).json({
                            success: false,
                            msg: error
                        });
                    });
                } else {
                    return res.status(400).json({
                        success: false,
                        msg: "The time must be in format HH:MM! and date in format YYYY-MM-DD"
                    });
                }
            }
        });
    } else {
        return res.status(404).json({
            success: false,
            msg: "You must be employee, if you want add the new request."
        });
    }
});

/**
 * @route GET api/shifts/requests
 * @description All employees's requests
 * @access Private
 */
router.get('/requests', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    if (req.user.role == 'admin' || req.user.role == 'manager') {
        Shift.find({ request: true }).populate({
            path: 'owner', select: '_id name lastname email', populate: {
                path: 'position',
                select: 'name'
            }
        }).exec().then(shifts => {
            return res.status(200).json(shifts);
        }).catch(error => {
            return res.status(404).json({
                success: false,
                msg: error
            });
        });
    } else {
        return res.status(401).json({
            success: false,
            msg: "You must be admin, if you want add new working time."
        });
    }
});

/**
 * @route GET api/shifts/confirmed
 * @description All confirmed shifts
 * @access Private
 */
router.get('/confirmed', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    if (req.user.role == 'admin' || req.user.role == 'manager') {
        Shift.find({ request: false }).populate({
            path: 'owner', select: '_id name lastname email', populate: {
                path: 'position',
                select: 'name'
            }
        }).exec().then(shifts => {
            return res.status(200).json(shifts);
        }).catch(error => {
            return res.status(404).json({
                success: false,
                msg: error
            });
        })
    } else {
        return res.status(401).json({
            success: false,
            msg: "You must be admin, if you want add new working time."
        });
    }
});

/**
 * @route GET api/shifts/myshifts
 * @description All shifts of logged employee
 * @access Private
 */
router.get('/myshifts', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    if (req.user.role == 'employee') {
        Shift.find({ owner: req.user._id, request: false }).populate('owner', '_id name lastname email').exec().then(shifts => {
            res.status(200).json(shifts);
        }).catch(error => {
            return res.status(404).json({
                success: false,
                msg: error
            });
        })
    }
});

/**
 * @route GET api/shifts/myrequests
 * @description All request of logged employee
 * @access Private
 */
router.get('/myrequests', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    if (req.user.role == 'employee') {
        Shift.find({ owner: req.user._id, request: true }).populate('owner', '_id name lastname email').exec().then(shifts => {
            res.status(200).json(shifts)
        }).catch(error => {
            return res.status(404).json({
                success: false,
                msg: error
            });
        })
    }
});

/**
 * @route DELETE api/shifts/delete/:id
 * @description Delete shift request or shift
 * @access Private
 */
router.delete('/delete/:id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    if (req.user.role == 'admin' || req.user.role == 'manager') {
        Shift.findById(req.params.id).then(shift => {
            return shift.deleteOne().then(() => {
                User.updateOne({ _id: shift.owner }, { $pull: { shifts: shift._id } }).then(() => {
                    res.status(200).json({
                        msg: "The shift has been deleted!",
                        success: true
                    });
                });
            }).catch(error => {
                return res.status(404).json({
                    success: false,
                    msg: error
                });
            })
        });
    } else if (req.user.role == 'employee') {
        Shift.findOne({ _id: req.params.id, request: true }).then(shift => {
            if ('' + req.user._id == '' + shift.owner) {
                return shift.deleteOne().then(() => {
                    User.updateOne({ _id: shift.owner }, { $pull: { shifts: shift._id } }).then(() => {
                        res.status(200).json({
                            msg: "The request has been deleted!",
                            success: true
                        });
                    }).catch(error => {
                        return res.status(404).json({
                            success: false,
                            msg: error
                        });
                    })
                }).catch(error => {
                    return res.status(404).json({
                        success: false,
                        msg: error
                    });
                })
            } else {
                return res.status(401).json({
                    msg: "User has not been authenticated!"
                });
            }
        });

    }
    else {
        return res.status(404).json({
            success: false,
            msg: "You must be admin, if you want delete shift."
        });
    }
});

/**
 * @route UPDATE api/shifts/update/:id
 * @description Update shift request or shift
 * @access Private
 */
router.put('/update/:id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    if (timeRegex.test(req.body.time_from) && timeRegex.test(req.body.time_to)) {
        if (req.user.role == 'admin' || req.user.role == 'manager') {

            let items = {
                time_from: req.body.time_from,
                time_to: req.body.time_to,
                length: getShiftLength(req.body.time_from, req.body.time_to),
                request: (req.body.request != undefined) ? req.body.request : true
            }

            Shift.updateOne({ _id: req.params.id }, items).then(() => {
                return res.status(201).json({
                    msg: "The shift has been updated!",
                    success: true
                });
            }).catch(error => {
                return res.status(404).json({
                    success: false,
                    msg: error
                });
            })

        } else if (req.user.role == 'employee') {
            Shift.findOne({ _id: req.params.id, request: true }).then(shift => {
                if ('' + req.user._id == '' + shift.owner) {
                    let items = {
                        time_from: req.body.time_from,
                        time_to: req.body.time_to,
                        length: getShiftLength(req.body.time_from, req.body.time_to)
                    }

                    Shift.updateOne({ _id: req.params.id }, items).then(() => {
                        return res.status(201).json({
                            msg: "The shift has been updated!",
                            success: true
                        });
                    }).catch(error => {
                        return res.status(404).json({
                            success: false,
                            msg: error
                        });
                    })
                } else {
                    return res.status(401).json({
                        msg: "User has not been authenticated!"
                    })
                }
            }).catch(error => {
                return res.status(404).json({
                    msg: error
                })
            })

        }
        else {
            return res.status(404).json({
                success: false,
                msg: "You must be owner of your shift, or admin, if you want update shift."
            });
        }
    } else {
        return res.status(400).json({
            success: false,
            msg: "The time must be in format HH:MM! and date in format YYYY-MM-DD"
        });
    }
})

//Funciton for setting reference to user collection
async function setShift(user, shift) {
    shift.owner = user;
    await shift.save();
    user.shifts.push(shift);
    await user.save();
}

//Funciton for add zeros for time
function paddy(num, padlen, padchar) {
    var pad_char = typeof padchar !== 'undefined' ? padchar : '0';
    var pad = new Array(1 + padlen).join(pad_char);
    return (pad + num).slice(-pad.length);
}

//Funciton for get employee's shift length
function getShiftLength(timeFrom, timeTo) {
    var length = "";
    var time_from = timeFrom.split(":");
    time_from = time_from[0] * 60 + time_from[1] * 1;
    var time_to = timeTo.split(":");
    time_to = time_to[0] * 60 + time_to[1] * 1;

    if (time_from > time_to) {
        length = paddy(Math.floor((time_from - time_to) / 60), 2) + ":" + paddy(Math.round(Math.abs(Math.floor((time_from - time_to) / 60) - (time_from - time_to) / 60) * 60), 2);
    } else {
        length = paddy(Math.floor((time_to - time_from) / 60), 2) + ":" + paddy(Math.round(Math.abs(Math.floor((time_to - time_from) / 60) - (time_to - time_from) / 60) * 60), 2);
    }

    return length;
}
module.exports = router;