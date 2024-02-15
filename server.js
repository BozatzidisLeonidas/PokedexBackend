const express = require("express")
const bodyParser = require('body-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto')
const cors = require('cors');
const flash = require('connect-flash');
const session = require('express-session');
const saltRounds = 10;
const app = express();


app.use(bodyParser.json());
app.use(cors());

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));
app.use(flash());

const uri = "mongodb+srv://admin:43904390Aekara21@pokebase.thiu0kf.mongodb.net/"

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;

client.connect().then(function (connection) {
    db = connection.db("PokeBaseDB");
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
}); 

app.get('/', (req,res)=>{
    res.json({ message: 'This is working' });
})

app.get('/checkMongoUsers', async (req, res) => {
  try {
    const usersCollection = db.collection("Users");
    const users = await usersCollection.find().toArray();
    res.json({ success: true, users });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

app.delete('/deleteAllUsers', async (req, res) => {
  try {
    await db.collection("Users").deleteMany({});
    
    res.json({ success: true, message: "All data deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/deleteAllSession', async (req, res) => {
  try {
    await db.collection("Session").deleteMany({});
    
    res.json({ success: true, message: "All data deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/pokemonList', async (req,res) => {
  try{
    const pokemonCollection = db.collection("AllPokemonCollection");
    const pokemon = await pokemonCollection.find().sort({id: 1}).toArray();
    res.json({ success: true, pokemon });
  }catch (err) {
        res.json({ success: false, message: err.message });
    }
})


app.post('/register', async (req, res) => {
    try {
        const { email, name, password } = req.body;

        if (!email || !name || !password) {
            return res.status(400).json({ success: false, message: "Missing params" });
        }
        
        const existingUser = await db.collection("Users").findOne({ email });

        if (existingUser) {
            return res.json({ success: false, message: "Email already exists in the database" });
        }
        
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = {
            name: name,
            email: email,
            password: hashedPassword,
            pokemonList: []
        }

        const savedUser = await db.collection("Users").insertOne(user);

        res.json({ success: true, message: `Welcome ${name}`, data: savedUser });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});


app.post('/signin', async (req,res) => {
  try{
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Missing params" });
    }

    const user = await db.collection("Users").findOne({ email },{name:1 ,password:1, pokemonList:1});

    if (!user){
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // const accessToken=jwt.sign({id:user.id}, "mySecretKey")

    console.log("User Found");

    const sessionToken = crypto.randomBytes(16).toString('base64')
    

    const sessionData = {
      userID:user._id.toString(),
      token:sessionToken
    }

   await db.collection("Session").insertOne(sessionData) 

   const responseData = { 
      success: true, 
      data:{
        name:user.name,
        list:user.pokemonList,
        token:sessionToken
      }
    }

    console.log(responseData)
    res.json(responseData);

  }catch (err) {
        res.json({ success: false, message: err.message });
    }
})

app.post('/signout', async (req, res) => {
  try {
    await db.collection("Session").findOne(sessionData)

    await db.collection("Session").deleteOne({ token });

    res.json({ success: true, message: "Successfully signed out" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/catchPokemon', async (req, res) => {
  const { pokemonName, sessionToken } = req.body;
  try {
    const sessionTokenDB = await db.collection("Session").findOne({ token: sessionToken });

    if (sessionTokenDB && sessionTokenDB.token === sessionToken) {
      console.log("success");
      const userId = sessionTokenDB.userID;
      const user = await db.collection("Users").findOne({ _id: new ObjectId(userId) });
      const pokemonList = user.pokemonList;

      if (pokemonList.includes(pokemonName)) {
        res.json({ success: false, message: "You already have this Pokemon" });
      } else {
        if (pokemonList.length >= 6) {
          res.json({ success: false, message: "Your Pokemon list is full", pokemonList:pokemonList });
        } else {
          pokemonList.push(pokemonName); 
          await db.collection("Users").updateOne({ _id: new ObjectId(userId) }, { $set: { pokemonList: pokemonList } });
          res.json({ success: true, message: "Congratulations! You caught a new Pokemon", data: pokemonList });
        }
      }
    } else {
      console.log("Session token not found in the database or doesn't match");
      res.json({ success: false, message: "Session token not found or doesn't match" });
    }
  } catch (err) {
    console.error("Error occurred while querying the database:", err);
    res.json({ success: false, message: err.message });
  }
});

app.post('/replacePokemon', async (req, res) => {
  const { pokemon, selectedPokemon } = req.body;
  
  try {
    const result = await db.collection("Users").updateOne(
      { pokemonList: pokemon },
      { $set: { "pokemonList.$": selectedPokemon } }
    );

    if (result.matchedCount === 1 && result.modifiedCount === 1) {
      res.json({ success: true, message: 'Pokemon replaced successfully' });
    } else {
      res.json({ success: false, message: 'Pokemon not found or not replaced' });
    }
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});
