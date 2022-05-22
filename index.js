const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000
const app = express()

// middleware
app.use(cors())
app.use(express.json())

// mongodb


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7nph9.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// verify jwt
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorised access' })
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded
        next()
    })
}



async function run() {
    try {
        await client.connect();
        console.log('database connected')
        const toolsCollection = client.db('picaso-painting-brush').collection('tools')
        const bookingCollection = client.db('picaso-painting-brush').collection('booking')
        const userCollection = client.db('picaso-painting-brush').collection('users')
        app.get('/tools', async (req, res) => {
            const query = {}
            // const cursor = toolsCollection.find(query)
            // const tools = await cursor.toArray()
            const tools = await toolsCollection.find(query).toArray()
            res.send(tools)
        })
        app.get('/tools/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const tool = await toolsCollection.findOne(query)
            res.send(tool)
        })
        app.put('/tools/:id', async (req, res) => {
            const id = req.params.id
            const updatedQuantity = req.body
            console.log(updatedQuantity)
            const query = { _id: ObjectId(id) }
            console.log(updatedQuantity.minimumQuantity)
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    minimumQuantity: updatedQuantity.minimumQuantity
                }
            }
            const result = await toolsCollection.updateOne(query, updateDoc, options)

            res.send(result)
        })
        // booking
        app.post('/booking', async (req, res) => {
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking)
            res.send(result)
        })
        app.get('/booking', verifyJWT, async (req, res) => {
            const email = req.query.email
            const decodedEmail = req.decoded.email;
            if (email === decodedEmail) {
                const query = { email: email }
                const bookings = await bookingCollection.find(query).toArray()
                res.send(bookings)
            }
            else {
                return res.status(403).send({ message: 'forbidden access' })
            }

        })
        // user
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options)
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ result, token })
        })


    }
    finally {

    }
}
run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('hello from picaso painting brush')
})
app.listen(port, () => {
    console.log(`picaso painting brush listening on port ${port}`)
})