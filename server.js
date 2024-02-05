const express = require("express")
const bodyParser = require('body-parser')
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
// const uri = "mongodb+srv://admin:43904390Aekara21@pokebase.thiu0kf.mongodb.net/?retryWrites=true&w=majority"
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

app.use(bodyParser.json());

app.get('/', (req,res)=>{
    res.send('This is working');
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
            return res.json({ success: false, message: "Missing params" });
        }
        
        const existingUser = await db.collection("Users").findOne({ email });

        if (existingUser) {
            return res.json({ success: false, message: "Email already exists in the database" });
        }

        const user = {
            name: name,
            email: email,
            password: password,
            pokemonList: []
        }

        const savedUser = await db.collection("Users").insertOne(user);

        res.json({ success: true, message: `Welcome ${name}`, data: savedUser });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});


app.post('/signin', async (req,res) => {
    const users = await db.collection("Users").find().toArray();
    console.log(users);
    
})

// app.get('/profile/:id', (req,res) => {
//     const { id } = req.params;
//     let found = false;
//     database.users.forEach(user =>{
//         if (user.id===id){
//             found = true;
//             return res.json(user);
//         }
//     })
//     if(!found){
//         res.status(404).json("No such Trainer!")
//     }
// })

// getUser=(id) => {
//     return {
//         id:'123',
//         name:'John',
//         email:'john@gmail.com',
//         password:'john',
//         pokemonList:["Pika","Pik","Piki","Pikq","Pikf","pasd"]
//     }
// }


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