
const express = require('express');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 8800;


//middleware

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qkb4jt3.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)

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
        client.connect();

        const toyCollection = client.db('toyDB').collection('toy')


        // get the data from mongodb 
        app.get('/toy', async (req, res) => {
            const cursor = toyCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/toy/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toyCollection.findOne(query)
            res.send(result);
        })

        //   category wise finding 

        app.get('/toys/:category', async (req, res) => {
            const category = req.params.category;
            const query = { category: category }
            const cursor = await toyCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/toymail', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const result = await toyCollection.find(query).toArray();
            res.send(result)
        })

        // send data to mongodb 
        app.post('/toy', async (req, res) => {
            const newToy = req.body;
            console.log(newToy)
            const result = await toyCollection.insertOne(newToy);
            res.send(result);
        })


        // update data

        app.put('/toy/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatedToy = req.body;
            const toy = {
                $set: {
                    price: updatedToy.price,
                    quantity: updatedToy.quantity,
                    description: updatedToy.description,

                }
            }
            const result = await toyCollection.updateOne(filter, toy, options);
            res.send(result);
        })

        // delete data from database 

        app.delete('/toy/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toyCollection.deleteOne(query);
            res.send(result);
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









app.get('/', (req, res) => {
    res.send('Vintage Car Toy Server is Running')
})

app.listen(port, () => {
    console.log(`Toy Server Running on: ${port}`)
})