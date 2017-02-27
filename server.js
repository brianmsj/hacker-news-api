const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

mongoose.Promise = global.Promise;

const DATABASE_URL = process.env.DATABASE_URL ||
                     global.DATABASE_URL ||
                     'mongodb://localhost/hn-api';
const PORT = process.env.PORT || 8080;

const app = express();
const {Story} = require('./model');
app.use(bodyParser.json());


//--------------------------------------------POST---------------------------
app.post('/stories/', (req, res) => {
  const requiredFields = ['title', 'url'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const msg = `Missing ${field} in request body`
      console.error(msg);
      return res.status(400).send(msg);
    }
  }

  Story
    .create({
      title: req.body.title,
      url: req.body.url,
    })
    .then(story => res.status(201).json(story.apiRepr()))
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'There is an issue'});
    });
});


app.get('/stories', (req, res) => {
  Story
  .find().limit(3).sort({votes: -1})
  .exec()
  .then(stories => {
      res.json(stories.map(story => story.apiRepr()));
    })
    .catch (err => {
      console.log(err)
      res.status(500).json({error: 'something is wrong'});
    });
});


app.put('/stories/:id', (req, res) => {

  Story
  .findByIdAndUpdate(req.params.id, {$inc: {votes: 1}})
  .exec()
  .then(updatedStory => res.status(204).end())
  .catch(err => res.status(500).json({message: 'No Content status, no response body'}));
});


let server;
function runServer() {
  return new Promise((resolve, reject) => {
    mongoose.connect(DATABASE_URL, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(PORT, () => {
        console.log(`Your app is listening on port ${PORT}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
     return new Promise((resolve, reject) => {
       console.log('Closing server');
       server.close(err => {
           if (err) {
               return reject(err);
           }
           resolve();
       });
     });
  });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};
