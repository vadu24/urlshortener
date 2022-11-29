require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

let urlSchema = new mongoose.Schema({
  original: {type: String, requred: true},
  short: Number
})

let Url = mongoose.model('Url', urlSchema)

let bodyParser = require('body-parser')
let responseObject = {}
app.post('/api/shorturl', bodyParser.urlencoded({extended: false}), (request, response)=>{
  let inputUrl = request.body['url']
  responseObject['original_url'] = inputUrl

  let inputShort = 1
  Url.findOne({})
    .sort({short: 'desc'})
    .exec((error, result)=>{
      if(!error && result != undefined){
        inputShort = result.short + 1
      }
      if(!error){
        Url.findOneAndUpdate(
          {original: inputUrl},
          {original: inputUrl, short: inputShort},
          {new: true, upsert: true},
          (error, savedUrl)=>{
            if(!error){
              responseObject['short_url'] = savedUrl.short
              response.json(responseObject)
            }
          }
        )
      }
    })
    //response.json(responseObject)
})

app.get('/api/shorturl/:short_url', (request, response)=>{
  let short_url = request.params.short_url
  Url.findOne({short: short_url}, (error, result)=>{
    if(!error && result != undefined){
      response.redirect(result.original)
    }else{
      response.json('URL is not found')
    }
  })
})