import Main from './Main';
import Error from './Error';
import Timer from './Timer';
import Header from './Header';
import Loader from './Loader';
import Footer from './Footer';
import Progress from './Progress';
import Question from './Question';
import NextButton from './NextButton';
import StartScreen from './StartScreen';
import FinishScreen from './FinishScreen';
import { useEffect, useReducer } from 'react';

const SECS_PER_QUESTION = 30;

const initialState = {
  questions: [],
  status: 'loading',
  index: 0,
  answer: null,
  points: 0,
  highscore: 0,
  timeRemaining: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'fetchedData':
      return { ...state, questions: action.payload, status: 'ready' };
    case 'fetchFailed':
      return { ...state, status: 'error' };
    case 'start':
      return {
        ...state,
        status: 'active',
        timeRemaining: state.questions.length * SECS_PER_QUESTION,
      };
    case 'newAnswer':
      const question = state.questions.at(state.index);
      return {
        ...state,
        answer: action.payload,
        points:
          action.payload === question.correctOption
            ? state.points + question.points
            : state.points,
      };
    case 'nextQuestion':
      return { ...state, answer: null, index: state.index + 1 };
    case 'finish':
      return {
        ...state,
        status: 'finished',
        highscore:
          state.points > state.highscore ? state.points : state.highscore,
      };
    case 'restart':
      return { ...initialState, questions: state.questions, status: 'ready' };
    case 'tick':
      return {
        ...state,
        timeRemaining: state.timeRemaining - 1,
        status:
          state.timeRemaining === 0
            ? (state.status = 'finished')
            : state.status,
      };
    default:
      throw new Error('Invalid Action');
  }
}

export default function App() {
  const [
    { questions, status, index, answer, points, highscore, timeRemaining },
    dispatch,
  ] = useReducer(reducer, initialState);

  const numQuestions = questions.length;
  const totalPoints = questions.reduce(
    (acc, currentValue) => acc + currentValue.points,
    0
  );

  useEffect(function () {
    fetch('http://localhost:8000/questions')
      .then((res) => res.json())
      .then((data) => dispatch({ type: 'fetchedData', payload: data }))
      .catch((err) => dispatch({ type: 'fetchFailed' }));
  }, []);

  return (
    <section className='app'>
      <Header />
      <Main>
        {status === 'loading' && <Loader />}
        {status === 'ready' && (
          <StartScreen numQuestions={numQuestions} dispatch={dispatch} />
        )}
        {status === 'error' && <Error />}
        {status === 'active' && (
          <>
            <Progress
              index={index}
              numQuestions={numQuestions}
              points={points}
              totalPoints={totalPoints}
              answer={answer}
            />
            <Question
              question={questions[index]}
              dispatch={dispatch}
              answer={answer}
            />
            <Footer>
              <Timer timeRemaining={timeRemaining} dispatch={dispatch} />
              <NextButton
                dispatch={dispatch}
                answer={answer}
                index={index}
                numQuestions={numQuestions}
              />
            </Footer>
          </>
        )}
        {status === 'finished' && (
          <FinishScreen
            points={points}
            totalPoints={totalPoints}
            highscore={highscore}
            dispatch={dispatch}
          />
        )}

        {/* {status ===} */}
      </Main>
    </section>
  );
}
