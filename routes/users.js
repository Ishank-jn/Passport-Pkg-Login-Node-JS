const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// User model
const User = require('../models/User');

// Login page
router.get('/login', (req, res) => res.render('login'));

// Register page
router.get('/register', (req, res) => res.render('register'));

// Register Handler
router.post('/register', (req, res) => {
    try {
        const { name, email, password, password2 } = req.body;
        let errors = [];

        // Validate fields
        if (!name ||!email ||!password ||!password2) {
            errors.push('Please fill in all the required fields');
            }
        
        // Check password match
        if (password!== password2) {
        errors.push('Passwords do not match');
        }

        // check password length
        if (password.length < 6) {
        errors.push('Password must be at least 6 characters long');
        }

        if (errors.length > 0) {
            res.render('register', {
                errors, 
                name, 
                email, 
                password, 
                password2
            });
        } else {
            // validation
            User.findOne({ email: email })
               .then(user => {
                    if (user) {
                        errors.push('Email already registered');
                        res.render('register', {
                            errors,
                            name,
                            email,
                            password,
                            password2
                        });
                    } else {
                        const newUser = new User({
                            name,
                            email,
                            password
                        });

                        bcrypt.genSalt(10, (err, salt) => {
                            bcrypt.hash(newUser.password, salt, (err, hash) => {
                              if (err) throw err;
                              newUser.password = hash;
                              newUser
                                .save()
                                .then(user => {
                                  req.flash('success_msg', 'Successfully registered');
                                  res.redirect('/users/login');
                                })
                                .catch(err => console.log(err));
                            });
                        });
                    }
                });
            } 
    } catch (error) {
        return res.send('Encountered Error while registering: ' + error);  
    }          
});

// Login Handler
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
      successRedirect: '/dashboard',
      failureRedirect: '/users/login',
      failureFlash: true
    })(req, res, next);
  });

// Logout
router.get('/logout', (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
    });    
});

module.exports = router;