const passport = require('passport');
const User = require('../models/user');
const config = require('../config');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');


//Create LocalStrategy
localOptions = { usernameField: 'email' };
const localLogin = new LocalStrategy(localOptions, function( email, password, done){


	User.findOne({email: email}, function( err, user){
		if (err) { return done(err);}

		if (!user) { return done(null, false);}

		//compare password- compare password equal user.password?
		//Remember we are having password hashed using bcrypt.
		user.comparePassword(password, function(err, isMatch){
			if (err) { return done(err);}

			if (!isMatch) { return done(null, false);}

			return done(null, user);
		})
	});
});

//Setup options for JWT Strategy
const jwtOptions = {
	jwtFromRequest: ExtractJwt.fromHeader('authorization'),
	secretOrKey: config.secret
	//Whenever we use JwtStrategy we also have to tell the secret that it should use to decode this token
};

//Create JWT Strategy
const jwtLogin = new JwtStrategy( jwtOptions ,function(payload, done){     //'payload' is Decoded JWT Token that we have got in controller as token . res.json({token: tokenForUser(user)})
																		   //The second argument 'done' is a callback function that we need to call, whether or not we are successfully able to authenticate the user.
   
   //See if the UserId in the payload exist in the database
   //If it does, call 'done' with the other
   // Otherwise, call done without the user object
   User.findById(payload.sub, function(err, user){
   		if (err) {return done(err, false)};  //false means we didnt find user.

   		if (user) {
   			done(null, user);
   		}else{
   			done(null, false);
   		}
   });
});								


//Tell passport to use this Strategy
passport.use(jwtLogin)
passport.use(localLogin)