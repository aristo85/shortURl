//Timestamp API check it with nodemon and postman
var express = require('express');
let bodyParser = require('body-parser');
let cors = require('cors');
const ValidUrl = require('./mongodb/dataBase')
const dns = require('dns');
const urlexists = require('url-exists');

var app = express();
app.set('view engine', 'pug');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());

//alows node to find static documents
app.get('/', (req, res) => {
    res.render('index')
})

app.get('/api/shorturl/:short', (req, res) => {
    ValidUrl.find({shorterUrl: req.params.short}, (err, data) => {
        if (err) console.log(err);
        let validUrl = data[0].validUrl
        console.log(validUrl);
        return res.redirect(`${validUrl}`)
    })
})

app.post('/api/shorturl/new', (req, res) => {
    let inputUrl = req.body.url;
    const reg = new RegExp("^(http|https)://", "i");

    if(reg.test(inputUrl)){
        urlexists(inputUrl, (err, exist) => {
            console.log(exist);
            return (exist) ? createAndSaveUrl()
                : res.json({"error":"invalid Hostname"})
        });

    }
    else{
        return res.json({"error":"invalid URL"});
    }

    let createAndSaveUrl = function() {
        ValidUrl.find({validUrl: inputUrl}, (err, data) => {
            if(err) return err;
            if (data[0] === undefined) {
                let short = Math.floor(Math.random()*1000).toString();
                let checkedUrl = new ValidUrl({
                    validUrl: inputUrl,
                    shorterUrl: short
                });

                checkedUrl.save((errSave, dataSave) => {
                    if (errSave) return console.log(errSave);
                    console.log('saved to database');
                    return res.json({
                        "original_url":dataSave.validUrl,
                        "short_url":dataSave.shorterUrl
                    });
                });
            } else {
                let foundUrl = data[0]
                return res.json({
                    "original_url": foundUrl.validUrl,
                    "short_url": foundUrl.shorterUrl
                })
            }
        })
    };

});

app.listen(process.env.PORT || 3000, () => {
    console.log('working all');
})

module.exports = app;