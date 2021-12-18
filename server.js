require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongo = require('mongodb');
const mongoose = require('mongoose');
const validUrl = require('valid-url');
const bodyParser = require('body-parser');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


//db connection
const mySecret = process.env['Dburl'];
mongoose.connect(mySecret, (err) => {
  if(err) {
    console.log("Db connect error : ", err); 
  } else { 
    console.log('DB Connected');
  }
});

//schema & model
const urlSchema = new mongoose.Schema({
  longUrl : { type: String, required : true},
  shortUrl : String
});
const urlModel = mongoose.model('urlModel', urlSchema);

//fetch functions
const getLongUrl = async (req,res) => {
  const sid = req.params.sid;
  console.log(sid);
  const longurl = await urlModel.findOne({shortUrl:sid});
  if(longurl){
    return res.redirect(longurl.longUrl);
  } else {
    return res.status(404).json('No URL found');
  }

};

//create function
const setShortUrl = async (req, res) => {
  let lurl = req.body.url;
  // console.log("lurl : ",lurl);
  if(validUrl.isWebUri(lurl)) {
    try {
       let surl = urlModel.countDocuments({});
    surl+=1;
    const data = await urlModel.create({longUrl:lurl, shortUrl:surl});
    [lurl, surl] = [data.longUrl, data.shortUrl];
    res.json({original_url:lurl, short_url:surl});
    // res.json('sec');
    } catch (err){
      res.json('serv');
    }
   
  } else {
    res.json({error:"invalid url"});
  }
}


//

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


//url shortener api
app.post('/api/shorturl', setShortUrl);

//getch long url
app.get('/api/shorturl/:sid?', getLongUrl);

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
