const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser')
const csrf = require("csrf");
const tokens = new csrf();
const secretTokenCSRF = 'OEKFNEZKkF78EZFH93';

const app = express();
const port = 3000;
const corsOptions = {
    origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
}
// Middleware

app.use(bodyParser.json())
app.use(cookieParser())
app.use(cors(corsOptions))
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'garage_db'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL Database');
});
const verifyTokenAndRole = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).send('Access Denied: No Token Provided!');
    }
    const roles = req.requiredroles || ["admin", "client"]
    try {
      const decoded = jwt.verify(token, 'OEKFNEZKkF78EZFH93023NOEAF');
      req.user = decoded;
      const sql = 'SELECT role FROM users WHERE id = ?';
      db.query(sql, [req.user.id], (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Server error');
        }

        if (results.length === 0) {
          return res.status(404).send('User not found');
        }

        const userRole = results[0].role;
        if (!roles.includes(userRole)) {
        return res.status(403).send('Access Denied: You do not have the required role!');
      }

      next();
    })
    } catch (error) {
      res.status(400).send('Invalid Token');
    }
  };

const verifyCSRFToken = (req, res, next) => {
  const token = req.body.token;
  secretTokenCSRF
  if (!token || !tokens.verify(secretTokenCSRF, token)) {
    return res.status(403).send("Invalid CSRF Token");
  }
  next();
};

// Routes

app.get("/api/csrf", function (req, res) {
  const token = tokens.create(secretTokenCSRF);
  res.status(200).send({
    status: 200,
    message: "CSRF récupéré",
    token: token,
  });
});

app.post('/api/signup', (req, res) => {
  const { lastname, firstname, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);
  console.log(hashedPassword)
  const sql = 'INSERT INTO users (lastname, firstname, email, password) VALUES (?, ?, ?, ?)';
  db.query(sql, [lastname, firstname, email, hashedPassword], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
      return;
    }
    res.status(201).send('User registered');
  });
});

app.post('/api/signin', (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
      return;
    }

    if (results.length === 0) {
      res.status(404).send('User not found');
      return;
    }

    const user = results[0];
    const passwordIsValid = bcrypt.compareSync(password, user.password);

    if (!passwordIsValid) {
      res.status(401).send('Invalid password');
      return;
    }

    const token = jwt.sign({ id: user.id }, 'OEKFNEZKkF78EZFH93023NOEAF', { expiresIn: 86400 });
    res.cookie('token', token, { httpOnly: true, maxAge: 86400000 }); // 86400000 ms = 24 heures

    res.status(200).send({ auth: true, role: user.role});
  });
});

app.get('/api/clients/count', (req,_res, next) => {
  req.requiredroles = ["admin"]
  next()
},  verifyTokenAndRole, (req, res) => {
  const sql = 'SELECT COUNT(*) AS count FROM users WHERE role = ?';
  db.query(sql, ['client'], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
      return;
    }

    res.status(200).json(results[0]);
  });
});


app.get('/api/clients', (req, _res, next) => {
  console.log(req.cookies)
  req.requiredroles = ["admin"];
  console.table({
    request : req.requiredroles,
    token : req.cookies.token
  })
  next();
}, verifyTokenAndRole, (req, res) => {
  const sql = 'SELECT * FROM users WHERE role = ?';
  db.query(sql, ['client'], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
      return;
    }
    res.status(200).json(results);
  });
});

// VEHICLES

// Route d'ajout d'un véhicule

app.post('/api/vehicles', (req, _res, next) => {
  // Seul un admin à accès à ce rôle
  req.requiredroles = ["admin"];
  next();
}, verifyTokenAndRole, verifyCSRFToken, (req, res) => {
  try {
    const { marque, modele, annee, client_id } = req.body;

    if (!marque || !modele || !annee || !client_id) {
      return res.status(400).send('marque, modele, annee, client_id sont requis');
    }
    const anneeNum = Number(annee);
    if (!Number.isInteger(anneeNum) || anneeNum < 1920 || anneeNum > 2025) {
      return res.status(400).send('annee invalide');
    }

    const sqlUser = 'SELECT id, role FROM users WHERE id = ? LIMIT 1';
    db.query(sqlUser, [client_id], (err, rows) => {
      if (err) { console.error(err); return res.status(500).send('Server error'); }
      if (rows.length === 0) return res.status(404).send('Client introuvable');
      if (rows[0].role !== 'client') return res.status(400).send('client_id n’est pas un client');

      const sql = `
        INSERT INTO vehicles (marque, modele, annee, client_id)
        VALUES (?, ?, ?, ?)
      `;
      db.query(sql, [marque, modele, anneeNum, client_id], (err2, result) => {
        if (err2) { console.error(err2); return res.status(500).send('Server error'); }
        res.status(201).json({ id: result.insertId, marque, modele, annee: anneeNum, client_id });
      });
    });
  } catch (e) {
    console.error(e);
    res.status(500).send('Server error');
  }
});

// Route de visualisation de la liste des veicules

app.get('/api/vehicles', (req, _res, next) => {
  req.requiredroles = ["admin"];
  next();
}, verifyTokenAndRole, (req, res) => {
  const { client_id, marque, modele, annee } = req.query;

  let sql = `
    SELECT v.id, v.marque, v.modele, v.annee, v.client_id,
           u.lastname AS client_lastname, u.firstname AS client_firstname, u.email AS client_email
    FROM vehicles v
    JOIN users u ON u.id = v.client_id
    WHERE 1=1
  `;
  const params = [];

  if (client_id) { sql += " AND v.client_id = ?"; params.push(client_id); }
  if (marque)    { sql += " AND v.marque LIKE ?"; params.push(`%${marque}%`); }
  if (modele)    { sql += " AND v.modele LIKE ?"; params.push(`%${modele}%`); }
  if (annee)     { sql += " AND v.annee = ?"; params.push(annee); }

  sql += " ORDER BY v.id DESC";

  db.query(sql, params, (err, results) => {
    if (err) { console.error(err); return res.status(500).send('Server error'); }
    res.status(200).json(results);
  });
});

// Route pour la visualisation d'un vehicule

app.get('/api/vehicles/:id', (req, _res, next) => {
  req.requiredroles = ["admin"];
  next();
}, verifyTokenAndRole, (req, res) => {
  const { id } = req.params;

  let sql = `
    SELECT v.id, v.marque, v.modele, v.annee, v.client_id,
           u.lastname AS client_lastname, u.firstname AS client_firstname, u.email AS client_email
    FROM vehicles v
    JOIN users u ON u.id = v.client_id
    WHERE v.id = ?
  `;
  const params = [id];

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Server error');
    }

    if (results.length === 0) {
      return res.status(404).send('Vehicle not found');
    }

    res.status(200).json(results[0]);
  });
});

// Route pour mise à jour d'un véhicule

app.put('/api/vehicles/:id', (req, _res, next) => {
  req.requiredroles = ["admin"];
  next();
}, verifyTokenAndRole, verifyCSRFToken, (req, res) => {
  const { marque, modele, annee, client_id } = req.body;
  const id = req.params.id;

  const set = [];
  const params = [];

  if (marque !== undefined) { set.push('marque = ?'); params.push(marque); }
  if (modele !== undefined) { set.push('modele = ?'); params.push(modele); }
  if (annee !== undefined) {
    const anneeNum = Number(annee);
    if (!Number.isInteger(anneeNum) || anneeNum < 1886 || anneeNum > 2100) {
      return res.status(400).send('annee invalide');
    }
    set.push('annee = ?'); params.push(anneeNum);
  }
  if (client_id !== undefined) {
    params.push(client_id);
    set.push('client_id = ?');
  }

  if (set.length === 0) return res.status(400).send('Aucune donnée à mettre à jour');

  const update = () => {
    const sql = `UPDATE vehicles SET ${set.join(', ')} WHERE id = ?`;
    params.push(id);
    db.query(sql, params, (err, result) => {
      if (err) { console.error(err); return res.status(500).send('Server error'); }
      if (result.affectedRows === 0) return res.status(404).send('Vehicle not found');
      res.status(200).json({ msg : "Vehicule mis à jour" });
    });
  };

  if (client_id !== undefined) {
    const sqlUser = 'SELECT id, role FROM users WHERE id = ? LIMIT 1';
    db.query(sqlUser, [client_id], (err, rows) => {
      if (err) { console.error(err); return res.status(500).send('Server error'); }
      if (rows.length === 0) return res.status(404).send('Client introuvable');
      if (rows[0].role !== 'client') return res.status(400).send('client_id n’est pas un client');
      update();
    });
  } else {
    update();
  }
});

// Route pour supprimer un vehicule

app.delete('/api/vehicles/:id', (req, _res, next) => {
  req.requiredroles = ["admin"];
  next();
}, verifyTokenAndRole, verifyCSRFToken, (req, res) => {
  const sql = 'DELETE FROM vehicles WHERE id = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) { console.error(err); return res.status(500).send('Server error'); }
    if (result.affectedRows === 0) return res.status(404).send('Vehicle not found');
    res.status(200).json({ msg : `Vehicule avec l'identifiant ${req.params.id} a été supprimé` });
  });
});

app.use(express.static(path.join(__dirname, "./client/dist")))
app.get("*", (_, res) => {
    res.sendFile(
      path.join(__dirname, "./client/dist/index.html")
    )
})

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
module.exports = app;