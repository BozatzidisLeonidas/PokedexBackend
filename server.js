const express = require("express")
const bodyParser = require('body-parser')

const app = express();
app.use(bodyParser.json());

const database = {
    users:[
        {
            id:'123',
            name:'John',
            email:'john@gmail.com',
            password:'john',
            pokemonList:[1,2,3,4,5,6]
        }
    ]
}

app.get('/', (req,res)=>{
    res.send('This is working');
})

app.post('/signin',(req,res) =>{
    if (req.body.email === database.users[0].email && req.body.password === database.users[0].password){
        res.json('success')
    }else{
        res.status(400).json("error loggin in")
    }
})

app.post('/register', (req,res) => {
    const { email, name, password}= req.body;
    database.users.push({
        id:'123',
        name: name,
        email: email,
        password: password,
        pokemonList: [2,3,4,5,6,7]
    })
    res.json(database.users[database.users.length-1])
})

app.get('/profile/:id', (req,res) => {
    const { id } = req.params;
    let found = false;
    database.users.forEach(user =>{
        if (user.id===id){
            found = true;
            return res.json(user);
        }
    })
    if(!found){
        res.status(404).json("No such Trainer!")
    }
})

getUser=(id) => {
    return {
        id:'123',
        name:'John',
        email:'john@gmail.com',
        password:'john',
        pokemonList:["Pika","Pik","Piki","Pikq","Pikf","pikaa"]
    }
}


app.post('/checkForCatch', (req, res) => { // <-- Corrected here
    try {
        const { id, pokemontoCatch } = req.body;
        const user = getUser(id);
        const pokemonList = user.pokemonList;

        if (pokemonList.includes(pokemontoCatch)) {
            res.json({ success: true, message: "You already have this Pokemon" });
        } else {
            if (pokemonList.length >= 6) {
                res.json({ success: true, message: "Your Pokemon list is full" });
            } else {
                pokemonList.push(pokemontoCatch);
                res.json({ success: true, message: "Congratulations! You caught a new Pokemon", data: pokemonList });
            }
        }
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});




app.listen(3000, ()=>{
    console.log("Listening port 3000")
})