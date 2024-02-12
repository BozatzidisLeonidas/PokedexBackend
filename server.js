const express = require("express")
const bodyParser = require('body-parser')
const { MongoClient, ServerApiVersion } = require("mongodb");
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
    const pokemon = await pokemonCollection.find().toArray();
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
      userID:user._id ,
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



// app.post('/checkForCatch', (req, res) => {
//     try {
//         const { id, pokemonToCatch } = req.body; 
//         const user = getUser(id);
//         const pokemonList = user.pokemonList;

//         if (pokemonList.includes(pokemonToCatch)) {
//             res.json({ success: true, message: "You already have this Pokemon" });
//         } else {
//             if (pokemonList.length >= 6) {
//                 res.json({ success: true, message: "Your Pokemon list is full" });
//             } else {
//                 pokemonList.push(pokemonToCatch);
//                 res.json({ success: true, message: "Congratulations! You caught a new Pokemon", data: pokemonList });
//             }
//         }
//     } catch (err) {
//         res.json({ success: false, message: err.message });
//     }
// });

// app.post('/replacePokemon', (req, res) => {
//     try {
//         const { id, pokemonToCatch, pokemonToRemove } = req.body;
//         const user = getUser(id);
//         const pokemonList = user.pokemonList;

//         if (pokemonList.includes(pokemonToCatch)) {
//             return res.json({ success: true, message: "You already have this Pokemon" });
//         }

//         const indexOfPokemonToRemove = pokemonList.indexOf(pokemonToRemove);

//         if (indexOfPokemonToRemove !== -1 && indexOfPokemonToRemove < pokemonList.length) {
//             pokemonList[indexOfPokemonToRemove] = pokemonToCatch;
//             return res.json({ success: true, message: "Pokemon replaced successfully", data: pokemonList });
//         } else {
//             return res.json({ success: false, message: "Pokemon to remove not found in the list" });
//         }
//     } catch (err) {
//         res.json({ success: false, message: err.message });
//     }
// });
