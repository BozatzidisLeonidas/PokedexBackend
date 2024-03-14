# PokeBase Backend

This is the backend server for the PokeBase application, which provides RESTful API endpoints for user authentication, managing user data, and handling Pokemon-related operations.

## IMPORTANT

To obtain the necessary environment variables for your backend server configuration, please reach out to me directly. I will provide you with the .env file containing the required variables (DB_URI, SESSION_SECRET, PORT). You can contact me via email at bozatzidisleonidas@gmail.com. Once you get in touch with me, I will promptly send you the .env file so you can configure your backend server accordingly.


## Technologies Used

- Node.js
- Express.js
- MongoDB
- bcrypt

## Run Locally

Clone the repository:

```bash
git clone https://github.com/BozatzidisLeonidas/PokedexBackend.git
```

Install Dependencies:

```bash
cd PokeBase-Backend
npm install
```

## Running the Server

Run the following command to start the server:

```bash
npm start
```
The server will start running on port 3000 by default, or on the port specified in the .env file.

# API Endpoints

## User Authentication.
-POST /register: Register a new user.
-POST /signin: Sign in an existing user.
-POST /signout: Sign out the current user.

## User Data Management.
-POST /userData: Fetch user data.
-POST /catchPokemon: Catch a new Pokemon.
-POST /replacePokemon: Replace an existing Pokemon.
-GET /checkMongoUsers: Check MongoDB users.
-GET /pokemonList: Get the list of Pokemon.

## Data Management.
-DELETE /deleteAllUsers: Delete all users from the database.
-DELETE /deleteAllSessions: Delete all session data.

## License

This project is licensed under the MIT License.