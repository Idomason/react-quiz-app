export default function StartScreen({ numQuestions, dispatch }) {
  return (
    <section className='start'>
      <h2>Welcome to The React Quiz!</h2>
      <h3>{numQuestions} questions to test your react mastery</h3>
      <button
        className='btn btn-ui'
        onClick={() => dispatch({ type: 'start' })}
      >
        Let's Start
      </button>
    </section>
  );
}
