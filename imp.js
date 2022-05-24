//add & update  user
app.put('/user/:email', async (req, res) => {
    const email = req.params.email;
    const user = req.body;
    const filter = { email: email }
    const options = { upsert: true }
    const updateDoc = {
        $set: user
    }
    const result = await userCollection.updateOne(filter, updateDoc, options)

    const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });

    res.send({ result, token })
})

// get user by email
app.get('/user/:email', verifyToken, async (req, res) => {
    const email = req.params.email
    const query = { email: email }
    const user = await userCollection.find(query).toArray()
    res.send(user)
})

//update  user by email
app.patch('/user/:email', verifyToken, async (req, res) => {
    const email = req.params.email;
    const data = req.body;
    const filter = { email: email }
    const updateDoc = {
        $set: data
    }
    const result = await userCollection.updateOne(filter, updateDoc)
    res.send(result)
})