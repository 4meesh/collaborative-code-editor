import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Code, Zap } from 'lucide-react';
import './Home.css';

const Home = () => {
  const [username, setUsername] = useState('');
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms');
      if (response.ok) {
        const data = await response.json();
        setRooms(data);
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const { roomId } = await response.json();
        navigate(`/room/${roomId}`, { state: { username } });
      } else {
        setError('Failed to create room');
      }
    } catch (err) {
      setError('Failed to create room');
    }
  };

  const joinRoom = (roomId) => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    navigate(`/room/${roomId}`, { state: { username } });
  };

  return (
    <div className="home">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <a href="/" className="logo">
              <Code size={24} />
              Collaborative Code Editor
            </a>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          <div className="hero">
            <h1>Code Together in Real-Time</h1>
            <p>Collaborate with your team on code projects with live editing, syntax highlighting, and cursor tracking.</p>
          </div>

          <div className="features">
            <div className="feature">
              <Zap size={32} />
              <h3>Real-Time Sync</h3>
              <p>See changes instantly as your teammates code</p>
            </div>
            <div className="feature">
              <Users size={32} />
              <h3>Multi-User</h3>
              <p>Work together with unlimited collaborators</p>
            </div>
            <div className="feature">
              <Code size={32} />
              <h3>Syntax Highlighting</h3>
              <p>Support for multiple programming languages</p>
            </div>
          </div>

          <div className="join-section">
            <div className="username-input">
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input"
                maxLength={20}
              />
            </div>

            {error && <div className="error">{error}</div>}

            <div className="actions">
              <button onClick={createRoom} className="btn btn-primary">
                <Plus size={16} />
                Create New Room
              </button>
            </div>

            <div className="rooms-section">
              <h2>Active Rooms</h2>
              {loading ? (
                <div className="loading">
                  <div className="spinner"></div>
                </div>
              ) : rooms.length > 0 ? (
                <div className="rooms-grid">
                  {rooms.map((room) => (
                    <div key={room.id} className="room-card">
                      <div className="room-info">
                        <h3>Room {room.id.slice(0, 8)}...</h3>
                        <p>{room.userCount} user{room.userCount !== 1 ? 's' : ''} online</p>
                      </div>
                      <button
                        onClick={() => joinRoom(room.id)}
                        className="btn btn-secondary"
                      >
                        Join Room
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-rooms">No active rooms. Create one to get started!</p>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2025 Collaborative Code Editor. Made by Ameesh Mohammed Pv</p>
        </div>
      </footer>
    </div>
  );
};

export default Home; 