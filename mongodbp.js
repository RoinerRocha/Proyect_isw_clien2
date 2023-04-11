const {MongoClient} = require('mongodb')
const url= 'mongodb://127.0.0.1:27017/fifapp';
const databaseName='fifapp'
const client= new MongoClient(url);

async function dbConnect2()
{
    let result = await client.connect();
    db= result.db(databaseName);
    return db.collection('players');
  
}
module.exports= dbConnect2;
