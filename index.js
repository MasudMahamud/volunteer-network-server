const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.n50q4.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();

app.use(bodyParser.json());
app.use(cors());

const port = 4000;



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const adminCollection = client.db("volunteerNetwork").collection("admin");
    const activityCollection = client.db("volunteerNetwork").collection("activity");
    const volunteersCollection = client.db("volunteerNetwork").collection("volunteer");

    //activity 
    app.get('/activity', (req, res) => {
        activityCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })
    //volunteer
    app.post('/addVolunteer', (req, res) => {
        const volunteer = req.body;
        volunteersCollection.insertOne(volunteer)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    app.get('/VolunteerActivity', (req, res) => {
        volunteersCollection.find({ email: req.query.email })
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.delete('deleteEvent/:id', (req, res) => {
        const id = ObjectID(req.params.id);
        volunteersCollection.findOneAndDelete({ _id: id })
            .then(documents => res.send(!!documents.value))
    })

//admin
    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        adminCollection.find({ email: email })
            .toArray((err, doctors) => {
                res.send(doctors.length > 0);
            })
    })


});


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port)
