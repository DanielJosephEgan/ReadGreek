const vocabulary = [
  { id: 'anthropos', greek: 'ἄνθρωπος, -ου, ὁ', english: 'man (anthropology)', audio: 'VocabularySounds/Class8/anthropos.wav' },
  { id: 'mathetes', greek: 'μαθητής, -οῦ, ὁ', english: 'disciple', audio: 'VocabularySounds/Class8/mathetes.wav' },
  { id: 'oinos', greek: 'οἶνος, -ου, ὁ', english: 'wine', audio: 'VocabularySounds/Class8/oinos.wav' },
  { id: 'zoe', greek: 'ζωή, -ῆς, ἡ', english: 'life (zoo, Zoe)', audio: 'VocabularySounds/Class8/zoe.wav' },
  { id: 'hemera', greek: 'ἡμέρα, -ας, ἡ', english: 'day', audio: 'VocabularySounds/Class8/hemera.wav' },
  { id: 'martyria', greek: 'μαρτυρία, -ας, ἡ', english: 'testimony; witness (martyr)', audio: 'VocabularySounds/Class8/martyria.wav' },
  { id: 'meter', greek: 'μήτηρ, μητρός, ἡ', english: 'mother', audio: 'VocabularySounds/Class8/meter.wav' },
  { id: 'hydor', greek: 'ὕδωρ, ὕδατος, τό', english: 'water (hydro, hydration)', audio: 'VocabularySounds/Class8/hydor.wav' },
  { id: 'philippos', greek: 'Φίλιππος', english: 'Philip', audio: 'VocabularySounds/Class8/philippos.wav' },
  { id: 'ioannes', greek: 'Ἰωάννης', english: 'John', audio: 'VocabularySounds/Class8/ioannes.wav' },
  { id: 'nathanael', greek: 'Ναθαναήλ', english: 'Nathanael', audio: 'VocabularySounds/Class8/nathanael.wav' },
];

const shuffle = (items) => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[other]] = [copy[other], copy[index]];
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
let activeAudio = null;
let activeAudioButton = null;

function resetAudioPlayback() {
  if (activeAudioButton) {
    activeAudioButton.classList.remove('playing-audio');
    const marker = activeAudioButton.querySelector('.pair-audio-mark');
    if (marker) marker.textContent = '▶';
  }
  activeAudio = null;
  activeAudioButton = null;
}

function playVocabularyAudio(item, button) {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
  }
  resetAudioPlayback();

  const audio = new Audio(item.audio);
  activeAudio = audio;
  activeAudioButton = button;
  button.classList.add('playing-audio');
  button.querySelector('.pair-audio-mark').textContent = '■';
  audio.addEventListener('ended', resetAudioPlayback, { once: true });
  audio.addEventListener('error', () => {
    resetAudioPlayback();
    message.textContent = 'That recording could not play. Please try again.';
    message.className = 'pair-message error';
  }, { once: true });
  audio.play().catch(() => {
    resetAudioPlayback();
    message.textContent = 'Select the Greek entry again to hear its recording.';
    message.className = 'pair-message error';
  });
}

function makeOption(item, side) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `pair-card ${side === 'greek' ? 'greek-pair' : 'english-pair'}`;
  button.dataset.match = item.id;
  if (side === 'greek') {
    const entry = document.createElement('span');
    entry.textContent = item.greek;
    const audioMarker = document.createElement('span');
    audioMarker.className = 'pair-audio-mark';
    audioMarker.setAttribute('aria-hidden', 'true');
    audioMarker.textContent = '▶';
    button.append(entry, audioMarker);
  } else {
    button.textContent = item.english;
  }
  button.setAttribute('aria-label', side === 'greek' ? `Greek entry ${item.greek}` : `English meaning ${item.english}`);
  button.addEventListener('click', () => {
    if (side === 'greek' && !button.classList.contains('matched')) playVocabularyAudio(item, button);
    chooseOption(button, side);
  });
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
  speedNeedle.style.setProperty('--speed-angle', `${52 - ((clamped - 2) / 12) * 104}deg`);
}

function renderGame() {
  if (activeAudio) activeAudio.pause();
  resetAudioPlayback();
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
    const matchedGreek = selectedGreek;
    const matchedEnglish = selectedEnglish;
    matchedGreek.classList.replace('selected', 'matched');
    matchedEnglish.classList.replace('selected', 'matched');
    matchedGreek.disabled = true;
    matchedEnglish.disabled = true;
    matched += 1;
    count.textContent = String(matched);
    message.textContent = 'That is a match.';
    message.className = 'pair-message success';
    selectedGreek = null;
    selectedEnglish = null;
    checking = false;
    updatePace();
    window.setTimeout(() => {
      matchedGreek.remove();
      matchedEnglish.remove();
    }, 260);
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
  if (timer) window.clearInterval(timer);
  timer = null;
  updateTimer();
  const finalTime = Math.max(1, elapsed);
  completionTime.textContent = `You matched all eleven Class 8 entries in ${finalTime} seconds.`;
  completePanel.hidden = false;
  try {
    const savedBest = Number(window.localStorage.getItem('class8VocabularyBest'));
    if (!savedBest || finalTime < savedBest) window.localStorage.setItem('class8VocabularyBest', String(finalTime));
  } catch {
    // The game remains fully usable when saved progress is unavailable.
  }
}

document.querySelector('#play-again').addEventListener('click', renderGame);
renderGame();
