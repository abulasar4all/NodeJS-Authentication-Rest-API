const jwt = require('jwt-simple');
const User = require('../models/user');
const config = require('../config');

function tokenForUser(user) {
	const timestamp = new Date().getTime();
	return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
}


exports.signin = function( req, res, next){
	res.send({token: tokenForUser(req.user)});
}

exports.signup = function(req, res, next){
	//res.send({success: true});

	const email = req.body.email;
	const password = req.body.password;

	if (!email || !password) {
		res.status(422).send({error: "You must provide both Email and Password"});
	}

	//See if the user with given email address already exists
	User.findOne({email: email}, function(err, existingUser){
		if(err){ return next(err);}

		//If a user with email does exist return an error
		if (existingUser) {
			return res.status(422).send({error: "Email already existed"});
		}

		//If a user email does not exist, save and create and save user record

		const user = new User({
			email: email,
			password: password
		});

		user.save(function(err){
			if (err) { return next(err);}

			res.json({ token: tokenForUser(user) });
		});
	});
}