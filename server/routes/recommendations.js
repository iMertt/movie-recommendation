const express = require("express");
const router = express.Router();
const axios = require("axios");
const auth = require("../middleware/auth");
const User = require("../models/User");

// @route   GET api/recommendations
// @desc    Get movie recommendations for user
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Get user preferences
    const { genres = [], actors = [], directors = [] } = user.preferences;

    // Get liked movies for reference
    const likedMovies = user.likedMovies;

    // If user has no preferences or liked movies, return popular movies
    if (
      genres.length === 0 &&
      actors.length === 0 &&
      directors.length === 0 &&
      likedMovies.length === 0
    ) {
      // Return some popular movies as fallback
      const popularMovies = await getPopularMovies();
      return res.json(popularMovies);
    }

    // Generate recommendations based on preferences and liked movies
    const recommendations = await generateRecommendations(user);

    res.json(recommendations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Helper function to get popular movies
async function getPopularMovies() {
  // This is a simplified approach - in a real app, you might have a more sophisticated way to get popular movies
  const popularTitles = [
    "Inception",
    "The Dark Knight",
    "Pulp Fiction",
    "The Godfather",
    "Forrest Gump",
  ];

  const movies = [];

  for (const title of popularTitles) {
    try {
      const response = await axios.get(
        `http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&t=${title}`
      );
      if (response.data.Response === "True") {
        movies.push(response.data);
      }
    } catch (error) {
      console.error(`Error fetching movie ${title}:`, error.message);
    }
  }

  return movies;
}

// Helper function to generate recommendations based on user preferences and history
async function generateRecommendations(user) {
  const recommendations = [];

  // Get recommendations based on genres
  if (user.preferences.genres.length > 0) {
    const randomGenre =
      user.preferences.genres[
        Math.floor(Math.random() * user.preferences.genres.length)
      ];
    try {
      const response = await axios.get(
        `http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&s=${randomGenre}&type=movie`
      );
      if (response.data.Response === "True") {
        recommendations.push(...response.data.Search);
      }
    } catch (error) {
      console.error(
        `Error fetching movies for genre ${randomGenre}:`,
        error.message
      );
    }
  }

  // Get recommendations based on liked movies
  if (user.likedMovies.length > 0) {
    const randomLikedMovie =
      user.likedMovies[Math.floor(Math.random() * user.likedMovies.length)];
    try {
      const response = await axios.get(
        `http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&s=${
          randomLikedMovie.title.split(" ")[0]
        }&type=movie`
      );
      if (response.data.Response === "True") {
        // Filter out movies that are already liked or disliked
        const filteredResults = response.data.Search.filter(
          (movie) =>
            !user.likedMovies.some((m) => m.imdbID === movie.imdbID) &&
            !user.dislikedMovies.some((m) => m.imdbID === movie.imdbID)
        );
        recommendations.push(...filteredResults);
      }
    } catch (error) {
      console.error(
        `Error fetching similar movies for ${randomLikedMovie.title}:`,
        error.message
      );
    }
  }

  // Get recommendations based on actors if available
  if (user.preferences.actors.length > 0) {
    const randomActor =
      user.preferences.actors[
        Math.floor(Math.random() * user.preferences.actors.length)
      ];
    try {
      const response = await axios.get(
        `http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&s=${randomActor}&type=movie`
      );
      if (response.data.Response === "True") {
        recommendations.push(...response.data.Search);
      }
    } catch (error) {
      console.error(
        `Error fetching movies for actor ${randomActor}:`,
        error.message
      );
    }
  }

  // Remove duplicates based on imdbID
  const uniqueRecommendations = Array.from(
    new Map(recommendations.map((movie) => [movie.imdbID, movie])).values()
  );

  // Filter out movies that user has already liked or disliked
  const filteredRecommendations = uniqueRecommendations.filter(
    (movie) =>
      !user.likedMovies.some((m) => m.imdbID === movie.imdbID) &&
      !user.dislikedMovies.some((m) => m.imdbID === movie.imdbID)
  );

  // Limit to 10 recommendations
  return filteredRecommendations.slice(0, 10);
}

module.exports = router;
