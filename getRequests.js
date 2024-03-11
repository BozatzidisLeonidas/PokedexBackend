const express = require('express');
const router =express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'This is working' });
});

router.get('/checkMongoUsers', async (req, res) => {
    try {
      const usersCollection = db.collection("Users");
      const users = await usersCollection.find().toArray();
      res.json({ success: true, users });
    }catch(err){
        res.json({ success: false, message: err.message });
    }
});

router.get('/pokemonList', async (req,res) => {
    try{
      const pokemonCollection = db.collection("AllPokemonCollection");
      const pokemon = await pokemonCollection.find().sort({id: 1}).toArray();
      res.json({ success: true, pokemon });
    }catch(err){
        res.json({ success: false, message: err.message });
    }
})

module.exports = router;