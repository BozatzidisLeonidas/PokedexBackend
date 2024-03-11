const { ObjectId } = require("mongodb");

const getUserfromSessionToken = async (sessionToken) => {
  try {
    const sessionTokenDB = await db.collection("Session").findOne({ token: sessionToken });

    if (sessionTokenDB) {
      const userId = new ObjectId(sessionTokenDB.userID);
      const user = await db.collection("Users").findOne({ _id: userId });
      return user;
    } else {
      return null;
    }
  } catch (err) {
    console.error("Error fetching user from session token:", err);
    throw err;
  }
};

module.exports = { getUserfromSessionToken };
