const express = require("express")
const cors = require("cors")
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cookieParser = require('cookie-parser')
require('dotenv').config()
var jwt = require('jsonwebtoken');
const app = express()
const port = process.env.PORT||5000;


// middleware
app.use(express.json())
app.use(cors({
    origin:["http://localhost:5173"],
    credentials:true
}))
app.use(cookieParser())

// custom middleware
const verify = (req,res,next)=>{
    const cookie = req?.cookies?.token;
    console.log(cookie)
    if(!cookie){
        return res.status(401).send({massage:'unauthorized access'})
    }
    jwt.verify(cookie,process.env.PRIVATE_KEY,(err,decode)=>{
        if(err){
            return res.status(401).send({massage:'unauthorized access'})
        }
        req.user=decode
        next()
    })
}

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

    // jwt authorization apis
    app.post('/api/v1/access',async(req,res)=>{
        const user = req.body;
       const token= jwt.sign(user,process.env.PRIVATE_KEY,{expiresIn:"1h"})
       console.log(token)
       res
       .cookie("token",token,{
        httpOnly:true,
        secure:true,
        sameSite:"none"
       })
       .send({success:true})
    })

    app.post('/api/v1/logout',async(req,res)=>{
        res
        .clearCookie('token',{maxAge:0})
        .send({success:true})
    })

    // services apis
    const servicesCollection =client.db("HomeRepair").collection("services") 

    app.get('/api/v1/services',async(req,res)=>{
        let query = {}
        const limit = req.query.limit ? parseInt(req.query.limit) : 0;
        if(req.query.email){
            query.email=req.query.email
        }
        if(req.query.serviceName){
            query.serviceName={ $regex: new RegExp(req.query.serviceName, 'i') }
        }
        const result = await servicesCollection.find(query).limit(limit).toArray()
        res.send(result)
    })
    app.get('/api/v1/services/:id',async(req,res)=>{
        const id  =req.params.id;
        console.log(id)
        const query = {_id:new ObjectId(id)}
        const result =await servicesCollection.findOne(query)
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


    
    // bookings apis
    const bookingsCollection =client.db("HomeRepair").collection("bookings")
    app.get('/api/v1/bookings',async(req,res)=>{
        const result = await bookingsCollection.find().toArray()
        res.send(result)
    })
    app.get('/api/v1/bookings/:id',async(req,res)=>{
        const id  =req.params.id;
        console.log(id)
        const query = {_id:new ObjectId(id)}
        const result =await bookingsCollection.findOne(query)
        res.send(result)
    })
    app.get('/api/v1/user/bookings',async(req,res)=>{
        const email =req.query.email
        console.log(email)
        const query = {email:email}
        const result =await bookingsCollection.find(query).toArray()
        res.send(result)
    })
    app.post('/api/v1/bookings',async(req,res)=>{
        const data = req.body
        const result = await bookingsCollection.insertOne(data)
        res.send(result)
    })
    app.delete("/api/v1/bookings/:id", async (req, res) => {
        const id = req.params.id;
        const query = {
          _id: new ObjectId(id),
        };
        const result = await bookingsCollection.deleteOne(query);
        res.send(result);
      });
    app.put('/api/v1/bookings/:id',async(req,res)=>{
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
        const result = await bookingsCollection.updateOne(filter,updateService,options)
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