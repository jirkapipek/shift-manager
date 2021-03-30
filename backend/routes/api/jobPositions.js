const express = require('express');
const JobPosition = require('../../model/JobPosition');
const router = express.Router();
const passport = require('passport');

/**
 * @route POST api/jobpositions/new
 * @description Add new job position
 * @access Private
 */
router.post('/new', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    if (req.user.role == 'admin') {
        let {
            name,
            description,
            default_salary,
        } = req.body

        let newPosition = new JobPosition({
            name,
            description,
            default_salary
        })
        newPosition.save().then(() => {
            return res.status(201).json({
                success: true,
                msg: "The new position has been added!"
            });
        }).catch(error => {
            return res.status(403).json({
                success: true,
                msg: error
            });
        })
    } else {
        return res.status(401).json({
            success: false,
            msg: "You must be admin, if you want add new position."
        });
    }
})

/**
 * @route GET api/jobpositions/all
 * @description List all of job positions
 * @access Private
 */
router.get('/all', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    if (req.user.role == 'admin' || req.user.role == 'manager') {
        JobPosition.find({}).populate('employees').exec().then(positions => {
            return res.status(200).json(positions);
        }).catch(error => {
            return res.status(404).json({
                success: true,
                msg: error
            });
        })
    } else {
        return res.status(404).json({
            success: false,
            msg: "You must be admin, if you want add new position."
        });
    }
})

/**
 * @route DELETE api/jobpositions/delete/:id
 * @description Delete job position
 * @access Private
 */
router.delete('/delete/:id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    if (req.user.role == 'admin') {
        JobPosition.findById(req.params.id).then(position => {
            return position.deleteOne().then(() => {
                User.updateMany({ position: position._id }, { position: null }).then(() => {
                    res.status(200).json({
                        msg: "The position has been deleted!",
                        success: true
                    })
                }).catch(error => {
                    return res.status(400).json({
                        success: true,
                        msg: error
                    });
                })
            }).catch(error => {
                return res.status(404).json({
                    success: true,
                    msg: error
                });
            })
        }).catch(error => {
            return res.status(404).json({
                success: true,
                msg: error
            });
        });
    } else {
        return res.status(404).json({
            success: false,
            msg: "You must be admin, if you want delete position."
        });
    }
})


/**
 * @route PUT api/jobpositions/update/:id
 * @description Update job position
 * @access Private
 */
router.put('/update/:id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    if (req.user.role == 'admin') {
        let items = {
            name: req.body.name,
            description: req.body.description,
            default_salary: req.body.default_salary,
        }
        JobPosition.updateOne({ _id: req.params.id }, items).then(() => {
            return res.status(201).json({
                msg: "The position has been updated!",
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
            msg: "You must be admin, if you want update job position."
        });
    }
})
module.exports = router;