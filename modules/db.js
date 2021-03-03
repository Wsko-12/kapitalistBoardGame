const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://wsko:${process.env.MONGO}@cluster0.4k9xp.mongodb.net/kapitalistDB?retryWrites=true&w=majority'`;


let DBConnection;





module.exports.connectToDB = async function connectToDB(){
  DBConnection = await MongoClient.connect(uri,{useUnifiedTopology:true,useNewUrlParser:true});



  return;
};;

module.exports.AUTH_findLogin = async function findOne(login) {
    try {
        const query = { login: login }
        const result = await DBConnection.db('kapitalistDB').collection('users').findOne(query);

        return result;

    } catch (err) {
        console.log(err);
    } finally {
        // client.close();
    }
}

module.exports.AUTH_registerOne = async function registerOne(userRegPack) {
    try {
        const result = await DBConnection.db('kapitalistDB').collection('users').insertOne(userRegPack);
        return result;

    } catch (err) {
        // console.log(err);
    } finally {
        // client.close();
    }
}
