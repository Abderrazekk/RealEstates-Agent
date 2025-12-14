import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Local Strategy for email/password login
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return done(null, false, { message: 'Invalid credentials' });
    }
    
    // Check if user has password (Google users might not have one)
    if (!user.password) {
      return done(null, false, { message: 'Please use Google login or reset password' });
    }
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return done(null, false, { message: 'Invalid credentials' });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

console.log('✅ Passport configured with Local Strategy');