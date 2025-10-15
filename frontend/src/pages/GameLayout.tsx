import { ReactNode, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

interface GameLayoutProps {
  title: string
  children: ReactNode
  onComplete?: () => void
  startTime: number
}

export default function GameLayout({ title, children, onComplete: _onComplete, startTime }: GameLayoutProps) {
  const [time, setTime] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [startTime])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="container">
      <div className="card">
        <div className="game-header">
          <h1 className="game-title">{title}</h1>
          <div className="game-controls">
            <span className="game-timer">⏱️ {formatTime(time)}</span>
            <Link to="/game-analysis" className="btn btn-home">
              🏠 Home
            </Link>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}