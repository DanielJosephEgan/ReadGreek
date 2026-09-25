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
let selectedGreek = null;
let selectedEnglish = null;
let matched = 0;
let checking = false;

function makeOption(item, side) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `match-option ${side === 'greek' ? 'vocabulary-greek' : 'vocabulary-english'}`;
  button.dataset.match = item.id;
  button.textContent = side === 'greek' ? item.greek : item.english;
  button.setAttribute('aria-label', side === 'greek' ? `Greek word ${item.greek}` : `English meaning ${item.english}`);
  button.addEventListener('click', () => chooseOption(button, side));
  return button;
}

function renderGame() {
  greekOptions.replaceChildren(...shuffle(vocabulary).map((item) => makeOption(item, 'greek')));
  englishOptions.replaceChildren(...shuffle(vocabulary).map((item) => makeOption(item, 'english')));
  selectedGreek = null;
  selectedEnglish = null;
  matched = 0;
  checking = false;
  count.textContent = '0';
  message.textContent = 'Select one item from each side.';
  message.className = 'game-message';
  completePanel.hidden = true;
}

function chooseOption(button, side) {
  if (checking || button.classList.contains('matched')) return;
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
    message.className = 'game-message success';
    selectedGreek = null;
    selectedEnglish = null;
    checking = false;
    if (matched === vocabulary.length) completePanel.hidden = false;
    return;
  }

  const wrongGreek = selectedGreek;
  const wrongEnglish = selectedEnglish;
  wrongGreek.classList.add('incorrect');
  wrongEnglish.classList.add('incorrect');
  message.textContent = 'Not quite. Try those again.';
  message.className = 'game-message error';
  setTimeout(() => {
    wrongGreek.classList.remove('selected', 'incorrect');
    wrongEnglish.classList.remove('selected', 'incorrect');
    selectedGreek = null;
    selectedEnglish = null;
    checking = false;
  }, 650);
}

document.querySelector('#play-again').addEventListener('click', renderGame);
renderGame();
