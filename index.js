const express = require('express');
const cors = require('cors');
require('dotenv').config()
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// auto
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const app = express();
const port = process.env.PORT || 5000;

// // middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://landingclint-jlxhx55bu-narias-projects.vercel.app',
        'https://landingclint.vercel.app',
    ],
    credentials: true
}));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@hajj.zsqpd.mongodb.net/?retryWrites=true&w=majority&appName=Hajj`;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, 'public/images/');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

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






        //post
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

        //post
        app.post('/card', upload.single('image'), async (req, res) => {
          try {
            console.log('Received card data:', req.body);
            console.log('Received file:', req.file);

            if (!req.file) {
              return res.status(400).send("No image file uploaded");
            }

            const { title, header, subHeader, description, shortDescription } = req.body;
            const imageUrl = `/images/${req.file.filename}`;

            const cardData = {
              title,
              header,
              subHeader,
              description,
              shortDescription,
              imageUrl
            };

            const result = await CardCollection.insertOne(cardData);
            console.log('Inserted card:', result);
            res.status(201).send(result);
          } catch (error) {
            console.error("Error adding Card:", error);
            res.status(500).send(`Internal Server Error: ${error.message}`);
          }
        });

        //post
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
                const videoData = req.body; // Ensure this is video data, not booking data
                const result = await VideoCollection.insertOne(videoData);

                if (result.acknowledged) {
                    res.status(201).send({ insertedId: result.insertedId }); // Send insertedId back
                } else {
                    res.status(400).send({ error: 'Failed to add video' });
                }
            } catch (error) {
                console.error("Error adding video:", error);
                res.status(500).send("Internal Server Error");
            }
        });




        //video delete
        app.delete('/video/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) }
                const result = await VideoCollection.deleteOne(query);
                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send("Internal Server Error");
            }
        })

        //news delete
        app.delete('/news/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) }
                const result = await NewsCollection.deleteOne(query);
                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send("Internal Server Error");
            }
        })


        // card delete

        app.delete('/card/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };

                // Get the card data before deletion
                const card = await CardCollection.findOne(query);

                if (card && card.imageUrl) {
                    // Delete the image file
                    const imagePath = path.join(__dirname, 'public', card.imageUrl);
                    fs.unlink(imagePath, (err) => {
                        if (err) console.error("Error deleting image file:", err);
                    });
                }

                const result = await CardCollection.deleteOne(query);
                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send("Internal Server Error");
            }
        })

        // booking delete

        app.delete('/booking/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) }
                const result = await BookingCollection.deleteOne(query);
                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send("Internal Server Error");
            }
        })








        // Ping to confirm connection
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (error) {
        console.error("Database connection error:", error);
    } finally {

    }
}

run().catch(console.dir);

// Root Route
app.get('/', (req, res) => {
    res.send('Landing Page is running');
});

app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).send(`Something broke! Error: ${err.message}`);
});

// Start Server
app.listen(port, () => {
    console.log(`Landing Page is running on port ${port}`);
});

