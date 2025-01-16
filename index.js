const express = require('express');
const cors = require('cors');
require('dotenv').config();
const axios = require('axios');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: [
        'https://landingclint.vercel.app',
        'https://landingclint-jlxhx55bu-narias-projects.vercel.app',
    ],
    credentials: true
}));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@hajj.zsqpd.mongodb.net/?retryWrites=true&w=majority&appName=Hajj`;

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
        await client.connect();
        console.log("Connected to MongoDB");

        const BookingCollection = client.db('landingPage').collection('booking');
        const NewsCollection = client.db('landingPage').collection('news');
        const VideoCollection = client.db('landingPage').collection('video');
        const CardCollection = client.db('landingPage').collection('card');

        // GET routes
        app.get('/booking', async (req, res) => {
            try {
                const result = await BookingCollection.find().toArray();
                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send("Internal Server Error");
            }
        });

        app.get('/card', async (req, res) => {
            try {
                const result = await CardCollection.find().toArray();
                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send("Internal Server Error");
            }
        });

        app.get('/news', async (req, res) => {
            try {
                const result = await NewsCollection.find().toArray();
                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send("Internal Server Error");
            }
        });

        app.get('/video', async (req, res) => {
            try {
                const result = await VideoCollection.find().toArray();
                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send("Internal Server Error");
            }
        });

        // POST routes
        app.post('/booking', async (req, res) => {
            try {
                const bookingData = req.body;
                const result = await BookingCollection.insertOne(bookingData);
                res.status(201).send(result);
            } catch (error) {
                console.error("Error adding Booking:", error);
                res.status(500).send("Internal Server Error");
            }
        });

        app.post('/news', async (req, res) => {
            try {
                const bookingData = req.body;
                const result = await NewsCollection.insertOne(bookingData);
                res.status(201).send(result);
            } catch (error) {
                console.error("Error adding Booking:", error);
                res.status(500).send("Internal Server Error");
            }
        });

        app.post('/video', async (req, res) => {
            try {
                const videoData = req.body;
                const result = await VideoCollection.insertOne(videoData);

                if (result.acknowledged) {
                    res.status(201).send({ insertedId: result.insertedId });
                } else {
                    res.status(400).send({ error: 'Failed to add video' });
                }
            } catch (error) {
                console.error("Error adding video:", error);
                res.status(500).send("Internal Server Error");
            }
        });

        // DELETE routes
        app.delete('/video/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const result = await VideoCollection.deleteOne(query);
                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send("Internal Server Error");
            }
        });

        app.delete('/news/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const result = await NewsCollection.deleteOne(query);
                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send("Internal Server Error");
            }
        });

        app.delete('/card/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const result = await CardCollection.deleteOne(query);
                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send("Internal Server Error");
            }
        });

        app.delete('/booking/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const result = await BookingCollection.deleteOne(query);
                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send("Internal Server Error");
            }
        });

        // Ping to confirm connection
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (error) {
        console.error("Database connection error:", error);
    } finally {
        // Ensure proper cleanup if necessary
    }
}

run().catch(console.dir);

// Root Route
app.get('/', (req, res) => {
    res.send('Landing Page is running');
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).send(`Something broke! Error: ${err.message}`);
});

// Start Server
app.listen(port, () => {
    console.log(`Landing Page is running on port ${port}`);
});