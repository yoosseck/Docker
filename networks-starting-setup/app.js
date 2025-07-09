const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios').default;
const mongoose = require('mongoose');

const Favorite = require('./models/favorite');

const app = express();

app.use(bodyParser.json());

app.get('/favorites', async (req, res) => {
  const favorites = await Favorite.find();
  res.status(200).json({
    favorites: favorites,
  });
});

app.post('/favorites', async (req, res) => {
  const favName = req.body.name;
  const favType = req.body.type;
  const favUrl = req.body.url;

  try {
    if (favType !== 'movie' && favType !== 'character') {
      throw new Error('"type" should be "movie" or "character"!');
    }
    const existingFav = await Favorite.findOne({ name: favName });
    if (existingFav) {
      throw new Error('Favorite exists already!');
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }

  const favorite = new Favorite({
    name: favName,
    type: favType,
    url: favUrl,
  });

  try {
    await favorite.save();
    res
      .status(201)
      .json({ message: 'Favorite saved!', favorite: favorite.toObject() });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong.' });
  }
});

app.get('/movies', async (req, res) => {
  try {
    const response = await axios.get('https://swapi.dev/api/films');
    res.status(200).json({ movies: response.data });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong.' });
  }
});

app.get('/people', async (req, res) => {
  try {
    const response = await axios.get('https://swapi.dev/api/people');
    res.status(200).json({ people: response.data });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong.' });
  }
});

// mongoose.connect(
//   // 'mongodb://localhost:27017/swfavorites',

//   // You can talk to the MongoDB through this special Docker domain()
//   // 'mongodb://host.docker.internal:27017/swfavorites',

//   // You can pull out its IP address and have this container talk to the DB 
//   // After you've created a new container based on the DB image(docker image inspect <image name>)
//   // 'mongodb://172.17.0.2:27017/swfavorites',

//   // You can have containers take to the DB container by its DB container name 
//   // After you have configured a network across containers(docker network create <network name>)
//   // As you can dynamically specify the network to the DB via DB container name, just like a domain,
//   // You do not really have to work around resolving the IP address each time you build a new image
//   // As Docker automatically configures the IP address under the hood
//   'mongodb://mongodb:27017/swfavorites',

//   { useNewUrlParser: true },
//   (err) => {
//     if (err) {
//       console.log(err);
//     } else {
//       app.listen(3000);
//     }
//   }
// );
mongoose.connect('mongodb://mongodb:27017/swfavorites', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(3000, () => {
        console.log('🚀 Server listening on port 3000');
    });
})
.catch(err => {
    console.error('❌ MongoDB connection failed:');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Full error:', err);
});

