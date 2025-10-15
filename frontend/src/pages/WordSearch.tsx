import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import GameLayout from './GameLayout'

const THEMES = ["nature", "films", "sports", "food", "hobbies"]

const THEME_WORDS = {
  nature: ["TREE", "FLOWER", "RIVER", "MOUNTAIN", "FOREST", "OCEAN", "GRASS", "SUNSHINE", "RAIN", "CLOUD", "BIRD", "BUTTERFLY", "LEAF", "STONE", "WIND"],
  films: ["MOVIE", "CAMERA", "ACTION", "DRAMA", "COMEDY", "DIRECTOR", "ACTOR", "SCRIPT", "SCENE", "CINEMA", "TICKET", "POPCORN", "SCREEN", "PREMIERE", "OSCAR"],
  sports: ["FOOTBALL", "BASKETBALL", "TENNIS", "GOLF", "SWIMMING", "RUNNING", "JUMPING", "SOCCER", "BASEBALL", "HOCKEY", "VOLLEYBALL", "BOXING", "CYCLING", "SKIING", "SURFING"],
  food: ["PIZZA", "BURGER", "PASTA", "SALAD", "CHICKEN", "FISH", "RICE", "BREAD", "CHEESE", "APPLE", "BANANA", "ORANGE", "CAKE", "COOKIE", "SANDWICH"],
  hobbies: ["READING", "COOKING", "PAINTING", "MUSIC", "DANCING", "SINGING", "WRITING", "GAMING", "HIKING", "FISHING", "GARDENING", "KNITTING", "CHESS", "YOGA", "CRAFTS"]
}

export default function WordSearch() {
  const navigate = useNavigate()
  const [setupComplete, setSetupComplete] = useState(false)
  const [theme, setTheme] = useState("")
  const [wordCount, setWordCount] = useState(5)
  const [words, setWords] = useState<string[]>([])
  const [startTime, setStartTime] = useState(Date.now())
  const [grid, setGrid] = useState<string[][]>([])
  const [foundWords, setFoundWords] = useState<string[]>([])
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set())
  const [foundCells, setFoundCells] = useState<Set<string>>(new Set())
  const [isSelecting, setIsSelecting] = useState(false)
  const [wordPositions, setWordPositions] = useState<Map<string, string[]>>(new Map())

  const handleStartGame = () => {
    if (!theme) return
    const themeWords = THEME_WORDS[theme as keyof typeof THEME_WORDS]
    const selectedWords = themeWords.sort(() => Math.random() - 0.5).slice(0, wordCount)
    setWords(selectedWords)
    setSetupComplete(true)
    setStartTime(Date.now())
  }

  useEffect(() => {
    if (setupComplete && words.length > 0) generateGrid()
  }, [setupComplete, words])

  const generateGrid = () => {
    const gridSize = 12
    const newGrid: string[][] = Array(gridSize).fill(null).map(() =>
      Array(gridSize).fill(null).map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26)))
    )
    const positions = new Map<string, string[]>()
    
    words.forEach((word) => {
      let placed = false
      let attempts = 0
      
      while (!placed && attempts < 50) {
        const direction = Math.random() < 0.5 ? 'horizontal' : 'vertical'
        const startRow = direction === 'vertical' ? Math.floor(Math.random() * (gridSize - word.length + 1)) : Math.floor(Math.random() * gridSize)
        const startCol = direction === 'horizontal' ? Math.floor(Math.random() * (gridSize - word.length + 1)) : Math.floor(Math.random() * gridSize)
        
        const wordCells: string[] = []
        let canPlace = true
        
        for (let i = 0; i < word.length; i++) {
          const row = direction === 'vertical' ? startRow + i : startRow
          const col = direction === 'horizontal' ? startCol + i : startCol
          wordCells.push(`${row}-${col}`)
        }
        
        if (canPlace) {
          for (let i = 0; i < word.length; i++) {
            const row = direction === 'vertical' ? startRow + i : startRow
            const col = direction === 'horizontal' ? startCol + i : startCol
            newGrid[row][col] = word[i]
          }
          positions.set(word, wordCells)
          placed = true
        }
        attempts++
      }
    })

    setGrid(newGrid)
    setWordPositions(positions)
  }

  const handleStartSelection = (row: number, col: number) => {
    setIsSelecting(true)
    setSelectedCells(new Set([`${row}-${col}`]))
    // Prevent body scrolling during word selection on mobile
    document.body.style.overflow = 'hidden'
  }

  const handleContinueSelection = (row: number, col: number) => {
    if (!isSelecting) return
    setSelectedCells(prev => new Set([...prev, `${row}-${col}`]))
  }

  const handleEndSelection = () => {
    setIsSelecting(false)
    checkForWord(selectedCells)
    // Restore body scrolling
    document.body.style.overflow = 'auto'
  }

  const handleMouseDown = (row: number, col: number) => {
    handleStartSelection(row, col)
  }

  const handleMouseEnter = (row: number, col: number) => {
    handleContinueSelection(row, col)
  }

  const handleMouseUp = () => {
    handleEndSelection()
  }

  const handleTouchStart = (e: React.TouchEvent, row: number, col: number) => {
    e.preventDefault()
    handleStartSelection(row, col)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    if (!isSelecting) return
    
    const touch = e.touches[0]
    if (!touch) return
    
    const element = document.elementFromPoint(touch.clientX, touch.clientY)
    if (element && element.hasAttribute('data-cell')) {
      const cellData = element.getAttribute('data-cell')
      if (cellData && cellData.includes('-')) {
        const [row, col] = cellData.split('-').map(Number)
        if (!isNaN(row) && !isNaN(col)) {
          handleContinueSelection(row, col)
        }
      }
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault()
    handleEndSelection()
  }

  const checkForWord = (selected: Set<string>) => {
    const selectedArray = Array.from(selected)
    words.forEach(word => {
      if (foundWords.includes(word)) return
      const positions = wordPositions.get(word)
      if (!positions) return
      
      if (positions.every(pos => selectedArray.includes(pos))) {
        setFoundWords([...foundWords, word])
        setFoundCells(prev => new Set([...prev, ...positions]))
        setSelectedCells(new Set())
        
        if (foundWords.length + 1 === words.length) {
          setTimeout(() => handleComplete(), 500)
        }
      }
    })
    
    setTimeout(() => setSelectedCells(new Set()), 300)
  }

  const handleComplete = () => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000)
    const analysis = `🎉 Word Search Complete!\n\n📊 Performance Analysis:\n• Time: ${Math.floor(timeTaken/60)}m ${timeTaken%60}s\n• Words Found: ${foundWords.length}/${words.length}\n• Theme: ${theme}\n• Difficulty: ${wordCount} words\n\n🧠 Cognitive Skills Demonstrated:\n• Visual scanning and pattern recognition\n• Sustained attention and focus\n• Spatial processing abilities\n• Working memory utilization\n\n⭐ ${foundWords.length === words.length ? 'Perfect completion! Excellent visual processing skills.' : 'Good effort! Practice improves visual scanning speed.'}`
    alert(analysis)
    navigate("/game-analysis", { state: { game: 'Word Search', time: timeTaken, wordsFound: foundWords.length, totalWords: words.length, theme, wordCount, analysis } })
  }

  if (!setupComplete) {
    return (
      <div className="container">
        <div className="card text-center">
          <h1 className="mb-4">🔍 Word Search</h1>
          <div className="mb-4">
            <h3 className="mb-4">Select Theme:</h3>
            <div className="wordsearch-themes">
              {THEMES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className="btn theme-btn"
                  style={{ 
                    background: theme === t ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f0f0f0',
                    color: theme === t ? 'white' : '#333'
                  }}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4 wordsearch-slider">
            <label className="slider-label">Words: {wordCount}</label>
            <input
              type="range"
              min="3"
              max="8"
              value={wordCount}
              onChange={(e) => setWordCount(parseInt(e.target.value))}
              className="word-count-slider"
            />
          </div>
          <button onClick={handleStartGame} disabled={!theme} className="btn">
            Start Game
          </button>
        </div>
      </div>
    )
  }

  return (
    <GameLayout title="Word Search" startTime={startTime}>
      <div className="wordsearch-words">
        <h3 className="words-title">Find these words:</h3>
        <div className="words-list">
          {words.map(word => (
            <span
              key={word}
              className={`word-chip ${foundWords.includes(word) ? 'found' : ''}`}
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      <div className="wordsearch-container">
        <div 
          className="wordsearch-grid"
          onMouseUp={handleMouseUp}
          onMouseLeave={() => setIsSelecting(false)}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {grid.map((row, rowIdx) =>
            row.map((letter, colIdx) => {
              const cellKey = `${rowIdx}-${colIdx}`
              const isSelected = selectedCells.has(cellKey)
              const isFound = foundCells.has(cellKey)
              return (
                <button
                  key={cellKey}
                  data-cell={cellKey}
                  className={`grid-cell ${isFound ? 'found' : ''} ${isSelected ? 'selected' : ''}`}
                  onMouseDown={() => handleMouseDown(rowIdx, colIdx)}
                  onMouseEnter={() => handleMouseEnter(rowIdx, colIdx)}
                  onTouchStart={(e) => handleTouchStart(e, rowIdx, colIdx)}
                >
                  {letter}
                </button>
              )
            })
          )}
        </div>
      </div>
      
      <div className="wordsearch-instructions">
        <p>Drag across letters to find words. Words can be horizontal or vertical.</p>
        <p>Found: {foundWords.length}/{words.length} words</p>
      </div>
    </GameLayout>
  )
}