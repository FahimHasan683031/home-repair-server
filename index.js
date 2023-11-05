const express = require("express")
const cors = require("cors")
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT||5000;


// middleware
app.use(express.json())
app.use(cors())



// mongodb connection
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.m2apie0.mongodb.net/?retryWrites=true&w=majority`;

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

    // services apis
    const servicesCollection =client.db("HomeRepair").collection("services") 

    app.get('/api/v1/services',async(req,res)=>{
        const result = await servicesCollection.find().toArray()
        res.send(result)
    })
    app.get('/api/v1/services/:id',async(req,res)=>{
        const id  =req.params.id;
        console.log(id)
        const query = {_id:new ObjectId(id)}
        const result =await servicesCollection.findOne(query)
        res.send(result)
    })
    app.get('/api/v1/user/services',async(req,res)=>{
        const email =req.query.email
        console.log(email)
        const query = {email:email}
        const result =await servicesCollection.find(query).toArray()
        res.send(result)
    })
    app.post('/api/v1/services',async(req,res)=>{
        const data = req.body
        const result = await servicesCollection.insertOne(data)
        res.send(result)
    })
    app.delete("/api/v1/services/:id", async (req, res) => {
        const id = req.params.id;
        const query = {
          _id: new ObjectId(id),
        };
        const result = await servicesCollection.deleteOne(query);
        res.send(result);
      });
    app.put('/api/v1/services/:id',async(req,res)=>{
        const id  = req.params.id;
        const data = req.body;
        const filter = {_id:new ObjectId(id)}
        const options = { upsert: true };
        const updateService = {
            $set: {
                serviceName: data.serviceName,
                servicesImage: data.servicesImage,
                description: data.description,
                email: data.email
            },
        }
        const result = await servicesCollection.updateOne(filter,updateService,options)
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




app.get('/',(req,res)=>{
    res.send('server is running')
})

app.listen(port,(req,res)=>{
    console.log(`server is running on the port of ${port}`)
})