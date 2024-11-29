import { Strategy as LocalStrategy } from 'passport-local';

function initialize(passport, pool) {
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, async (email, password, done) => {
        try {
            const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
            if (rows.length === 0) {
                return done(null, false, { message: 'No user with that email' });
            }

            const user = rows[0];
            // Aquí debes agregar la lógica para comparar la contraseña

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
            done(null, rows[0]);
        } catch (error) {
            done(error, null);
        }
    });
}

export default initialize;
