import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import GameLayout from './GameLayout'

const CATEGORIES = ["Animals", "Nature", "Food", "Vehicles", "Architecture"]

interface PuzzlePiece {
  id: number
  currentPosition: number
  correctPosition: number
  imageUrl: string
  x: number
  y: number
  width: number
  height: number
}

const GRID_SIZE = 3
const PEXELS_API_KEY = 'KZSnPrVsO9NsP55GR18OSF6oBSjBi2RrGzB5Wz85EVWxFX775wBrRamT'

export default function JigsawPuzzle() {
  const navigate = useNavigate()
  const [setupComplete, setSetupComplete] = useState(false)
  const [category, setCategory] = useState("")
  const [loading, setLoading] = useState(false)
  const [startTime, setStartTime] = useState(Date.now())
  const [pieces, setPieces] = useState<PuzzlePiece[]>([])
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null)
  const [moves, setMoves] = useState(0)
  const [originalImage, setOriginalImage] = useState("")

  const generateImage = async (category: string) => {
    try {
      const response = await fetch(`https://api.pexels.com/v1/search?query=${category.toLowerCase()}&per_page=20&orientation=square`, {
        headers: {
          'Authorization': PEXELS_API_KEY
        }
      })
      
      if (!response.ok) {
        console.warn(`Pexels API failed: ${response.status} ${response.statusText}`)
        throw new Error('Failed to fetch image')
      }
      
      const data = await response.json()
      if (data.photos && data.photos.length > 0) {
        // Select a random image from the results
        const randomIndex = Math.floor(Math.random() * data.photos.length)
        const photo = data.photos[randomIndex]
        // Use medium size for better quality, with fallback to original
        const imageUrl = photo.src.medium || photo.src.original
        console.log(`Using Pexels image for ${category}:`, imageUrl)
        return imageUrl
      } else {
        throw new Error('No images found')
      }
    } catch (error) {
      console.error('Error fetching Pexels image:', error)
      // Enhanced fallback with category-specific images from Picsum
      const fallbackImages = {
        animals: `https://picsum.photos/400/400?random=${Date.now()}&category=animals`,
        nature: `https://picsum.photos/400/400?random=${Date.now()}&category=nature`,
        food: `https://picsum.photos/400/400?random=${Date.now()}&category=food`,
        vehicles: `https://picsum.photos/400/400?random=${Date.now()}&category=tech`,
        architecture: `https://picsum.photos/400/400?random=${Date.now()}&category=architecture`
      }
      const fallbackUrl = fallbackImages[category.toLowerCase() as keyof typeof fallbackImages] || 
                         `https://picsum.photos/400/400?random=${Date.now()}`
      console.log(`Using fallback image for ${category}:`, fallbackUrl)
      return fallbackUrl
    }
  }

  const handleStartGame = async () => {
    if (!category) return
    setLoading(true)
    
    try {
      const imageUrl = await generateImage(category)
      setOriginalImage(imageUrl)
      setSetupComplete(true)
      setStartTime(Date.now())
    } catch (error) {
      console.error('Error starting game:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (setupComplete && originalImage) initializePuzzle()
  }, [setupComplete, originalImage])

  const initializePuzzle = () => {
    const totalPieces = GRID_SIZE * GRID_SIZE
    const pieceWidth = 300 / GRID_SIZE
    const pieceHeight = 300 / GRID_SIZE

    // Create pieces with their correct positions and image coordinates
    const initialPieces: PuzzlePiece[] = Array.from({ length: totalPieces }, (_, i) => {
      const row = Math.floor(i / GRID_SIZE)
      const col = i % GRID_SIZE
      
      return {
        id: i,
        currentPosition: i, // This will be shuffled
        correctPosition: i,
        imageUrl: originalImage,
        x: col * pieceWidth,
        y: row * pieceHeight,
        width: pieceWidth,
        height: pieceHeight
      }
    })

    // Create shuffled array of positions
    const shuffledPositions = Array.from({ length: totalPieces }, (_, i) => i)
    for (let i = shuffledPositions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffledPositions[i], shuffledPositions[j]] = [shuffledPositions[j], shuffledPositions[i]]
    }
    
    // Assign shuffled positions to pieces
    initialPieces.forEach((piece, index) => {
      piece.currentPosition = shuffledPositions[index]
    })


    setPieces(initialPieces)
  }

  const handlePieceClick = (position: number) => {
    if (selectedPiece === null) {
      // First click - select the piece
      setSelectedPiece(position)
    } else if (selectedPiece !== position) {
      // Second click on different position - swap pieces
      const piece1 = pieces.find(p => p.currentPosition === selectedPiece)
      const piece2 = pieces.find(p => p.currentPosition === position)
      
      if (piece1 && piece2) {
        setPieces(prev => {
          const newPieces = prev.map(piece => {
            if (piece.id === piece1.id) {
              return { ...piece, currentPosition: position }
            } else if (piece.id === piece2.id) {
              return { ...piece, currentPosition: selectedPiece }
            }
            return piece
          })
          return newPieces
        })
      }
      setSelectedPiece(null)
      setMoves(m => m + 1)
    } else {
      // Clicked same position - deselect
      setSelectedPiece(null)
    }
  }

  const isPuzzleSolved = pieces.every(piece => piece.currentPosition === piece.correctPosition)

  const handleComplete = () => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000)
    const analysis = `🎉 Jigsaw Puzzle Complete!\n\n📊 Performance Analysis:\n• Time: ${Math.floor(timeTaken/60)}m ${timeTaken%60}s\n• Moves: ${moves}\n• Category: ${category}\n• Efficiency: ${moves <= 15 ? 'Excellent' : moves <= 25 ? 'Good' : 'Needs Practice'}\n\n🧠 Cognitive Skills Demonstrated:\n• Spatial reasoning\n• Visual pattern recognition\n• Problem-solving strategy\n• Sequential planning\n\n⭐ ${moves <= 15 ? 'Outstanding spatial reasoning!' : 'Good puzzle-solving skills!'}`
    alert(analysis)
    navigate("/game-analysis", { state: { game: 'Jigsaw Puzzle', time: timeTaken, moves, category, analysis } })
  }

  const getPieceAtPosition = (position: number) => {
    return pieces.find(p => p.currentPosition === position)
  }

  const getResponsiveBackgroundPosition = (piece: PuzzlePiece) => {
    // Calculate responsive background position based on screen size
    if (typeof window !== 'undefined') {
      if (window.innerWidth <= 767) {
        // Mobile: 240px grid, 80px pieces
        const scale = 240 / 300
        return `-${piece.x * scale}px -${piece.y * scale}px`
      } else if (window.innerWidth <= 1024) {
        // Tablet: 260px grid, 86px pieces
        const scale = 260 / 300
        return `-${piece.x * scale}px -${piece.y * scale}px`
      }
    }
    // Desktop: 300px grid, 100px pieces
    return `-${piece.x}px -${piece.y}px`
  }

  if (!setupComplete) {
    return (
      <div className="container">
        <div className="card text-center">
          <h1 className="mb-4">🧩 Jigsaw Puzzle</h1>
          <div className="mb-4">
            <h3 className="mb-4">Select Category:</h3>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className="btn"
                  style={{ 
                    background: category === cat ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f0f0f0',
                    color: category === cat ? 'white' : '#333'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleStartGame} disabled={!category || loading} className="btn">
            {loading ? 'Generating Image...' : 'Start Game'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <GameLayout title="Jigsaw Puzzle" startTime={startTime}>
      <div className="mb-4 text-center">
        <p style={{ fontSize: '1.2rem', fontWeight: '600' }}>
          Moves: <span style={{ color: '#667eea' }}>{moves}</span>
        </p>
      </div>

      <div className="jigsaw-container">
        {/* Reference Image */}
        <div className="reference-section">
          <h4 className="reference-title">Reference:</h4>
          <img 
            src={originalImage} 
            alt="Reference" 
            className="reference-image"
          />
        </div>

        {/* Puzzle Grid */}
        <div className="puzzle-grid">
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, position) => {
            const piece = getPieceAtPosition(position)
            const isSelected = selectedPiece === position
            const isCorrect = piece?.currentPosition === piece?.correctPosition

            if (!piece) return null

            return (
              <div
                key={`${position}-${piece.id}`}
                onClick={() => handlePieceClick(position)}
                className={`puzzle-piece ${isSelected ? 'selected' : ''} ${isCorrect ? 'correct' : ''}`}
                style={{
                  backgroundImage: `url(${piece.imageUrl})`,
                  backgroundPosition: getResponsiveBackgroundPosition(piece),
                }}
              >
                {isCorrect && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(16, 185, 129, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    color: '#10b981'
                  }}>
                    ✓
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {isPuzzleSolved && (
        <div className="success text-center p-4 rounded mt-4">
          🎉 Puzzle completed!
        </div>
      )}

      <div className="text-center mt-4">
        <button
          onClick={handleComplete}
          disabled={!isPuzzleSolved}
          className="btn"
          style={{ fontSize: '1.1rem', padding: '12px 30px' }}
        >
          Submit Puzzle
        </button>
      </div>

      <div className="puzzle-instructions">
        <span className="instructions-text">
          Tap two pieces to swap their positions. Use the reference image to solve the puzzle.
        </span>
        {selectedPiece !== null && (
          <div className="selected-indicator">
            Selected tile at position {selectedPiece + 1} - Tap another tile to swap
          </div>
        )}
      </div>
    </GameLayout>
  )
}