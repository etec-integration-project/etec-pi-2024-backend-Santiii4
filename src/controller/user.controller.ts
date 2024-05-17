

app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    const newUser = { username, email, password };
  
    db.query('INSERT INTO users SET ?', newUser, (err, result) => {
      if (err) {
        res.status(500).send({ message: 'Error al registrar el usuario' });
      } else {
        res.status(201).send({ message: 'Usuario registrado con éxito' });
      }
    });
});