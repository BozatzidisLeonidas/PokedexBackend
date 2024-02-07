const express = require("express")
const bodyParser = require('body-parser')
const { MongoClient, ServerApiVersion } = require("mongodb");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
// const cookieParser = require('cookie-parser')
const saltRounds = 10;
const app = express();

// const uri = "mongodb+srv://admin:43904390Aekara21@pokebase.thiu0kf.mongodb.net/?retryWrites=true&w=majority"
app.use(bodyParser.json());
app.use(cors())
// app.use(cookieParser())

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

    const user = await db.collection("Users").findOne({ email });

    if (!user){
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const accessToken=jwt.sign({id:user.id}, "mySecretKey")

    console.log("User Found");
    const { name } = user;
    res.json({ success: true, message: `Welcome ${name}, Access token: ${accessToken}` });

  }catch (err) {
        res.json({ success: false, message: err.message });
    }
})

app.post('/catchPokemon', async (req,res) => {
  try{
    const { email, pokemonToCatch } = req.body;
    const user = await db.collection("Users").findOne({ email });
    user.pokemonList.push(pokemonToCatch);
    await db.collection("Users").updateOne({ email: email }, { $set: { pokemonList: user.pokemonList } });

    if (pokemonList.includes(pokemonToCatch)) {
      res.json({ success: true, message: "You already have this Pokemon" });
      } else
  
    res.json({ success: true, message: `Added ${pokemonToCatch} to ${email}'s pokemonList`, pokemonList: user.pokemonList });
    // const pokemondb = await db.collection("Users").findOne({ pokemonList }).toArray();
    // res.json({ success: true, pokemondb });


  }catch (err) {
        res.json({ success: false, message: err.message });
    }
})

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



app.listen(3000, () => {
  console.log("Listening on port 3000");
});