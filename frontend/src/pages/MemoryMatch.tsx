import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import GameLayout from './GameLayout'

interface Card {
  id: number
  value: string
  isFlipped: boolean
  isMatched: boolean
}

const EMOJI_SETS = {
  easy: ["🧠", "🎯", "⭐", "🎨", "🔥", "💡", "🎭", "🌟"],
  medium: ["🚀", "🌈", "🎪", "🎸", "🎮", "🎲", "🎺", "🎻", "🏆", "🌺", "🦄", "🎁", "🌸", "🎃", "🎄", "🎈", "🎉", "🎊"],
  hard: ["🍎", "🍌", "🍇", "🍊", "🍓", "🍉", "🍒", "🍑", "🥝", "🍍", "🥥", "🥭", "🍏", "🍐", "🫐", "🍋", "🍈", "🍆", "🥑", "🌽", "🥕", "🥒", "🧅", "🧄", "🥦", "🥬", "🫑", "🥗", "🍄", "🥜", "🌰", "🍞"]
}

const DIFFICULTY_CONFIG = {
  easy: { gridCols: 2, pairs: 2, label: "Easy (2x2)" },
  medium: { gridCols: 4, pairs: 8, label: "Medium (4x4)" },
  hard: { gridCols: 6, pairs: 18, label: "Difficult (6x6)" }
}

export default function MemoryMatch() {
  const navigate = useNavigate()
  const [setupComplete, setSetupComplete] = useState(false)
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')
  const [startTime, setStartTime] = useState(Date.now())
  const [cards, setCards] = useState<Card[]>([])
  const [flippedIndices, setFlippedIndices] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [gridCols, setGridCols] = useState(4)

  const handleStartGame = () => {
    setSetupComplete(true)
    setStartTime(Date.now())
  }

  useEffect(() => {
    if (setupComplete) initializeCards()
  }, [setupComplete, difficulty])

  useEffect(() => {
    if (flippedIndices.length === 2) {
      const [first, second] = flippedIndices
      if (cards[first].value === cards[second].value) {
        setTimeout(() => {
          setCards(prev => prev.map((card, idx) =>
            idx === first || idx === second ? { ...card, isMatched: true } : card
          ))
          setFlippedIndices([])
        }, 500)
      } else {
        setTimeout(() => {
          setCards(prev => prev.map((card, idx) =>
            idx === first || idx === second ? { ...card, isFlipped: false } : card
          ))
          setFlippedIndices([])
        }, 1000)
      }
      setMoves(m => m + 1)
    }
  }, [flippedIndices, cards])

  const allMatched = cards.length > 0 && cards.every(card => card.isMatched)

  useEffect(() => {
    if (allMatched) {
      setTimeout(() => handleComplete(), 500)
    }
  }, [allMatched])

  const initializeCards = () => {
    const config = DIFFICULTY_CONFIG[difficulty]
    const emojis = EMOJI_SETS[difficulty].slice(0, config.pairs)
    const doubled = [...emojis, ...emojis]
    const shuffled = doubled
      .sort(() => Math.random() - 0.5)
      .map((value, id) => ({
        id,
        value,
        isFlipped: false,
        isMatched: false,
      }))
    setCards(shuffled)
    setGridCols(config.gridCols)
  }

  const handleCardClick = (index: number) => {
    if (flippedIndices.length === 2 || cards[index].isFlipped || cards[index].isMatched) return

    setCards(prev => prev.map((card, idx) =>
      idx === index ? { ...card, isFlipped: true } : card
    ))
    setFlippedIndices(prev => [...prev, index])
  }

  const handleComplete = () => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000)
    const analysis = `🎉 Memory Match Complete!\n\n📊 Performance Analysis:\n• Time: ${Math.floor(timeTaken/60)}m ${timeTaken%60}s\n• Moves: ${moves}\n• Difficulty: ${difficulty}\n• Efficiency: ${moves <= cards.length ? 'Excellent' : moves <= cards.length * 1.5 ? 'Good' : 'Needs Practice'}\n\n🧠 Cognitive Skills Demonstrated:\n• Short-term memory retention\n• Visual-spatial memory\n• Pattern recognition\n• Strategic thinking\n\n⭐ ${moves <= cards.length ? 'Outstanding memory performance!' : 'Good effort! Memory improves with practice.'}`
    alert(analysis)
    navigate("/game-analysis", { state: { game: 'Memory Match', time: timeTaken, moves, difficulty, analysis } })
  }

  if (!setupComplete) {
    return (
      <div className="container">
        <div className="card text-center">
          <h1 className="mb-4">🧠 Memory Match</h1>
          <div className="mb-4">
            <h3 className="mb-4">Select Difficulty:</h3>
            {(Object.keys(DIFFICULTY_CONFIG) as Array<keyof typeof DIFFICULTY_CONFIG>).map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficulty(diff)}
                className="btn"
                style={{ 
                  background: difficulty === diff ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f0f0f0',
                  color: difficulty === diff ? 'white' : '#333',
                  margin: '5px',
                  display: 'block',
                  width: '200px',
                  marginLeft: 'auto',
                  marginRight: 'auto'
                }}
              >
                {DIFFICULTY_CONFIG[diff].label}
              </button>
            ))}
          </div>
          <button onClick={handleStartGame} className="btn mt-4">
            Start Game
          </button>
        </div>
      </div>
    )
  }

  return (
    <GameLayout title="Memory Match" startTime={startTime}>
      <div className="mb-4 text-center">
        <p style={{ fontSize: '1.2rem', fontWeight: '600' }}>
          Moves: <span style={{ color: '#667eea' }}>{moves}</span>
        </p>
      </div>

      <div className={`memory-grid memory-grid-${gridCols}`}>
        {cards.map((card, index) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(index)}
            disabled={card.isMatched || card.isFlipped}
            className={`memory-card ${card.isFlipped || card.isMatched ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}`}
            style={{
              fontSize: gridCols === 4 ? '3rem' : gridCols === 6 ? '2rem' : '1.5rem',
            }}
          >
            {card.isFlipped || card.isMatched ? card.value : "?"}
          </button>
        ))}
      </div>

      {allMatched && (
        <div className="success text-center p-4 rounded mt-4">
          🎉 Congratulations! You matched all cards!
        </div>
      )}
    </GameLayout>
  )
}