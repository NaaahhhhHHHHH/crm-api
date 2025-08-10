const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Owner = require('../models/ownerModel');
const Employee = require('../models/employeeModel');
const Customer = require('../models/customerModel');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    let userType = 'owner';
    let user = await Owner.findOne({ where: { email } });
    if (!user) {
        userType = 'employee';
        user = await Employee.findOne({ where: { email } });
    }
    if (!user) {
        userType = 'customer';
        user = await Customer.findOne({ where: { email } });
    }
    
    if (!user) {
      return done(null, false, { message: 'Email not found in system' });
    }

    if (!user.verification) {
        return done(null, false, { message: "Account hasn't been verified yet" });
    }

    return done(null, {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      role: userType,
      verification: true
    });
  } catch (err) {
    return done(err, null);
  }
}));
