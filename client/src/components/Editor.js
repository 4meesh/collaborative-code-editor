import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  ArrowLeft, 
  Users, 
  Settings, 
  Copy, 
  Download,
  Code,
  Wifi,
  WifiOff
} from 'lucide-react';
import './Editor.css';

const Editor = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [users, setUsers] = useState([]);
  const [cursors, setCursors] = useState({});
  const [username, setUsername] = useState('');
  const [connected, setConnected] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const textareaRef = useRef(null);
  const editorRef = useRef(null);

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'sql', label: 'SQL' },
    { value: 'json', label: 'JSON' },
    { value: 'xml', label: 'XML' },
    { value: 'markdown', label: 'Markdown' }
  ];

  useEffect(() => {
    const usernameFromState = location.state?.username;
    if (!usernameFromState) {
      navigate('/');
      return;
    }
    setUsername(usernameFromState);

    // Initialize socket connection
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Join room
    newSocket.emit('join-room', roomId, usernameFromState);

    // Socket event listeners
    newSocket.on('connect', () => {
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    newSocket.on('room-state', (state) => {
      setCode(state.code);
      setLanguage(state.language);
      setUsers(state.users);
    });

    newSocket.on('code-updated', (newCode) => {
      setCode(newCode);
    });

    newSocket.on('language-updated', (newLanguage) => {
      setLanguage(newLanguage);
    });

    newSocket.on('user-joined', (user) => {
      setUsers(prev => [...prev, user]);
    });

    newSocket.on('user-left', (userId) => {
      setUsers(prev => prev.filter(user => user.id !== userId));
      setCursors(prev => {
        const newCursors = { ...prev };
        delete newCursors[userId];
        return newCursors;
      });
    });

    newSocket.on('cursor-moved', (cursorData) => {
      setCursors(prev => ({
        ...prev,
        [cursorData.userId]: {
          position: cursorData.position,
          username: cursorData.username,
          color: cursorData.color
        }
      }));
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId, location.state, navigate]);

  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    setCode(newCode);
    if (socket) {
      socket.emit('code-change', roomId, newCode);
    }
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    if (socket) {
      socket.emit('language-change', roomId, newLanguage);
    }
  };

  const handleCursorMove = (e) => {
    if (socket && textareaRef.current) {
      const position = e.target.selectionStart;
      socket.emit('cursor-update', roomId, position);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
  };

  const downloadCode = () => {
    const extension = getFileExtension(language);
    const filename = `code.${extension}`;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getFileExtension = (lang) => {
    const extensions = {
      javascript: 'js',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      csharp: 'cs',
      php: 'php',
      ruby: 'rb',
      go: 'go',
      rust: 'rs',
      typescript: 'ts',
      html: 'html',
      css: 'css',
      sql: 'sql',
      json: 'json',
      xml: 'xml',
      markdown: 'md'
    };
    return extensions[lang] || 'txt';
  };

  const getLineNumber = (position) => {
    return code.substring(0, position).split('\n').length;
  };

  const getColumnNumber = (position) => {
    const lines = code.substring(0, position).split('\n');
    return lines[lines.length - 1].length + 1;
  };

  return (
    <div className="editor">
      <header className="editor-header">
        <div className="header-left">
          <button onClick={() => navigate('/')} className="btn btn-secondary">
            <ArrowLeft size={16} />
            Back
          </button>
          <div className="room-info">
            <h2>Room: {roomId.slice(0, 8)}...</h2>
            <div className="connection-status">
              {connected ? (
                <Wifi size={16} className="connected" />
              ) : (
                <WifiOff size={16} className="disconnected" />
              )}
              <span>{connected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
        </div>

        <div className="header-right">
          <div className="users-info">
            <Users size={16} />
            <span>{users.length} user{users.length !== 1 ? 's' : ''}</span>
          </div>
          <button 
            onClick={() => setShowSettings(!showSettings)} 
            className="btn btn-secondary"
          >
            <Settings size={16} />
          </button>
        </div>
      </header>

      {showSettings && (
        <div className="settings-panel">
          <div className="setting-group">
            <label>Language:</label>
            <select value={language} onChange={handleLanguageChange} className="input">
              {languages.map(lang => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
          <div className="setting-group">
            <button onClick={copyToClipboard} className="btn btn-secondary">
              <Copy size={16} />
              Copy Code
            </button>
            <button onClick={downloadCode} className="btn btn-secondary">
              <Download size={16} />
              Download
            </button>
          </div>
        </div>
      )}

      <div className="editor-container">
        <div className="editor-wrapper" ref={editorRef}>
          <div className="line-numbers">
            {code.split('\n').map((_, index) => (
              <div key={index} className="line-number">
                {index + 1}
              </div>
            ))}
          </div>
          
          <div className="code-editor">
            <textarea
              ref={textareaRef}
              value={code}
              onChange={handleCodeChange}
              onSelect={handleCursorMove}
              onKeyUp={handleCursorMove}
              onMouseUp={handleCursorMove}
              className="code-textarea"
              placeholder="Start coding..."
              spellCheck="false"
            />
            
            <div className="syntax-highlighter">
              <SyntaxHighlighter
                language={language}
                style={tomorrow}
                customStyle={{
                  margin: 0,
                  background: 'transparent',
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}
                showLineNumbers={false}
              >
                {code || ' '}
              </SyntaxHighlighter>
            </div>

            {/* Cursor indicators */}
            {Object.entries(cursors).map(([userId, cursorData]) => {
              if (userId === socket?.id) return null;
              
              const line = getLineNumber(cursorData.position);
              const column = getColumnNumber(cursorData.position);
              
              return (
                <div
                  key={userId}
                  className="remote-cursor"
                  style={{
                    left: `${(column - 1) * 8.4}px`,
                    top: `${(line - 1) * 21}px`,
                    borderColor: cursorData.color
                  }}
                >
                  <div 
                    className="cursor-label"
                    style={{ backgroundColor: cursorData.color }}
                  >
                    {cursorData.username}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="users-panel">
          <h3>Online Users</h3>
          <div className="users-list">
            {users.map(user => (
              <div key={user.id} className="user-item">
                <div 
                  className="user-avatar"
                  style={{ backgroundColor: user.color }}
                >
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="user-name">{user.username}</span>
                {user.id === socket?.id && <span className="you-badge">You</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor; 