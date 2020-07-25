import { Router } from "express";
import passport from "passport";

export default (db) => {
  const router = Router();
  const users = db.collection("users");

  router.get('/login',
    function(req, res){
      res.render('login');
    });
    
  router.post('/login', 
    passport.authenticate('local', { failureRedirect: '/login' }),
    function(req, res) {
      console.log('AUtHENTICATED!!!!!')
      res.render('login-success');
  });
  
  router.get('/register',
    function(req, res){
      res.render('register');
    });
    
  router.post('/register', 
    function(req, res, done) {
  
      try {
        console.log('Body ->', req.body)
        const { username, email, password } = req.body;
  
        users.insert({ username, email, password })
          .then(user => {
            console.log('Registered', user)
            res.redirect('/');
          })
          .catch(error => {
            console.log('Failed to register', user)
            done(error)
          })
        return ;
      } catch (error) {
        done(error);
        res.redirect('/');
      }
  });
  
  
  router.get("/signout", (req, res) => {
    req.logout();
    res.redirect("/");
  });
  
  return router;
}
