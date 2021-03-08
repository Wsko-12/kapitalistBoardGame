const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://wsko:${process.env.MONGO}@cluster0.4k9xp.mongodb.net/kapitalistDB?retryWrites=true&w=majority`;
let DBConnection;
module.exports.connectToDB = async function connectToDB() {
  DBConnection = await MongoClient.connect(uri, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  });
  return;
};;

module.exports.AUTH_findLogin = async function findOne(login) {
  try {
    const query = {
      login: login
    };
    const result = await DBConnection.db('kapitalistDB').collection('users').findOne(query);
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    // client.close();
  };
};
module.exports.AUTH_registerOne = async function registerOne(userRegPack) {
  try {
    return await DBConnection.db('kapitalistDB').collection('users').insertOne(userRegPack);
  } catch (err) {
    // console.log(err);
  };
};
module.exports.PLAYER_new = async function saveNewPlayer(player) {
  try {
    const result = await DBConnection.db('kapitalistDB').collection('players').insertOne(player);
    return result;

  } catch (err) {} finally {
    // client.close();
  };
};
module.exports.PLAYER_find = async function findOne(login) {
  try {
    const query = {
      login: login
    };
    const result = await DBConnection.db('kapitalistDB').collection('players').findOne(query);
    return result;

  } catch (err) {
    // console.log(err);
  } finally {
    // client.close();
  };
};
module.exports.PLAYER_updateFriendsRequests = async function FriendsRequests(login,updatedRequestsArr){
  try {
    const query = {
      login: login
    };
    const result = await DBConnection.db('kapitalistDB').collection('players').updateOne(query,{$set: { 'friends.requests' : updatedRequestsArr  }},{new:true})
    return result;
  } catch (err) {
    // console.log(err);
  }finally{
  };
};
module.exports.PLAYER_updateFriendsSends = async function FriendsSends(login,updatedSendsArr){
  try {
    const query = {
      login: login
    };
    const result = await DBConnection.db('kapitalistDB').collection('players').updateOne(query,{$set: { 'friends.sends' : updatedSendsArr  }},{new:true})
    return result;
  } catch (err) {
    // console.log(err);
  }finally{
  };
};
module.exports.PLAYER_updateFriends = async function FriendsSends(login,updatedFriendsArr){
  try {
    const query = {
      login: login
    };
    const result = await DBConnection.db('kapitalistDB').collection('players').updateOne(query,{$set: { 'friends.all.all' : updatedFriendsArr }},{new:true})
    return result;
  } catch (err) {
    // console.log(err);
  }finally{
  };
};
