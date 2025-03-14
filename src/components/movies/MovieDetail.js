import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const detailRef = useRef(null);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await axios.get(`https://www.omdbapi.com/?apikey=3e1e760b&i=${id}&plot=full`);
        
        if (response.data.Response === 'True') {
          setMovie(response.data);
          fetchRecommendations(response.data);
        } else {
          setError(response.data.Error);
        }
      } catch (err) {
        setError('Failed to fetch movie details. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();

    // Cleanup function to handle ResizeObserver
    return () => {
      if (detailRef.current) {
        const resizeObserver = new ResizeObserver(() => {});
        resizeObserver.disconnect();
      }
    };
  }, [id]);

  const fetchRecommendations = async (movieData) => {
    try {
      // Get the first genre from the movie
      const genres = movieData.Genre.split(',').map(g => g.trim());
      const mainGenre = genres[0];
      
      // Get recommendations based on genre
      // In the fetchRecommendations function
      const response = await axios.get(`https://www.omdbapi.com/?apikey=3e1e760b&s=${mainGenre}&type=movie`);
      
      if (response.data.Response === 'True') {
        // Filter out the current movie and limit to 6 recommendations
        const filteredRecommendations = response.data.Search
          .filter(rec => rec.imdbID !== id)
          .slice(0, 6);
        
        setRecommendations(filteredRecommendations);
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    }
  };

  if (loading) return (
    <div className="loader-container">
      <div className="modern-loader"></div>
    </div>
  );
  
  if (error) return <p className="modern-error">{error}</p>;
  if (!movie) return <p>No movie found.</p>;

  return (
    <div className="movie-detail" ref={detailRef}>
      <div className="movie-detail-header">
        <img 
          src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster'} 
          alt={movie.Title} 
        />
        <div className="movie-info">
          <h1>{movie.Title} ({movie.Year})</h1>
          <p><strong>Rating:</strong> {movie.Rated}</p>
          <p><strong>Runtime:</strong> {movie.Runtime}</p>
          <p><strong>Genre:</strong> {movie.Genre}</p>
          <p><strong>Director:</strong> {movie.Director}</p>
          <p><strong>Actors:</strong> {movie.Actors}</p>
          <p><strong>IMDb Rating:</strong> {movie.imdbRating}/10</p>
          <div className="movie-actions">
            <button className="btn btn-primary">Like</button>
            <button className="btn">Dislike</button>
          </div>
        </div>
      </div>
      <div className="movie-plot">
        <h2>Plot</h2>
        <p>{movie.Plot}</p>
      </div>
      
      {recommendations.length > 0 && (
        <div className="recommendations">
          <h2>Similar {movie.Genre.split(',')[0]} Movies You Might Like</h2>
          <div className="movie-grid modern-grid">
            {recommendations.map(rec => (
              <div key={rec.imdbID} className="movie-card modern-card">
                <div className="card-image-container">
                  <img 
                    src={rec.Poster !== 'N/A' ? rec.Poster : 'https://via.placeholder.com/300x450?text=No+Poster'} 
                    alt={rec.Title} 
                    className="card-image"
                  />
                  <div className="card-overlay">
                    <Link to={`/movie/${rec.imdbID}`} className="btn view-details-btn">View Details</Link>
                  </div>
                </div>
                <div className="card-content">
                  <h3 className="card-title">{rec.Title}</h3>
                  <p className="card-year">{rec.Year}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <Link to="/" className="btn">Back to Search</Link>
    </div>
  );
};

export default MovieDetail;