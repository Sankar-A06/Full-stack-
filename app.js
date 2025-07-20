const express = require('express');
const app = express();
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');

var serviceAccount = require("./key.json");

initializeApp({
  credential: cert(serviceAccount),
});
const db = getFirestore();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));


app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/signin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signin.html'));
});

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.post('/signupsubmit', (req, res) => {
  const firstName = req.body.first_name;
  const lastName = req.body.last_name;
  const email = req.body.email;
  const password = req.body.password;

  db.collection('users').add({
    Name: firstName + ' ' + lastName,
    email: email,
    password: password
  })
  .then(() => {
    res.sendFile(path.join(__dirname, 'public', 'signin.html'));
  })
  .catch(err => {
    console.error('Error adding user:', err);
    res.status(500).send('Error during signup.');
  });
});

app.post('/signinsubmit', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  db.collection('users').where('email', '==', email).get()
    .then(snapshot => {
      if (snapshot.empty) {
        res.send('No matching documents.');
        return;
      }
      let authenticated = false;
      snapshot.forEach(doc => {
        if (doc.data().password === password) {
          authenticated = true;
          res.redirect('/home');
        }
      });
      if (!authenticated) {
        res.send('Incorrect password.');
      }
    })
    .catch(err => {
      console.log('Error getting documents', err);
      res.status(500).send('Error getting documents');
    });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
