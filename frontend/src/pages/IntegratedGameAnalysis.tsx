import { Link } from 'react-router-dom'
import { useIsMobile } from '../hooks/use-mobile'
const games = [
  { name: 'Word Search', path: '/wordsearch', icon: '🔍' },
  { name: 'Memory Match', path: '/memorymatch', icon: '🧠' },
  { name: 'Math Challenge', path: '/mathchallenge', icon: '🔢' },
  { name: 'Jigsaw Puzzle', path: '/jigsawpuzzle', icon: '🧩' },
  { name: 'Shape Drawing', path: '/clockdrawing', icon: '📊' }
]

export default function IntegratedGameAnalysis() {
  const isMobile = useIsMobile()

  return (
    <div className="container" style={{ padding: isMobile ? '10px' : '20px' }}>
      {/* Header with Home Button */}
      <div style={{ marginBottom: isMobile ? '1rem' : '2rem' }}>
        <Link 
          to="/" 
          className="btn-nav"
        >
          🏠 {isMobile ? 'Home' : 'Back to Home'}
        </Link>
      </div>
      
      {/* Main Content Card */}
      <div className="card text-center" style={{
        padding: isMobile ? '1.5rem' : '3rem',
        borderRadius: '16px',
        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0'
      }}>
        <h1 className="home-title" style={{
          fontSize: isMobile ? '2rem' : '3rem',
          marginBottom: isMobile ? '0.75rem' : '1rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          🕹️ Game Hub 🎮
        </h1>
        <p className="home-subtitle" style={{
          fontSize: isMobile ? '1rem' : '1.2rem',
          color: '#64748b',
          marginBottom: isMobile ? '1.5rem' : '2rem',
          lineHeight: '1.6'
        }}>
          Choose a game to play and challenge yourself!
        </p>
        
        {/* Games Grid */}
        <div className="games-grid" style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(auto-fit, minmax(150px, 1fr))' : 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: isMobile ? '1rem' : '1.5rem',
          marginTop: isMobile ? '1rem' : '2rem'
        }}>
          {games.map(game => (
            <Link 
              key={game.path} 
              to={game.path} 
              className="game-link"
              style={{
                textDecoration: 'none',
                display: 'block',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (!isMobile) {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isMobile) {
                  e.currentTarget.style.transform = 'translateY(0)'
                }
              }}
            >
              <div className="game-card" style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: isMobile ? '1.25rem' : '1.5rem',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                border: '2px solid #e2e8f0',
                textAlign: 'center',
                minHeight: isMobile ? '120px' : '150px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}>
                <div className="game-icon" style={{
                  fontSize: isMobile ? '2.5rem' : '3rem',
                  marginBottom: isMobile ? '0.5rem' : '0.75rem'
                }}>
                  {game.icon}
                </div>
                <h3 className="game-name" style={{
                  color: '#1e293b',
                  margin: '0',
                  fontSize: isMobile ? '1rem' : '1.2rem',
                  fontWeight: '600'
                }}>
                  {game.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
