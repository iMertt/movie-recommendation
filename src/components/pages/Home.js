import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [popularMovies, setPopularMovies] = useState([]);

  useEffect(() => {
    const fetchPopularMovies = async () => {
      try {
        const popularGenres = ['action', 'comedy', 'drama', 'sci-fi'];
        const randomGenre = popularGenres[Math.floor(Math.random() * popularGenres.length)];
        
        const response = await axios.get(`https://www.omdbapi.com/?apikey=3e1e760b&s=${randomGenre}&type=movie`);
        
        if (response.data.Response === 'True') {
          setPopularMovies(response.data.Search.slice(0, 6));
        }
      } catch (err) {
        console.error('Error fetching popular movies:', err);
      }
    };

    fetchPopularMovies();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchTerm) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`https://www.omdbapi.com/?apikey=3e1e760b&s=${searchTerm}&type=movie`);
      
      if (response.data.Response === 'True') {
        setMovies(response.data.Search);
      } else {
        setError(response.data.Error);
        setMovies([]);
      }
    } catch (err) {
      setError('Failed to fetch movies. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container modern">
      <div className="hero-section">
        <div className="overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Discover Your Next Cinematic Experience</h1>
          <p className="hero-subtitle">Explore thousands of movies and find your perfect match</p>
          <form onSubmit={handleSearch} className="search-form modern">
            <div className="search-input-container">
              <input
                type="text"
                placeholder="Search for movies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="modern-input"
              />
              <button type="submit" className="modern-btn">
                <i className="fas fa-search"></i>
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {loading && (
        <div className="loader-container">
          <div className="modern-loader"></div>
        </div>
      )}
      {error && <p className="modern-error">{error}</p>}
      
      <div className="content-container">
        {movies.length > 0 ? (
          <div className="section">
            <h2 className="section-title">Search Results</h2>
            <div className="movie-grid modern-grid">
              {movies.map((movie) => (
                <div key={movie.imdbID} className="movie-card modern-card">
                  <div className="card-image-container">
                    <img 
                      src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster'} 
                      alt={movie.Title} 
                      className="card-image"
                    />
                    <div className="card-overlay">
                      <Link to={`/movie/${movie.imdbID}`} className="btn view-details-btn">View Details</Link>
                    </div>
                  </div>
                  <div className="card-content">
                    <h3 className="card-title">{movie.Title}</h3>
                    <p className="card-year">{movie.Year}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          !loading && !error && popularMovies.length > 0 && (
            <div className="section">
              <h2 className="section-title">Trending Now</h2>
              <div className="movie-grid modern-grid">
                {popularMovies.map((movie) => (
                  <div key={movie.imdbID} className="movie-card modern-card">
                    <div className="card-image-container">
                      <img 
                        src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster'} 
                        alt={movie.Title} 
                        className="card-image"
                      />
                      <div className="card-overlay">
                        <Link to={`/movie/${movie.imdbID}`} className="btn view-details-btn">View Details</Link>
                      </div>
                    </div>
                    <div className="card-content">
                      <h3 className="card-title">{movie.Title}</h3>
                      <p className="card-year">{movie.Year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Home;