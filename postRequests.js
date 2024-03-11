const express = require('express');
const router =express.Router();
const { getUserfromSessionToken } = require('./helperFunctions');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const saltRounds = 10;

router.post('/register', async (req, res) => {
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

router.post('/signin', async (req,res) => {
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

router.post('/signout', async (req, res) => {
  try {
    const { sessionToken } = req.body;

    const sessionData = await db.collection("Session").findOne({ token: sessionToken });

    if (sessionData) {
        await db.collection("Session").deleteOne({ _id: sessionData._id });
  
        return res.json({ success: true, message: "Successfully signed out" });
      } else {
        // If session data is not found, return an error message
        return res.status(404).json({ success: false, message: "Session data not found" });
      }
  } catch (err) {
    console.error("Error signing out:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.post('/catchPokemon', async (req, res) => {
  const { pokemonName, sessionToken } = req.body;
  try {
    
    const user = await getUserfromSessionToken(sessionToken);

    if (!user) {
      console.log("Session token not found in the database or doesn't match");
      return res.json({ success: false, message: "Session token not found or doesn't match" });
    }

    const pokemonList = user.pokemonList;

    if (pokemonList.includes(pokemonName)) {
      res.json({ success: false, message: "You already have this Pokemon" });
    } else {
      if (pokemonList.length >= 6) {
        res.json({ success: false, message: "Your Pokemon list is full", pokemonList:pokemonList });
      } else {
        pokemonList.push(pokemonName); 
        await db.collection("Users").updateOne({ _id: user._id }, { $set: { pokemonList: pokemonList } });
        return res.json({ success: true, message: "Congratulations! You caught a new Pokemon", data: pokemonList });
      }
    }

  } catch (err) {
    console.log("Error:", err);
    res.status(500).json({success:false, message: 'Error in catchPokemon endpoint'});
  }
});

router.post('/replacePokemon', async (req, res) => {

  const { pokemon, selectedPokemon , sessionToken} = req.body;
  try{
    const user = await getUserfromSessionToken(sessionToken);
    
    const index = user.pokemonList.indexOf(pokemon);

    user.pokemonList[index] = selectedPokemon;

    await db.collection("Users").updateOne(
      { _id: user._id },
      { $set: { pokemonList: user.pokemonList } }
    );

    res.json({ success: true, message: "Pokemon replaced successfully", data: user.pokemonList });  
  }catch(err){
    console.log("Error: catching Pokemon", err);
    res.status(500).json({success:false, message: 'Error in replacePokemon endpoint'});
  } 
});

router.post('/userData', async (req, res) => {
  try {
    const sessionToken  = req.body.sessionToken;
    const user = await getUserfromSessionToken(sessionToken);

    if (user) {
      res.json({ success: true, userName: user.name, pokemonList: user.pokemonList });
    } else {
      res.json({ success: false, message: "User not found" });
    }

  } catch (err) {
    console.error("Error fetching user data:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;