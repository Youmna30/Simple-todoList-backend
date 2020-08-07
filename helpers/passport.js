import passport from 'passport';
import passportJwt from 'passport-jwt';
import config from '../config';
import User from '../models/user.model/user.model';
const JwtStrategy = passportJwt.Strategy;
const { ExtractJwt } = passportJwt;
const { jwtSecret } = config;


passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: jwtSecret
}, (payload, done) => {
    User.findOne({_id: payload.sub}).then(user => {
       
        if (!user)
            return done(null, false);

        return done(null, user)
    }).catch(err => {
        console.log('Passport Error: ', err);
        return done(null, false);
    })
}
));



const requireAuth = passport.authenticate('jwt', { session: false });
export { requireAuth};