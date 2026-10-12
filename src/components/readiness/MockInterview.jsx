import { useMemo, useState } from 'react'
import { INTERVIEW_QUESTIONS } from '../../data/jobReadiness.js'
import { gradeInterviewAnswer } from '../../lib/readinessGrader.js'
import { formatClock, useCountdown } from '../../hooks/useCountdown.js'

const SESSION_TYPES = ['theory', 'system-design', 'debugging', 'project', 'behavioral']

export default function MockInterview({ track, sessions, onRecordSession }) {
  const pool = useMemo(() => INTERVIEW_QUESTIONS.filter((question) => question.roles.includes(track.id)), [track.id])
  const [questions, setQuestions] = useState([])
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [grades, setGrades] = useState({})
  const [finished, setFinished] = useState(null)
  const timer = useCountdown(30, track.id)
  const current = questions[index]

  const startSession = () => {
    const offset = sessions.length
    const selected = SESSION_TYPES.map((type, position) => {
      const candidates = pool.filter((question) => question.type === type)
      return candidates[(offset + position) % candidates.length]
    }).filter(Boolean)
    setQuestions(selected)
    setIndex(0)
    setAnswers({})
    setGrades({})
    setFinished(null)
    timer.start()
  }

  const scoreCurrent = () => {
    if (!current) return null
    const grade = gradeInterviewAnswer(current, answers[current.id])
    setGrades((value) => ({ ...value, [current.id]: grade }))
    return grade
  }

  const next = () => {
    scoreCurrent()
    setIndex((value) => Math.min(questions.length - 1, value + 1))
  }

  const finish = () => {
    const allGrades = Object.fromEntries(questions.map((question) => [question.id, gradeInterviewAnswer(question, answers[question.id])]))
    const answered = questions.filter((question) => String(answers[question.id] || '').trim().length >= 80).length
    const average = questions.length ? Math.round(Object.values(allGrades).reduce((sum, grade) => sum + grade.score, 0) / questions.length) : 0
    const session = {
      trackId: track.id,
      score: average,
      answered,
      total: questions.length,
      passed: answered === questions.length && average >= 70,
      questions: questions.map((question) => ({ id: question.id, question: question.question, answer: answers[question.id] || '', grade: allGrades[question.id] })),
      secondsUsed: timer.elapsed,
    }
    setGrades(allGrades)
    setFinished(session)
    timer.stop()
    onRecordSession(session)
  }

  if (!questions.length) {
    return (
      <div className="lab-interview-start">
        <div className="lab-interview-hero">
          <div className="lab-kicker">30-MINUTE MOCK INTERVIEW</div>
          <h2>{track.title}</h2>
          <p>Five timed questions cover theory, system design, debugging, project presentation, and behavioural evidence. Write the answer you would say aloud, then use the rubric feedback to tighten it.</p>
          <button className="lab-btn primary" onClick={startSession}>Start mock interview</button>
          <span>{sessions.filter((session) => session.trackId === track.id).length} previous session(s) for this track</span>
        </div>
        <QuestionBank pool={pool} />
      </div>
    )
  }

  return (
    <div className="lab-interview">
      <div className="lab-interview-status">
        <span>Question {index + 1} of {questions.length}</span>
        <div className={'lab-timer' + (timer.expired ? ' expired' : '')}>{formatClock(timer.remaining)}</div>
        <button className="lab-btn ghost" onClick={startSession}>New session</button>
      </div>

      {!finished && current && (
        <div className="lab-interview-card">
          <div className="lab-kicker">{current.type} · target {current.minutes} minutes</div>
          <h2>{current.question}</h2>
          <textarea
            className="lab-interview-answer"
            value={answers[current.id] || ''}
            onChange={(event) => setAnswers((value) => ({ ...value, [current.id]: event.target.value }))}
            placeholder="Answer as if speaking to the interviewer. State assumptions, reason through choices, use evidence, and finish with a clear conclusion…"
            disabled={timer.expired}
          />
          {grades[current.id] && (
            <div className={'lab-answer-grade ' + (grades[current.id].passed ? 'pass' : 'retry')}>
              <strong>{grades[current.id].score}%</strong>
              <span>{grades[current.id].summary}</span>
              {grades[current.id].missing.length > 0 && <small>Missing ideas: {grades[current.id].missing.join(', ')}</small>}
            </div>
          )}
          <div className="lab-action-row">
            <button className="lab-btn secondary" onClick={scoreCurrent}>Score this answer</button>
            {index < questions.length - 1
              ? <button className="lab-btn primary" onClick={next}>Save and next →</button>
              : <button className="lab-btn primary" onClick={finish}>Finish interview</button>}
            {timer.expired && <button className="lab-btn primary" onClick={finish}>Score expired session</button>}
          </div>
        </div>
      )}

      {finished && (
        <div className={'lab-result lab-session-result ' + (finished.passed ? 'pass' : 'retry')}>
          <div className="lab-result-score">{finished.score}% <span>{finished.passed ? 'MOCK PASSED' : 'PRACTISE AND RETRY'}</span></div>
          <p>{finished.answered}/{finished.total} answers contained enough evidence to review. A passing session requires every answer and a 70% average.</p>
          <div className="lab-session-review">
            {finished.questions.map((item) => (
              <details key={item.id}>
                <summary>{item.grade.score}% · {item.question}</summary>
                <p>{item.grade.summary}</p>
                {item.grade.missing.length > 0 && <p>Missing ideas: {item.grade.missing.join(', ')}</p>}
              </details>
            ))}
          </div>
          <button className="lab-btn primary" onClick={startSession}>Start another mock</button>
        </div>
      )}
    </div>
  )
}

function QuestionBank({ pool }) {
  const presentation = pool.filter((question) => question.type === 'project')
  const behavioral = pool.filter((question) => question.type === 'behavioral')
  return (
    <div className="lab-question-bank">
      <div>
        <h3>Project presentation bank</h3>
        <p>Use: problem → constraints → your decisions → measured result → failure and learning.</p>
        <ol>{presentation.map((question) => <li key={question.id}>{question.question}</li>)}</ol>
      </div>
      <div>
        <h3>Behavioural question bank</h3>
        <p>Use specific evidence: situation → responsibility → action → result → what changed afterward.</p>
        <ol>{behavioral.map((question) => <li key={question.id}>{question.question}</li>)}</ol>
      </div>
    </div>
  )
}

