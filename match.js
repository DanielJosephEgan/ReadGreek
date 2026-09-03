const letterGroups = {
  'alpha-delta': [
    { id: 'alpha', greek: 'α', capital: 'Α', sound: 'a' },
    { id: 'beta', greek: 'β', capital: 'Β', sound: 'b' },
    { id: 'gamma', greek: 'γ', capital: 'Γ', sound: 'g' },
    { id: 'delta', greek: 'δ', capital: 'Δ', sound: 'd' },
  ],
  'epsilon-theta': [
    { id: 'epsilon', greek: 'ε', capital: 'Ε', sound: 'e' },
    { id: 'zeta', greek: 'ζ', capital: 'Ζ', sound: 'z' },
    { id: 'eta', greek: 'η', capital: 'Η', sound: 'long ā' },
    { id: 'theta', greek: 'θ', capital: 'Θ', sound: 'th' },
  ],
  'iota-mu': [
    { id: 'iota', greek: 'ι', capital: 'Ι', sound: 'long ē' },
    { id: 'kappa', greek: 'κ', capital: 'Κ', sound: 'k' },
    { id: 'lambda', greek: 'λ', capital: 'Λ', sound: 'l' },
    { id: 'mu', greek: 'μ', capital: 'Μ', sound: 'm' },
  ],
  'nu-pi': [
    { id: 'nu', greek: 'ν', capital: 'Ν', sound: 'n' },
    { id: 'xi', greek: 'ξ', capital: 'Ξ', sound: 'x (ks)' },
    { id: 'omicron', greek: 'ο', capital: 'Ο', sound: 'aw' },
    { id: 'pi', greek: 'π', capital: 'Π', sound: 'p' },
  ],
  'rho-upsilon': [
    { id: 'rho', greek: 'ρ', capital: 'Ρ', sound: 'r' },
    { id: 'sigma', greek: 'σ, ς', capital: 'Σ', sound: 's' },
    { id: 'tau', greek: 'τ', capital: 'Τ', sound: 't' },
    { id: 'upsilon', greek: 'υ', capital: 'Υ', sound: 'ew' },
  ],
  'phi-omega': [
    { id: 'phi', greek: 'φ', capital: 'Φ', sound: 'f (ph)' },
    { id: 'chi', greek: 'χ', capital: 'Χ', sound: 'k (hard ch)' },
    { id: 'psi', greek: 'ψ', capital: 'Ψ', sound: 'ps' },
    { id: 'omega', greek: 'ω', capital: 'Ω', sound: 'long ō' },
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
const capitalMode = params.get('case') === 'capital';
const formsMode = params.get('case') === 'forms';
const chosenGroups = (params.get('groups') || 'alpha-delta').split(',').filter((group) => letterGroups[group]);
const roundLetters = chosenGroups.flatMap((group) => letterGroups[group]);
const greekOptions = document.querySelector('#greek-options');
const soundOptions = document.querySelector('#sound-options');
const count = document.querySelector('#matched-count');
const message = document.querySelector('#game-message');
const completePanel = document.querySelector('#complete-panel');
let selectedGreek = null;
let selectedSound = null;
let matched = 0;
let checking = false;

function makeOption(item, side) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `match-option ${side}${formsMode && side === 'sound' ? ' letter-form' : ''}`;
  button.dataset.match = item.id;
  const greekLetter = capitalMode ? item.capital : item.greek;
  const rightChoice = formsMode ? item.greek : item.sound;
  const leftChoice = formsMode ? item.capital : greekLetter;
  button.textContent = side === 'greek' ? leftChoice : rightChoice;
  button.setAttribute('aria-label', side === 'greek' ? `Greek letter ${leftChoice}` : formsMode ? `Minuscule letter ${rightChoice}` : `English sound ${rightChoice}`);
  button.addEventListener('click', () => chooseOption(button, side));
  return button;
}

function renderGame() {
  greekOptions.replaceChildren(...shuffle(roundLetters).map((item) => makeOption(item, 'greek')));
  soundOptions.replaceChildren(...shuffle(roundLetters).map((item) => makeOption(item, 'sound')));
  selectedGreek = null;
  selectedSound = null;
  matched = 0;
  checking = false;
  count.textContent = '0';
  message.textContent = 'Select one item from each side.';
  message.className = 'game-message';
  completePanel.hidden = true;
}

function chooseOption(button, side) {
  if (checking || button.classList.contains('matched')) return;
  const current = side === 'greek' ? selectedGreek : selectedSound;
  if (current) current.classList.remove('selected');
  button.classList.add('selected');
  if (side === 'greek') selectedGreek = button;
  else selectedSound = button;
  if (selectedGreek && selectedSound) checkMatch();
}

function checkMatch() {
  checking = true;
  if (selectedGreek.dataset.match === selectedSound.dataset.match) {
    selectedGreek.classList.replace('selected', 'matched');
    selectedSound.classList.replace('selected', 'matched');
    selectedGreek.disabled = true;
    selectedSound.disabled = true;
    matched += 1;
    count.textContent = String(matched);
    message.textContent = 'That is a match.';
    message.className = 'game-message success';
    selectedGreek = null;
    selectedSound = null;
    checking = false;
    if (matched === roundLetters.length) completePanel.hidden = false;
    return;
  }

  const wrongGreek = selectedGreek;
  const wrongSound = selectedSound;
  wrongGreek.classList.add('incorrect');
  wrongSound.classList.add('incorrect');
  message.textContent = 'Not quite—try those again.';
  message.className = 'game-message error';
  setTimeout(() => {
    wrongGreek.classList.remove('selected', 'incorrect');
    wrongSound.classList.remove('selected', 'incorrect');
    selectedGreek = null;
    selectedSound = null;
    checking = false;
  }, 650);
}

document.querySelector('#play-again').addEventListener('click', renderGame);
if (capitalMode) {
  document.title = 'Capital Matching Game · φωνή';
  document.querySelector('#game-eyebrow').textContent = 'Capital matching game';
  document.querySelector('#choose-link').href = 'capital.html';
}
if (formsMode) {
  document.title = 'Letter Form Matching Game · φωνή';
  document.querySelector('#game-eyebrow').textContent = 'Capital + minuscule';
  document.querySelector('#match-title').textContent = 'Match the letter forms.';
  document.querySelector('.match-directions').textContent = 'Choose a capital letter, then choose its minuscule form. The choices are shuffled.';
  document.querySelector('#greek-heading').textContent = 'Capital letter';
  document.querySelector('#sound-heading').textContent = 'Minuscule letter';
  document.querySelector('#choose-link').href = 'forms.html';
}
renderGame();
