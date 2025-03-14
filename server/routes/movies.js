const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET api/movies/search
// @desc    Search movies by title
// @access  Private
router.get('/search', auth, async (req, res) => {
  try {
    const { title, page = 1 } = req.query;
    
    if (!title) {
      return res.status(400).json({ msg: 'Title is required' });
    }
    
    // Save search to user history
    await User.findByIdAndUpdate(req.user.id, {
      $push: { searchHistory: { query: title } }
    });
    
    const response = await axios.get(`http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&s=${title}&page=${page}`);
    
    if (response.data.Error) {
      return res.status(404).json({ msg: response.data.Error });
    }
    
    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/movies/:id
// @desc    Get movie by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const response = await axios.get(`http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&i=${req.params.id}&plot=full`);
    
    if (response.data.Error) {
      return res.status(404).json({ msg: response.data.Error });
    }
    
    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/movies/like/:id
// @desc    Like a movie
// @access  Private
router.post('/like/:id', auth, async (req, res) => {
  try {
    const { title, year, poster } = req.body;
    const imdbID = req.params.id;
    
    const user = await User.findById(req.user.id);
    
    // Check if movie is already liked
    if (user.likedMovies.some(movie => movie.imdbID === imdbID)) {
      return res.status(400).json({ msg: 'Movie already liked' });
    }
    
    // Remove from disliked if present
    user.dislikedMovies = user.dislikedMovies.filter(movie => movie.imdbID !== imdbID);
    
    // Add to liked movies
    user.likedMovies.push({ imdbID, title, year, poster });
    
    await user.save();
    
    res.json(user.likedMovies);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/movies/dislike/:id
// @desc    Dislike a movie
// @access  Private
router.post('/dislike/:id', auth, async (req, res) => {
  try {
    const { title, year, poster } = req.body;
    const imdbID = req.params.id;
    
    const user = await User.findById(req.user.id);
    
    // Check if movie is already disliked
    if (user.dislikedMovies.some(movie => movie.imdbID === imdbID)) {
      return res.status(400).json({ msg: 'Movie already disliked' });
    }
    
    // Remove from liked if present
    user.likedMovies = user.likedMovies.filter(movie => movie.imdbID !== imdbID);
    
    // Add to disliked movies
    user.dislikedMovies.push({ imdbID, title, year, poster });
    
    await user.save();
    
    res.json(user.dislikedMovies);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;