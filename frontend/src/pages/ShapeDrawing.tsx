import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import GameLayout from './GameLayout'

const SHAPES = [
  { name: 'Circle', icon: '⭕', description: 'Draw a circle', validation: 'circular' },
  { name: 'Square', icon: '⬜', description: 'Draw a square', validation: 'square' },
  { name: 'Rectangle', icon: '▬', description: 'Draw a rectangle', validation: 'rectangle' },
  { name: 'Triangle', icon: '🔺', description: 'Draw a triangle', validation: 'triangle' },
  { name: 'Diamond', icon: '💎', description: 'Draw a diamond shape', validation: 'diamond' }
]

export default function ShapeDrawing() {
  const navigate = useNavigate()
  const [startTime] = useState(Date.now())
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)
  const [currentShapeIndex, setCurrentShapeIndex] = useState(0)
  const [completedShapes, setCompletedShapes] = useState<string[]>([])
  const [drawnStrokes, setDrawnStrokes] = useState<{x: number, y: number}[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set responsive canvas size
    const isMobile = window.innerWidth <= 767
    const canvasSize = isMobile ? 300 : 400

    canvas.width = canvasSize
    canvas.height = canvasSize

    // Clear canvas with white background
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  const getEventPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    let clientX, clientY
    if ('touches' in e) {
      // Touch event
      if (e.touches.length === 0) return { x: 0, y: 0 }
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      // Mouse event
      clientX = e.clientX
      clientY = e.clientY
    }

    const x = (clientX - rect.left) * scaleX
    const y = (clientY - rect.top) * scaleY
    return { x, y }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault() // Prevent scrolling on touch
    const canvas = canvasRef.current
    if (!canvas) return

    const { x, y } = getEventPos(e)
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
    setHasDrawn(true)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    e.preventDefault() // Prevent scrolling on touch

    const canvas = canvasRef.current
    if (!canvas) return

    const { x, y } = getEventPos(e)
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.strokeStyle = "#1e293b"
    ctx.lineWidth = 3
    ctx.lineTo(x, y)
    ctx.stroke()
    
    // Track drawing strokes for validation
    setDrawnStrokes(prev => [...prev, { x, y }])
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Fill with white background
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    setHasDrawn(false)
    setDrawnStrokes([])
  }

  const validateShapeDrawing = () => {
    if (drawnStrokes.length < 10) {
      return { isValid: false, score: 0, feedback: "More drawing is needed. Try to draw the complete shape." }
    }

    const canvas = canvasRef.current
    if (!canvas) return { isValid: false, score: 0, feedback: "Cannot analyze drawing." }

    const currentShape = SHAPES[currentShapeIndex]
    // const isMobile = window.innerWidth <= 767
    // const canvasSize = isMobile ? 300 : 400
    // const centerX = canvasSize / 2
    // const centerY = canvasSize / 2

    let score = 0
    const feedback: string[] = []

    // Calculate bounding box of the drawing
    const minX = Math.min(...drawnStrokes.map(s => s.x))
    const maxX = Math.max(...drawnStrokes.map(s => s.x))
    const minY = Math.min(...drawnStrokes.map(s => s.y))
    const maxY = Math.max(...drawnStrokes.map(s => s.y))
    const width = maxX - minX
    const height = maxY - minY
    const drawingCenterX = (minX + maxX) / 2
    const drawingCenterY = (minY + maxY) / 2

    switch (currentShape.validation) {
      case 'circular':
        // Check for circular pattern
        const avgRadius = Math.min(width, height) / 2
        const circularPoints = drawnStrokes.filter(stroke => {
          const distance = Math.sqrt((stroke.x - drawingCenterX) ** 2 + (stroke.y - drawingCenterY) ** 2)
          return Math.abs(distance - avgRadius) < avgRadius * 0.3
        })
        
        if (circularPoints.length > drawnStrokes.length * 0.6) {
          score += 3
          feedback.push("✓ Good circular shape detected")
        } else if (circularPoints.length > drawnStrokes.length * 0.4) {
          score += 2
          feedback.push("✓ Circular shape detected, could be more round")
        } else {
          feedback.push("⚠ Shape should be more circular")
        }
        break

      case 'square':
        // Check for square-like properties (similar width and height)
        const aspectRatio = Math.max(width, height) / Math.min(width, height)
        if (aspectRatio < 1.3) {
          score += 2
          feedback.push("✓ Good square proportions")
        } else {
          feedback.push("⚠ Square should have equal sides")
        }
        
        // Check for corner-like patterns
        const corners = detectCorners()
        if (corners >= 3) {
          score += 2
          feedback.push("✓ Square corners detected")
        } else {
          feedback.push("⚠ Square needs 4 corners")
        }
        break

      case 'rectangle':
        // Check for rectangular properties (different width and height)
        const rectAspectRatio = Math.max(width, height) / Math.min(width, height)
        if (rectAspectRatio > 1.4 && rectAspectRatio < 3) {
          score += 2
          feedback.push("✓ Good rectangular proportions")
        } else {
          feedback.push("⚠ Rectangle should have different width and height")
        }
        
        const rectCorners = detectCorners()
        if (rectCorners >= 3) {
          score += 2
          feedback.push("✓ Rectangle corners detected")
        } else {
          feedback.push("⚠ Rectangle needs 4 corners")
        }
        break

      case 'triangle':
        const triCorners = detectCorners()
        if (triCorners >= 2) {
          score += 3
          feedback.push("✓ Triangle corners detected")
        } else {
          feedback.push("⚠ Triangle needs 3 corners/points")
        }
        
        // Check for triangular distribution
        const topPoints = drawnStrokes.filter(s => s.y < drawingCenterY).length
        const bottomPoints = drawnStrokes.filter(s => s.y > drawingCenterY).length
        if (topPoints > 0 && bottomPoints > 0) {
          score += 1
          feedback.push("✓ Triangle shape detected")
        }
        break

      case 'diamond':
        // Check for diamond-like properties (roughly square but rotated)
        const diamondCorners = detectCorners()
        if (diamondCorners >= 2) {
          score += 2
          feedback.push("✓ Diamond points detected")
        }
        
        // Check for diamond distribution (points in all 4 directions)
        const quadrants = [0, 0, 0, 0]
        drawnStrokes.forEach(stroke => {
          const dx = stroke.x - drawingCenterX
          const dy = stroke.y - drawingCenterY
          if (dx > 0 && dy < 0) quadrants[0]++  // Top right
          else if (dx < 0 && dy < 0) quadrants[1]++  // Top left
          else if (dx < 0 && dy > 0) quadrants[2]++  // Bottom left
          else if (dx > 0 && dy > 0) quadrants[3]++  // Bottom right
        })
        
        const activeQuads = quadrants.filter(q => q > 0).length
        if (activeQuads >= 4) {
          score += 2
          feedback.push("✓ Diamond shape in all quadrants")
        } else if (activeQuads >= 3) {
          score += 1
          feedback.push("✓ Diamond shape detected")
        } else {
          feedback.push("⚠ Diamond should extend in all directions")
        }
        break
    }

    // General drawing quality check
    if (drawnStrokes.length > 30) {
      score += 1
      feedback.push("✓ Good drawing detail")
    }

    const isValid = score >= 3
    return {
      isValid,
      score,
      feedback: feedback.join('\n')
    }
  }

  const detectCorners = () => {
    // Simple corner detection by looking for direction changes
    let corners = 0
    const windowSize = 5
    
    for (let i = windowSize; i < drawnStrokes.length - windowSize; i++) {
      const beforePoints = drawnStrokes.slice(i - windowSize, i)
      const afterPoints = drawnStrokes.slice(i, i + windowSize)
      
      // Calculate average directions
      const beforeDir = getAverageDirection(beforePoints)
      const afterDir = getAverageDirection(afterPoints)
      
      // Check for significant direction change
      const angleDiff = Math.abs(beforeDir - afterDir)
      const normalizedAngleDiff = Math.min(angleDiff, 2 * Math.PI - angleDiff)
      
      if (normalizedAngleDiff > Math.PI / 3) { // 60 degrees
        corners++
      }
    }
    
    return Math.min(corners, 8) // Cap at 8 to avoid noise
  }

  const getAverageDirection = (points: {x: number, y: number}[]) => {
    if (points.length < 2) return 0
    
    let totalAngle = 0
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i-1].x
      const dy = points[i].y - points[i-1].y
      totalAngle += Math.atan2(dy, dx)
    }
    
    return totalAngle / (points.length - 1)
  }

  const handleComplete = () => {
    const validation = validateShapeDrawing()
    const currentShape = SHAPES[currentShapeIndex]
    
    if (validation.isValid) {
      const newCompleted = [...completedShapes, currentShape.name]
      setCompletedShapes(newCompleted)
      
      const timeTaken = Math.floor((Date.now() - startTime) / 1000)
      const analysis = `🎉 Shape Drawing Validated!\n\n📊 Analysis for ${currentShape.name}:\n• Time: ${Math.floor(timeTaken/60)}m ${timeTaken%60}s\n• Validation Score: ${validation.score}/5\n\n${validation.feedback}\n\n🧠 Cognitive Skills Demonstrated:\n• Visuospatial construction\n• Fine motor control\n• Shape recognition\n• Spatial planning\n\n${newCompleted.length < SHAPES.length ? '🎯 Ready for the next shape?' : '⭐ All shapes completed! Excellent work!'}`
      
      alert(analysis)
      
      if (newCompleted.length < SHAPES.length) {
        // Move to next shape
        setCurrentShapeIndex(prev => prev + 1)
        clearCanvas()
      } else {
        // All shapes completed
        navigate("/game-analysis", { state: { game: 'Shape Drawing', time: timeTaken, completedShapes: newCompleted, analysis } })
      }
    } else {
      alert(`📝 Drawing needs improvement:\n\n${validation.feedback}\n\nScore: ${validation.score}/5\n\nTip: Try to draw a clear ${currentShape.name.toLowerCase()} shape. Pay attention to the proportions and corners.`)
    }
  }

  const handleEndGame = () => {
    const analysis = `🏁 Shape Drawing Session Complete!\n\n📊 Final Results:\n• Shapes completed: ${completedShapes.length}/${SHAPES.length}\n• Completed: ${completedShapes.join(', ')}\n\n🧠 Shape drawing is an excellent cognitive assessment tool that evaluates visuospatial construction, fine motor skills, and geometric understanding.\n\n⭐ ${completedShapes.length >= 3 ? 'Excellent visuospatial performance!' : 'Good effort! Practice helps improve drawing skills.'}`
    alert(analysis)
    navigate("/game-analysis", { state: { game: 'Shape Drawing', completedShapes, analysis } })
  }

  const getShapeInstructions = (shapeType: string) => {
    switch (shapeType) {
      case 'circular':
        return [
          <li key="1">Draw a smooth, round circle</li>,
          <li key="2">Try to make it as circular as possible</li>,
          <li key="3">The shape should be closed (connected)</li>
        ]
      case 'square':
        return [
          <li key="1">Draw four straight sides of equal length</li>,
          <li key="2">Make four 90-degree corners</li>,
          <li key="3">Ensure the shape is closed</li>
        ]
      case 'rectangle':
        return [
          <li key="1">Draw four straight sides</li>,
          <li key="2">Make opposite sides equal (longer than wide or wider than long)</li>,
          <li key="3">Create four 90-degree corners</li>
        ]
      case 'triangle':
        return [
          <li key="1">Draw three straight sides</li>,
          <li key="2">Connect them to form three corners</li>,
          <li key="3">Make sure the shape is closed</li>
        ]
      case 'diamond':
        return [
          <li key="1">Draw four sides of equal length</li>,
          <li key="2">Make it look like a rotated square</li>,
          <li key="3">Create four pointed corners</li>
        ]
      default:
        return [<li key="1">Draw the requested shape</li>]
    }
  }

  const currentShape = SHAPES[currentShapeIndex]
  
  return (
    <GameLayout title="Shape Drawing" startTime={startTime}>
      <div className="text-center">
        <div className="shape-progress">
          <span>Shape {currentShapeIndex + 1} of {SHAPES.length}</span>
          <span>Completed: {completedShapes.length}/{SHAPES.length}</span>
        </div>
        
        <h2 className="shape-title">
          {currentShape.icon} {currentShape.description}
        </h2>

        <div className="shape-canvas-container">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            onTouchCancel={stopDrawing}
            className="shape-canvas"
          />
        </div>

        <div className="shape-controls">
          <button
            onClick={clearCanvas}
            className="btn btn-secondary"
          >
            Clear Canvas
          </button>
          <button
            onClick={handleComplete}
            disabled={!hasDrawn}
            className="btn"
          >
            Submit Drawing
          </button>
          <button
            onClick={handleEndGame}
            className="btn btn-secondary"
            title="End the session and see your results"
          >
            End Session
          </button>
        </div>
      </div>

      <div className="shape-instructions">
        <p className="instructions-title">How to draw {currentShape.name}:</p>
        <ul className="instructions-list">
          {getShapeInstructions(currentShape.validation)}
        </ul>
        
        {completedShapes.length > 0 && (
          <div className="completed-shapes">
            <p><strong>Completed shapes:</strong> {completedShapes.join(', ')}</p>
          </div>
        )}
      </div>
    </GameLayout>
  )
}