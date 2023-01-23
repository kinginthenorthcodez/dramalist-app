const { MongoClient, ObjectId } = require('mongodb');
const dotenv = require('dotenv');
const express = require('express');
const multer = require('multer');
const sanitizeHtml = require('sanitize-html');
const fse = require('fs-extra');
const sharp = require('sharp');
const path = require('path');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const DramaCard = require('./src/components/DramaCard').default;

//App setup
const app = express();
const upload = multer();
dotenv.config();
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Database connection
let db;
// Setup photo directory uploads on start

fse.ensureDirSync(path.join('public', 'uploaded-photos'));
//Middleware
function passwordProtected(req, res, next) {
  res.set('WWW-Authenticate', "Basic realm='Drama List App'");
  if (req.headers.authorization == process.env.PWD) {
    next();
  } else {
    console.log(req.headers.authorization);
    res.status(401).send('Only authorized user allowed.Try Agian!');
  }
}
//Routes
app.get('/', async (req, res) => {
  let dramas = await db.collection('cdramas').find({}).toArray();
  const generatedHtml = ReactDOMServer.renderToString(
    <div className='container'>
      {!dramas.length && <p>No dramas yet, Admin will upload soon!</p>}
      <div className='drama-grid mb-3'>
        {dramas.map((drama) => (
          <DramaCard
            key={drama._id}
            drama={drama}
            photo={drama.photo}
            readOnly={true}
          />
        ))}
      </div>
      <p>
        <a href='/admin'>Login/manage drama list</a>
      </p>
    </div>
  );
  res.render('home', { generatedHtml });
});

app.use(passwordProtected);
app.get('/admin', (req, res) => {
  res.render('admin');
});

app.post('/create-drama', upload.single('photo'), cleanUp, async (req, res) => {
  if (req.file) {
    const photoFileName = `${Date.now()}.jpg`;
    console.log('Photo:', photoFileName);
    await sharp(req.file.buffer)
      .resize(844, 456)
      .jpeg({ quality: 60 })
      .toFile(path.join('public', 'uploaded-photos', photoFileName));
    req.cleanData.photo = photoFileName;
  }
  console.log(req.body);
  const data = await db.collection('cdramas').insertOne(req.cleanData);
  const newData = await db
    .collection('cdramas')
    .findOne({ _id: new ObjectId(data.insertedId) });
  res.send(newData);
});

app.post('/update-drama', upload.single('photo'), cleanUp, async (req, res) => {
  if (req.file) {
    // if they are uploading a new photo
    const photoFileName = `${Date.now()}.jpg`;
    await sharp(req.file.buffer)
      .resize(844, 456)
      .jpeg({ quality: 60 })
      .toFile(path.join('public', 'uploaded-photos', photoFileName));
    req.cleanData.photo = photoFileName;
    const info = await db
      .collection('cdramas')
      .findOneAndUpdate(
        { _id: new ObjectId(req.body._id) },
        { $set: req.cleanData }
      );
    if (info.value.photo) {
      fse.remove(path.join('public', 'uploaded-photos', info.value.photo));
    }
    res.send(photoFileName);
  } else {
    // if they are not uploading a new photo
    db.collection('cdramas').findOneAndUpdate(
      { _id: new ObjectId(req.body._id) },
      { $set: req.cleanData }
    );
    res.send(false);
  }
});

app.delete('/dramas/:id', async (req, res) => {
  if (typeof req.params.id !== 'string') req.params.id = '';
  const doc = db
    .collection('cdramas')
    .findOne({ _id: new ObjectId(req.params.id) });
  if (doc.photo) {
    fse.remove(path.join('public', 'uploaded-photos', doc.photo));
  }
  db.collection('cdramas').deleteOne({ _id: new ObjectId(req.params.id) });
  res.send('Drama succussfully deleted!');
});
//API Json

app.get('/api/dramas', async (req, res) => {
  let dramas = await db.collection('cdramas').find({}).toArray();
  console.log('DATA: ', dramas);
  res.json(dramas);
});

//Clean function middleware

function cleanUp(req, res, next) {
  if (typeof req.body.name !== 'string') req.body.name = '';
  if (typeof req.body.type !== 'string') req.body.type = '';
  if (typeof req.body.genre !== 'string') req.body.genre = '';
  if (typeof req.body._id !== 'string') req.body._id = '';

  req.cleanData = {
    name: sanitizeHtml(req.body.name.trim(), {
      allowedTags: [],
      allowedAttributes: {},
    }),
    type: sanitizeHtml(req.body.type.trim(), {
      allowedTags: [],
      allowedAttributes: {},
    }),
    genre: sanitizeHtml(req.body.genre.trim(), {
      allowedTags: [],
      allowedAttributes: {},
    }),
  };

  next();
}
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
