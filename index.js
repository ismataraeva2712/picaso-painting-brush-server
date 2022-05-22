const express = require('express');
const cors = require('cors');
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
async function run() {
    try {
        await client.connect();
        console.log('database connected')
        const toolsCollection = client.db('picaso-painting-brush').collection('tools')
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