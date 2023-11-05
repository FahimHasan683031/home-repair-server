const express = require("express")
const cors = require("cors")
const app = express()
const port = process.env.PORT||5000;



// middleware
app.use(express.json())
app.use(cors())


app.get('/',(req,res)=>{
    res.send('server is running')
})

app.listen(port,(req,res)=>{
    console.log(`server is running on the port of ${port}`)
})