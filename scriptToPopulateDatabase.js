const express = require("express")
const bodyParser = require('body-parser')
const { MongoClient, ServerApiVersion } = require("mongodb");
const session = require('express-session');
const fetch = require('node-fetch');
const app = express();

// This is a script used once to populate the collection named AllPokemonCollection with Pokemon and the info i want displayed in my application//

app.use(bodyParser.json());

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
  }));
  
  const uri = "mongodb+srv://admin:43904390Aekara21@pokebase.thiu0kf.mongodb.net/"

  let db;

  MongoClient.connect(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    })
    .then(async client => {
        db = client.db("PokeBaseDB");

        await fetchData();

        app.listen(3000, () => {
            console.log('Server is running on port 3000');
        });
    })
    .catch(error => {
        console.error('Error connecting to MongoDB:', error);
    });

    app.get('/', (req, res) => {
        res.json({ message: 'This is working with server.js' });
    });

    async function fetchData() {
        try {
            const promises = [];
    
            for (let i = 1; i <= 1025; i++) {
                const url = `https://pokeapi.co/api/v2/pokemon/${i}`;
                promises.push(fetch(url).then((res) => res.json()));
            }
    
            const results = await Promise.all(promises);
    
            const formattedPokemon = results.map((data) => {
                
                data.name=data.name.charAt(0).toUpperCase()+data.name.slice(1);
                data.id = data.id;
                data.weight=parseFloat(data.weight.toString().slice(0, -1) + '.' + data.weight.toString().slice(-1));
                data.height=parseFloat(data.height.toString().slice(0, -1) + '.' + data.height.toString().slice(-1));
                
                return {
                    name: data.name,
                    id: data.id,
                    image: data.sprites['front_default'],
                    weight: data.weight,
                    height: data.height,
                    type: data.types.map((type) => type.type.name),
                    stats: data.stats.map(function (stat) {
                        return {
                            name: stat.stat.name, //stats[0-6].stat.name
                            base_stat: stat.base_stat,
                        };
                    }),
                };
            });
    
            const collection = db.collection("AllPokemonCollection");
            await collection.insertMany(formattedPokemon);
    
            console.log('Data has been populated successfully.');
    
        } catch (error) {
            console.error('Error fetching and populating data:', error);
        }
    }

    //Needed for quick removal of all entries in my database//
    app.delete('/deleteAllPokemon', async (req, res) => {
        try {
          await db.collection("AllPokemonCollection").deleteMany({});
          
          res.json({ success: true, message: "All data deleted successfully" });
        } catch (err) {
          res.status(500).json({ success: false, message: err.message });
        }
      });
      