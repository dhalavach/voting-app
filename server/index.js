const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');

const app = express();
const dataFile = path.join(__dirname, 'data.json');
const PORT = 7481;
const urlencodedParser = bodyParser.urlencoded({ extended: true });

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.get('/variants', async (req, res) => {
  const data = JSON.parse(await fs.readFile(dataFile, 'utf-8'));
  res.send(JSON.stringify(Object.keys(data)));
  res.end();
});

// app.get('/stat', async (req, res) => {
//   const data = JSON.parse(await fs.readFile(dataFile, 'utf-8'));
//   res.send(JSON.stringify(data));
//   res.end();
// });

// app.get('/main', async (req, res) => {
//   //const data = JSON.parse(await fs.readFile(dataFile, 'utf-8'));
//   res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
// });

app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.get('/vote', async (req, res) => {
  const data = JSON.parse(await fs.readFile(dataFile, 'utf-8'));
  const totalVotes = Object.values(data).reduce((prev, curr) => prev + curr, 0);
  const votesPercentages = Object.entries(data).map(([label, votes]) => {
    return {
      label,
      percentage: ((votes * 100) / totalVotes || 0).toFixed(2),
    };
  });
  res.send(data);
  res.end();
});

app.post('/vote', async (req, res) => {
  const data = JSON.parse(await fs.readFile(dataFile, 'utf-8'));
  data[req.body.add]++;
  await fs.writeFile(dataFile, JSON.stringify(data));
  res.end();
});

// server-side form validation

app.get('/register', (req, res) => {
  res.render('register');
});

app.post(
  '/register',
  urlencodedParser,
  [
    check('username', 'Username must be at least 3 characters long!')
      .exists()
      .isLength({ min: 3 }),
    check('email', 'Email is not valid!').isEmail().normalizeEmail(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // return res.status(422).jsonp(errors.array())
      const alert = errors.array();
      res.render('register', {
        alert,
      });
    }
  }
);

app.listen(PORT, () => console.log(`server running on port ${PORT} ...`));
