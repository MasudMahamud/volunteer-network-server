const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.n50q4.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('blog'))
app.use(fileUpload());




client.connect(err => {
    const adminCollection = client.db("volunteerNetwork").collection("admin");
    const activityCollection = client.db("volunteerNetwork").collection("activity");
    const volunteersCollection = client.db("volunteerNetwork").collection("volunteer");
    const blogCollection = client.db("volunteerNetwork").collection("blog");

    //activity 
    app.get('/activity', (req, res) => {
        activityCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    }) //activity end


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

    app.get('/allVolunteer', (req, res) => {
        volunteersCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.delete('deleteEvent/:id', (req, res) => {
        const id = ObjectID(req.params.id);
        volunteersCollection.findOneAndDelete({ _id: id })
            .then(documents => res.send(!!documents.value))
    }) //volunteer end


    //admin
    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        adminCollection.find({ email: email })
            .toArray((err, doctors) => {
                res.send(doctors.length > 0);
            })
    }) //admin end

    
    //blog
    app.post('/addBlog', (req, res) => {
        const file = req.files.file;
        const title = req.body.title;
        const date = req.body.date;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        blogCollection.insertOne({ title, date, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    app.get('/blog', (req, res) => {
        blogCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    }); //blog end

});

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen( Process.env.PORT || 4000)
