const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require('cors');
const session = require('express-session');
const getRequestsRouter = require('./getRequests');
const deleteRequestsRouter = require('./deleteRequests');
const postRequestsRouter = require('./postRequests');

app.use(bodyParser.json());
app.use(cors());

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));

const uri = "mongodb+srv://admin:43904390Aekara21@pokebase.thiu0kf.mongodb.net/"

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


client.connect().then(function (connection) {
    global.db = connection.db("PokeBaseDB");
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
}); 

app.use('/', getRequestsRouter);
app.use('/', deleteRequestsRouter);
app.use('/', postRequestsRouter);


