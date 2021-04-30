//Install packages by typing "npm install" in terminal
const http = require('http');
const fs = require('fs');
const morgan = require('morgan');
const url = require('url');
//mongoDBdatabase
const mongoose = require('mongoose');
const Conversation = require('./models/conversation');
const { SSL_OP_TLS_BLOCK_PADDING_BUG } = require('constants');
//visual
const express = require('express');
const app = express();
const server = http.createServer(app);




//connection to mongoDB
const dbURI = 'mongodb+srv://admin1:admin1@cluster0.swbkf.mongodb.net/chathub?retryWrites=true&w=majority';
mongoose.connect(dbURI, {useNewUrlParser: true, useUnifiedTopology: true})
    .then((result) => server.listen(3000, () => {
        console.log('listening on *:3000');
    }))
    .catch((err) => console.log('som ting wong: ', err));

//View engine
app.set('view engine', 'ejs');
app.use(express.static(__dirname));

//middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true}));
app.use(morgan('dev'));

//random key genereator
function getRandomString(length) {
    var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var result = '';
    for ( var i = 0; i < length; i++ ) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return result;
}


app.get('/', (req, res) => {
    res.render('homepage');
})

//loading website
app.use('/join', (req, res) => {
    res.render('join', {data: req.body});
});

//creating new room
app.use('/create', (req, res) => {
    let roomkey = getRandomString(5);
    //Making new Conversation based on mongoose schema
    let conversation = new Conversation({ 
        id: roomkey,
        messages: []
    });
    conversation.save() //Conversation is added to database
    res.render('create',{data: req.body, id: roomkey});
})


app.use('/joinorcreate', (req, res) =>{
    res.render('joinOrCreate', {data: req.body});
});

//reciving roomkey
app.use('/joinroom', (req, res) =>{
    res.redirect(307, '/room');
});

app.use('/room', (req, res) => {
    //in the chatroom
    if(req.body.roomkey !== undefined){
        //Joining a room
        Conversation.find()
            .then((result) => {
                let foundConv = false;
                result.forEach((conv)=>{
                    if(conv.id == req.body.roomkey){
                        foundConv = true;
                        res.render('chatRoom', {data: conv, name: req.body});
                    }
                })
                if(foundConv == false){
                    res.redirect(307, 'join');
                }
            })
            .catch((err) => {
                console.log(err)
            });
    }
    else if(req.body.name !== undefined){
        //sending a message
        let message = {user: req.body.name, message: req.body.message};
        Conversation.updateOne(
            {id: req.body.id},
            {$push: {messages: message}}
        )
            .then(Conversation.find()
                .then((result) => {
                    let foundConv = false;
                    result.forEach((conv)=>{
                        if(conv.id == req.body.id){
                            foundConv = true;
                            res.render('chatRoom', {data: conv, name: req.body});
                        }
                    })
                    if(foundConv == false){
                        res.redirect(307, 'join');
                    }
                })
                .catch((err) => {
                    console.log(err)
                })
            )
        }
    else{
        res.render('404');
    }
})


app.get('/404', (req, res)=>{
    res.render('404');
});


app.use((req, res) => {
    res.redirect('/404');
});