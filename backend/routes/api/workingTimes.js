const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../../model/User');
const WorkingTime = require('../../model/WorkingTime');

/**
 * @route POST api/workingtimes/new
 * @description Add new working time
 * @access Private
 */
router.post('/new', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    if (req.user.role == 'admin') {
        let {
            name,
            hours,
            holiday_hours,
        } = req.body

        let newWorkingTime = new WorkingTime({
            name,
            hours,
            holiday_hours
        })
        newWorkingTime.save().then(() => {
            return res.status(201).json({
                success: true,
                msg: "The new working time has been added!"
            });
        }).catch(error => {
            return res.status(400).json({
                success: true,
                msg: error
            });
        })
    } else {
        return res.status(404).json({
            success: false,
            msg: "You must be admin, if you want add new working time."
        });
    }
})

/**
 * @route GET api/workingtimes/all
 * @description List all working times
 * @access Private
 */
router.get('/all', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    if (req.user.role == 'admin' || req.user.role == 'manager') {
        WorkingTime.find({}).populate('employees').exec().then(workingTimes => {
            return res.status(200).json(workingTimes);
        }).catch(error => {
            return res.status(404).json({
                success: true,
                msg: error
            });
        })
    } else {
        return res.status(404).json({
            success: false,
            msg: "You must be admin or manager, if you want list all working times."
        });
    }
})

/**
 * @route DELETE api/workingtimes/delete/:id
 * @description Delete working time
 * @access Private
 */
router.delete('/delete/:id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    if (req.user.role == 'admin') {
        WorkingTime.findById(req.params.id).then(workingTime => {
            return workingTime.deleteOne().then(() => {
                User.updateMany({ workingTime: workingTime._id }, { workingTime: null }).then(() => {
                    res.status(200).json({
                        msg: "The working time has been deleted!",
                        success: true
                    })
                }).catch(error => {
                    return res.status(400).json({
                        success: true,
                        msg: error
                    });
                })
            }).catch(error => {
                return res.status(400).json({
                    success: true,
                    msg: error
                });
            })
        }).catch(error => {
            return res.status(400).json({
                success: true,
                msg: error
            });
        })
    } else {
        return res.status(404).json({
            success: false,
            msg: "You must be admin, if you want add new working time."
        });
    }
})

/**
 * @route PUT api/workingtimes/udpate/:id
 * @description Update working time
 * @access Private
 */
router.put('/update/:id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    if (req.user.role == 'admin') {
        let items = {
            name: req.body.name,
            hours: req.body.hours,
            holiday_hours: req.body.holiday_hours,
        }
        WorkingTime.updateOne({ _id: req.params.id }, items).then(() => {
            return res.status(201).json({
                msg: "The working time has been updated!",
                success: true
            })
        }).catch(error => {
            return res.status(400).json({
                success: true,
                msg: error
            });
        })
    } else {
        return res.status(404).json({
            success: false,
            msg: "You must be admin, if you want update working time."
        });
    }
})
module.exports = router;