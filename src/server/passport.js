import passport, { deserializeUser } from "passport";

import { Strategy as LocalStrategy } from 'passport-local'

import { ObjectId } from 'mongodb'

const configurePassport = db => {
  const users = db.collection("users");
  const boards = db.collection("boards");

  passport.serializeUser(function(user, cb) {
    console.log('Serialize: ', user)
    cb(null, user._id);
  });
  
  passport.deserializeUser(function(id, cb) {
    console.log('deserializeUser', id)
    users.findOne({ _id: new ObjectId(id) }, function (err, user) {
      if (err) { return cb(err); }
      console.log('found user', user)
      console.log('deserialization result', {
        ...user,
        userId: user._id
      })
      cb(null, {
        ...user,
        userId: user._id
      });
    });
  });

  passport.use(new LocalStrategy(
    function(username, password, done) {
      users.findOne({ username: username }, function (err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        console.log(password, user)
        if (user.password !== password) { 
          return done(null, false); 
        }
        return done(null, user);
      });
    }
  ));  
};

export default configurePassport;
