import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import GameLayout from './GameLayout'

interface Problem {
  question: string
  answer: number
}

const DIFFICULTY_CONFIG = {
  easy: { range: 10, operations: ["+", "-"], problems: 10, label: "Easy" },
  medium: { range: 20, operations: ["+", "-", "×"], problems: 15, label: "Medium" },
  hard: { range: 50, operations: ["+", "-", "×"], problems: 20, label: "Difficult" }
}

export default function MathChallenge() {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [setupComplete, setSetupComplete] = useState(false)
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')
  const [startTime, setStartTime] = useState(Date.now())
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null)
  const [userAnswer, setUserAnswer] = useState("")
  const [score, setScore] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null)
  const [totalProblems, setTotalProblems] = useState(10)

  const handleStartGame = () => {
    setSetupComplete(true)
    setStartTime(Date.now())
    const config = DIFFICULTY_CONFIG[difficulty]
    setTotalProblems(config.problems)
  }

  useEffect(() => {
    if (setupComplete) generateProblem()
  }, [setupComplete, difficulty])

  useEffect(() => {
    if (setupComplete && inputRef.current) {
      inputRef.current.focus()
    }
  }, [currentProblem, setupComplete])

  const generateProblem = () => {
    const config = DIFFICULTY_CONFIG[difficulty]
    const num1 = Math.floor(Math.random() * config.range) + 1
    const num2 = Math.floor(Math.random() * config.range) + 1
    const operation = config.operations[Math.floor(Math.random() * config.operations.length)]

    let answer: number
    let question: string

    switch (operation) {
      case "+":
        answer = num1 + num2
        question = `${num1} + ${num2}`
        break
      case "-":
        answer = num1 - num2
        question = `${num1} - ${num2}`
        break
      case "×":
        answer = num1 * num2
        question = `${num1} × ${num2}`
        break
      default:
        answer = 0
        question = ""
    }

    setCurrentProblem({ question, answer })
    setUserAnswer("")
    setFeedback(null)
  }

  const handleSubmit = () => {
    if (!currentProblem || userAnswer === "") return

    const isCorrect = parseInt(userAnswer) === currentProblem.answer
    setFeedback(isCorrect ? "correct" : "incorrect")

    if (isCorrect) setScore(score + 1)
    setAttempts(attempts + 1)

    if (attempts + 1 >= totalProblems) {
      setTimeout(() => handleComplete(), 1000)
    } else {
      setTimeout(() => generateProblem(), 1000)
    }
  }

  const handleComplete = () => {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000)
    const percentage = Math.round((score / totalProblems) * 100)
    const analysis = `🎉 Math Challenge Complete!\n\n📊 Performance Analysis:\n• Time: ${Math.floor(timeTaken/60)}m ${timeTaken%60}s\n• Score: ${score}/${totalProblems} (${percentage}%)\n• Difficulty: ${difficulty}\n• Average time per problem: ${Math.round(timeTaken/totalProblems)}s\n\n🧠 Cognitive Skills Demonstrated:\n• Mathematical computation\n• Working memory utilization\n• Processing speed\n• Mental arithmetic fluency\n\n⭐ ${percentage >= 90 ? 'Excellent mathematical skills!' : percentage >= 70 ? 'Good mathematical performance!' : 'Keep practicing to improve speed and accuracy!'}`
    alert(analysis)
    navigate("/game-analysis", { state: { game: 'Math Challenge', time: timeTaken, score, totalProblems, difficulty, analysis } })
  }

  if (!setupComplete) {
    return (
      <div className="container">
        <div className="card text-center">
          <h1 className="mb-4">🔢 Math Challenge</h1>
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
    <GameLayout title="Math Challenge" startTime={startTime}>
      <div className="text-center">
        <div className="math-progress">
          <span>Problem {attempts + 1} of {totalProblems}</span>
          <span>Score: {score}/{attempts}</span>
        </div>

        {currentProblem && (
          <div className="math-game">
            <div className="math-question">
              {currentProblem.question} = ?
            </div>

            <input
              ref={inputRef}
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Your answer"
              className="math-input"
              disabled={feedback !== null}
              autoFocus
            />

            <button
              onClick={handleSubmit}
              disabled={!userAnswer || feedback !== null}
              className="btn math-submit-btn"
            >
              Submit Answer
            </button>

            {feedback && (
              <div className={`math-feedback ${feedback === "correct" ? 'correct' : 'incorrect'}`}>
                {feedback === "correct" ? "✓ Correct!" : "✗ Incorrect"}
                {feedback === "incorrect" && ` The answer was ${currentProblem.answer}`}
              </div>
            )}
          </div>
        )}
      </div>
    </GameLayout>
  )
}