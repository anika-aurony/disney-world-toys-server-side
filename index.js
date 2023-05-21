const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middleware
app.use(cors());
app.use(express.json());

console.log(`${process.env.DISNEY_USER}`)
const uri = `mongodb+srv://${process.env.DISNEY_USER}:${process.env.DISNEY_PASS}@cluster0.mu4fgop.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const toysCollection = client.db('disneyToys').collection('toys');

    app.get('/toys', async(req, res)=>{
        const cursor = toysCollection.find().limit(20);
        const result = await cursor.toArray();
        res.send(result);
    })


    app.get('/toys/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }
        const result = await toysCollection.findOne(query);
        res.send(result);
    })

    app.get('/toy', async (req, res) => {
        console.log(req.query.email);
        let query = {};
        if (req.query?.email) {
            query = { email: req.query.email }
        }
        const result = await toysCollection.find(query).toArray();
        res.send(result);
    })

    app.put('/toys/:id', async(req, res) =>{
        const id = req.params.id;
        const toy = req.body;
        console.log(id, toy)
        const filter = {_id: new ObjectId(id)}
        const options = {upsert: true}
        const updatedUser = {
            $set: {
                quantity: toy.quantity,
                price: toy.price,
                description: toy.description
            }
        }
        const result = await toysCollection.updateOne(filter, updatedUser, options);
        res.send(result)
    })

    app.post('/toys', async(req, res)=>{
        const toy = req.body;
        console.log(toy);
        const result = await toysCollection.insertOne(toy);
        res.send(result)
    } )


    app.delete('/toys/:id', async(req, res)=>{
        const id = req.params.id;
        console.log('Deleting this id')
        const query = {_id: new ObjectId(id)}
        const result = await toysCollection.deleteOne(query);
        res.send(result)
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);






app.get('/', (req, res)=>{
    res.send('disney world toys server is running')
})

app.listen(port, ()=>{
    console.log(`Server is running on port: ${port}`)
})