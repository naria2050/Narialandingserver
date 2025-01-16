const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://landingclint-jlxhx55bu-narias-projects.vercel.app',
      'https://landingclint.vercel.app',
    ],
    credentials: true,
  })
);
app.use(express.json());

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, 'public/images/');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// MongoDB Configuration
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@hajj.zsqpd.mongodb.net/?retryWrites=true&w=majority&appName=Hajj`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const BookingCollection = client.db('landingPage').collection('booking');
    const NewsCollection = client.db('landingPage').collection('news');
    const VideoCollection = client.db('landingPage').collection('video');
    const CardCollection = client.db('landingPage').collection('card');

    // Routes
    app.get('/', (req, res) => {
      res.send('Landing Page is running');
    });

    app.use('/images', express.static(path.join(__dirname, 'public/images')));

    app.get('/card', async (req, res) => {
      try {
        const result = await CardCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    });

    // POST route for adding a card
    app.post('/card', upload.single('image'), async (req, res) => {
      try {
        console.log('Received card data:', req.body);
        console.log('Received file:', req.file);

        if (!req.file) {
          return res.status(400).send('No image file uploaded');
        }

        const { title, header, subHeader, description, shortDescription } = req.body;

        // Read the uploaded file
        const imageFilePath = path.join(__dirname, 'public/images/', req.file.filename);
        const imageBuffer = fs.readFileSync(imageFilePath);
        const imageBase64 = imageBuffer.toString('base64');

        // Upload to ImgBB
        const imgbbApiUrl = `https://api.imgbb.com/1/upload?key=5c49c7e28a6807775bcd1899796bdc4b`;
        const imgbbResponse = await axios.post(imgbbApiUrl, {
          image: imageBase64,
        });

        if (imgbbResponse.status !== 200) {
          return res.status(500).send('Error uploading to ImgBB');
        }

        const imageUrl = imgbbResponse.data.data.url;

        // Clean up the locally saved image
        fs.unlinkSync(imageFilePath);

        // Prepare card data for the database
        const cardData = {
          title,
          header,
          subHeader,
          description,
          shortDescription,
          imageUrl,
        };

        const result = await CardCollection.insertOne(cardData);
        console.log('Inserted card:', result);
        res.status(201).send(result);
      } catch (error) {
        console.error('Error adding Card:', error);
        res.status(500).send(`Internal Server Error: ${error.message}`);
      }
    });

    // Additional CRUD operations for other collections
    app.get('/booking', async (req, res) => {
      try {
        const result = await BookingCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    });

    app.post('/booking', async (req, res) => {
      try {
        const bookingData = req.body;
        const result = await BookingCollection.insertOne(bookingData);
        res.status(201).send(result);
      } catch (error) {
        console.error('Error adding Booking:', error);
        res.status(500).send('Internal Server Error');
      }
    });

    app.delete('/card/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };

        // Get the card data before deletion
        const card = await CardCollection.findOne(query);

        if (card && card.imageUrl) {
          // Delete the image file if necessary
          const imagePath = path.join(__dirname, 'public', card.imageUrl);
          fs.unlink(imagePath, (err) => {
            if (err) console.error('Error deleting image file:', err);
          });
        }

        const result = await CardCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    });

    // Ping MongoDB
    console.log('Pinged your deployment. You successfully connected to MongoDB!');
  } catch (error) {
    console.error('Database connection error:', error);
  }
}

run().catch(console.dir);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).send(`Something broke! Error: ${err.message}`);
});

// Start Server
app.listen(port, () => {
  console.log(`Landing Page is running on port ${port}`);
});
