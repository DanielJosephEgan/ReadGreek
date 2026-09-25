const vocabulary = [
  { id: 'theos', greek: 'θεός', english: 'God' },
  { id: 'kosmos', greek: 'κόσμος', english: 'world' },
  { id: 'huios', greek: 'υἱός', english: 'son' },
  { id: 'adelphos', greek: 'ἀδελφός', english: 'brother' },
  { id: 'iesous', greek: 'Ἰησοῦς', english: 'Jesus' },
  { id: 'christos', greek: 'Χριστός', english: 'Christ' },
  { id: 'thanatos', greek: 'θάνατος', english: 'death' },
  { id: 'kai', greek: 'καί', english: 'and; also' },
  { id: 'hoti', greek: 'ὅτι', english: 'that; because' },
  { id: 'ean', greek: 'ἐάν', english: 'if; when' },
];

const shuffle = (items) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const greekOptions = document.querySelector('#greek-options');
const englishOptions = document.querySelector('#english-options');
const count = document.querySelector('#matched-count');
const message = document.querySelector('#game-message');
const completePanel = document.querySelector('#complete-panel');
const elapsedLabel = document.querySelector('#elapsed-time');
const averageLabel = document.querySelector('#average-time');
const speedStatus = document.querySelector('#speed-status');
const speedNeedle = document.querySelector('#speed-needle');
const completionTime = document.querySelector('#completion-time');
let selectedGreek = null;
let selectedEnglish = null;
let matched = 0;
let checking = false;
let startedAt = 0;
let elapsed = 0;
let timer = null;

function makeOption(item, side) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `pair-card ${side === 'greek' ? 'greek-pair' : 'english-pair'}`;
  button.dataset.match = item.id;
  button.textContent = side === 'greek' ? item.greek : item.english;
  button.setAttribute('aria-label', side === 'greek' ? `Greek word ${item.greek}` : `English meaning ${item.english}`);
  button.addEventListener('click', () => chooseOption(button, side));
  return button;
}

function startTimer() {
  if (timer) return;
  startedAt = Date.now() - elapsed * 1000;
  timer = window.setInterval(updateTimer, 250);
}

function updateTimer() {
  elapsed = Math.floor((Date.now() - startedAt) / 1000);
  elapsedLabel.textContent = String(elapsed);
  updatePace();
}

function updatePace() {
  if (matched === 0) {
    averageLabel.textContent = '—';
    speedStatus.textContent = timer ? 'Keep matching' : 'Start matching';
    speedNeedle.style.setProperty('--speed-angle', '-52deg');
    return;
  }
  const average = Math.max(0.1, elapsed / matched);
  averageLabel.textContent = average.toFixed(1);
  speedStatus.textContent = average <= 4 ? 'Fast pace' : average <= 8 ? 'Steady pace' : 'Careful pace';
  const clamped = Math.min(14, Math.max(2, average));
  const angle = 52 - ((clamped - 2) / 12) * 104;
  speedNeedle.style.setProperty('--speed-angle', `${angle}deg`);
}

function stopTimer() {
  if (timer) window.clearInterval(timer);
  timer = null;
  updateTimer();
}

function renderGame() {
  if (timer) window.clearInterval(timer);
  greekOptions.replaceChildren(...shuffle(vocabulary).map((item) => makeOption(item, 'greek')));
  englishOptions.replaceChildren(...shuffle(vocabulary).map((item) => makeOption(item, 'english')));
  selectedGreek = null;
  selectedEnglish = null;
  matched = 0;
  checking = false;
  startedAt = 0;
  elapsed = 0;
  timer = null;
  count.textContent = '0';
  elapsedLabel.textContent = '0';
  message.textContent = 'Choose one card from each side.';
  message.className = 'pair-message';
  completePanel.hidden = true;
  updatePace();
}

function chooseOption(button, side) {
  if (checking || button.classList.contains('matched')) return;
  startTimer();
  const current = side === 'greek' ? selectedGreek : selectedEnglish;
  if (current) current.classList.remove('selected');
  button.classList.add('selected');
  if (side === 'greek') selectedGreek = button;
  else selectedEnglish = button;
  if (selectedGreek && selectedEnglish) checkMatch();
}

function checkMatch() {
  checking = true;
  if (selectedGreek.dataset.match === selectedEnglish.dataset.match) {
    selectedGreek.classList.replace('selected', 'matched');
    selectedEnglish.classList.replace('selected', 'matched');
    selectedGreek.disabled = true;
    selectedEnglish.disabled = true;
    matched += 1;
    count.textContent = String(matched);
    message.textContent = 'That is a match.';
    message.className = 'pair-message success';
    selectedGreek = null;
    selectedEnglish = null;
    checking = false;
    updatePace();
    if (matched === vocabulary.length) finishGame();
    return;
  }

  const wrongGreek = selectedGreek;
  const wrongEnglish = selectedEnglish;
  wrongGreek.classList.add('wrong');
  wrongEnglish.classList.add('wrong');
  message.textContent = 'Not quite. Try those again.';
  message.className = 'pair-message error';
  window.setTimeout(() => {
    wrongGreek.classList.remove('selected', 'wrong');
    wrongEnglish.classList.remove('selected', 'wrong');
    selectedGreek = null;
    selectedEnglish = null;
    checking = false;
  }, 650);
}

function finishGame() {
  stopTimer();
  const finalTime = Math.max(1, elapsed);
  completionTime.textContent = `You matched all ten words in ${finalTime} seconds.`;
  completePanel.hidden = false;
  try {
    const savedBest = Number(window.localStorage.getItem('class4VocabularyBest'));
    if (!savedBest || finalTime < savedBest) {
      window.localStorage.setItem('class4VocabularyBest', String(finalTime));
    }
  } catch {
    // The game still works if the browser does not allow saved progress.
  }
}

document.querySelector('#play-again').addEventListener('click', renderGame);
renderGame();
