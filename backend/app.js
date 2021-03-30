const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const passport = require('passport');
const User = require('./model/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();


//initialize the app
const app = express();

app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(bodyParser.json());

app.use(cors());

app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.use(passport.initialize());


require('./config/passport')(passport);

//bring in the database config
console.log(process.env.DB_URL);
const db = process.env.DB_URL || require('./config/keys').mongoURI;
console.log(db);
mongoose.connect(db, { useUnifiedTopology: true, useCreateIndex: true, useNewUrlParser: true, useFindAndModify: false })
  .then(() => console.log('Connected to MongoDB!'))
  .catch(err => console.error('Could not connect to MongoDB... ', err));

const PORT = process.env.PORT || 5000;

//bring in the routes
const users = require('./routes/api/users');
const jobPositions = require('./routes/api/jobPositions');
const workingTimes = require('./routes/api/workingTimes');
const shifts = require('./routes/api/shifts');

const { use } = require('passport');

app.use('/api/users', users);
app.use('/api/jobpositions', jobPositions);
app.use('/api/workingtimes', workingTimes);
app.use('/api/shifts', shifts);
app.listen(PORT, () => {
  console.log('Server started on port', PORT);
})

createBaseAccount();

app.use('*', (req, res, next) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

//build base account
async function createBaseAccount() {
  let name = "Admin";
  let lastname = "Admin";
  let email = "admin@shiftmanagerbp.com";
  let role = "admin";
  //create new user
  console.log("Checking accounts in DB")
  let newUser = new User({
    name: name,
    lastname: lastname,
    email: email,
    password: "0000",
    role: role
  });

  User.findOne({
    email: email
  }).then(user => {
    if (user) {
      return console.log("Account " + user.email + " exist");
    }
    else {
      //hash password
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser.save().then(user => {
            {
              return console.log("Account " + user.email + " was registered");
            }
          });

        });
      });
    }
  });

}

