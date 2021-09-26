const localStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

function initPassport(passport, getUserByUserName, getUserById){

    const authenticatUser = async (username, password, done) => {
        const user = getUserByUserName(username);
        if(user == null){
            	return done(null, false, { message: "No user with that name" });
        }

        try{
            if(await bcrypt.compare(password, user.password)){
                return done(null, user);
            } else {
                return done(null, false, { message: "Incorrect password!" });
            }
        }catch (e){
            return done(e);
        }

    };

    passport.use(new localStrategy({ usernameField: "name"}, authenticatUser));
    passport.serializeUser( (user, done) => done(null, user.id) );
    passport.deserializeUser( (id, done) => { 
        return done(null, getUserById(id));
     } );
}
module.exports = initPassport