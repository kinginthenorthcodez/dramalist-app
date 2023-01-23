const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const express = require('express');

//App setup
const app = express();
dotenv.config();
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));

//Database connection
let db;

//Routes
app.get('/', async (req, res) => {
  let dramas = await db.collection('cdramas').find({}).toArray();
  console.log('DATA: ', dramas);
  res.render('home', { dramas: dramas });
});

app.get('/admin', (req, res) => {
  res.render('admin');
});

//API Json

app.get('/api/dramas', async (req, res) => {
  let dramas = await db.collection('cdramas').find({}).toArray();
  console.log('DATA: ', dramas);
  res.json(dramas);
});

//Database connection
async function start() {
  try {
    const client = new MongoClient(process.env.URL);
    await client.connect();
    db = client.db();
    app.listen(3000, () => {
      console.log('Server running on port 3000!');
    });
  } catch (e) {
    console.error(e);
  } finally {
    console.log('Ok let go!');
  }
}
start();
