const letterGroups = {
  'alpha-delta': [
    { id: 'alpha', letter: 'Α α', audio: '01 alpha .mp3' },
    { id: 'beta', letter: 'Β β', audio: '02 beta .mp3' },
    { id: 'gamma', letter: 'Γ γ', audio: '03 gamma.mp3' },
    { id: 'delta', letter: 'Δ δ', audio: '04 delta.mp3' },
  ],
  'epsilon-theta': [
    { id: 'epsilon', letter: 'Ε ε', audio: '05 epsilon.mp3' },
    { id: 'zeta', letter: 'Ζ ζ', audio: '06 zeta .mp3' },
    { id: 'eta', letter: 'Η η', audio: '07 eta.mp3' },
    { id: 'theta', letter: 'Θ θ', audio: '08 theta.mp3' },
  ],
  'iota-mu': [
    { id: 'iota', letter: 'Ι ι', audio: '09 iota.mp3' },
    { id: 'kappa', letter: 'Κ κ', audio: '10 cappa.mp3' },
    { id: 'lambda', letter: 'Λ λ', audio: '11 lambda.mp3' },
    { id: 'mu', letter: 'Μ μ', audio: '12 mu.mp3' },
  ],
  'nu-pi': [
    { id: 'nu', letter: 'Ν ν', audio: '13 nu.mp3' },
    { id: 'xi', letter: 'Ξ ξ', audio: '14 xi.mp3' },
    { id: 'omicron', letter: 'Ο ο', audio: '15 mikron.mp3' },
    { id: 'pi', letter: 'Π π', audio: '16 pi.mp3' },
  ],
  'rho-upsilon': [
    { id: 'rho', letter: 'Ρ ρ', audio: '17 ro.mp3' },
    { id: 'sigma', letter: 'Σ σ, ς', audio: '18 sigma.mp3' },
    { id: 'tau', letter: 'Τ τ', audio: '19 tau.mp3' },
    { id: 'upsilon', letter: 'Υ υ', audio: '20 upsilon.mp3' },
  ],
  'phi-omega': [
    { id: 'phi', letter: 'Φ φ', audio: '21 phi.mp3' },
    { id: 'chi', letter: 'Χ χ', audio: '22 chi.mp3' },
    { id: 'psi', letter: 'Ψ ψ', audio: '23 psi.mp3' },
    { id: 'omega', letter: 'Ω ω', audio: '24 omega.mp3' },
  ],
};

const shuffle = (items) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const params = new URLSearchParams(window.location.search);
const chosenGroups = (params.get('groups') || 'alpha-delta').split(',').filter((group) => letterGroups[group]);
const roundLetters = chosenGroups.flatMap((group) => letterGroups[group]);
const audio = document.querySelector('#letter-audio');
const playButton = document.querySelector('#play-sound');
const answers = document.querySelector('#audio-answers');
const feedback = document.querySelector('#audio-feedback');
const questionNumber = document.querySelector('#question-number');
const questionTotal = document.querySelector('#question-total');
const completePanel = document.querySelector('#audio-complete');
let questions = [];
let currentIndex = 0;
let readyForAnswer = false;
let advancing = false;

function renderAnswers() {
  answers.replaceChildren(...shuffle(roundLetters).map((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'audio-answer';
    button.dataset.answer = item.id;
    button.textContent = item.letter;
    button.addEventListener('click', () => checkAnswer(button));
    return button;
  }));
}

function loadQuestion() {
  const current = questions[currentIndex];
  audio.src = encodeURI(`GreekLetterSounds2/${current.audio}`);
  questionNumber.textContent = String(currentIndex + 1);
  questionTotal.textContent = `of ${questions.length}`;
  readyForAnswer = false;
  advancing = false;
  feedback.textContent = 'Play the sound to begin.';
  feedback.className = 'game-message';
  document.querySelectorAll('.audio-answer').forEach((button) => button.classList.remove('correct', 'incorrect'));
}

async function playCurrentSound() {
  try {
    audio.currentTime = 0;
    await audio.play();
    readyForAnswer = true;
    playButton.classList.add('playing');
    feedback.textContent = 'Now choose the matching Greek letter.';
  } catch {
    feedback.textContent = 'The sound could not play. Please select Play sound again.';
    feedback.className = 'game-message error';
  }
}

function checkAnswer(button) {
  if (!readyForAnswer || advancing) {
    if (!readyForAnswer) playCurrentSound();
    return;
  }
  const current = questions[currentIndex];
  if (button.dataset.answer !== current.id) {
    button.classList.add('incorrect');
    feedback.textContent = 'Not quite—listen and try again.';
    feedback.className = 'game-message error';
    setTimeout(() => button.classList.remove('incorrect'), 650);
    return;
  }

  advancing = true;
  button.classList.add('correct');
  feedback.textContent = 'That is the letter you heard.';
  feedback.className = 'game-message success';
  setTimeout(() => {
    currentIndex += 1;
    if (currentIndex === questions.length) {
      completePanel.hidden = false;
      document.querySelector('.answer-section').hidden = true;
      document.querySelector('.sound-player').hidden = true;
      feedback.textContent = '';
      return;
    }
    loadQuestion();
  }, 750);
}

function startQuiz() {
  questions = shuffle(roundLetters);
  currentIndex = 0;
  completePanel.hidden = true;
  document.querySelector('.answer-section').hidden = false;
  document.querySelector('.sound-player').hidden = false;
  renderAnswers();
  loadQuestion();
}

playButton.addEventListener('click', playCurrentSound);
audio.addEventListener('ended', () => playButton.classList.remove('playing'));
document.querySelector('#listen-again').addEventListener('click', startQuiz);
startQuiz();
