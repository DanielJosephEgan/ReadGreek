const vocabulary = [
  { id: 'kyrios', greek: 'κύριος, -ου, ὁ', english: 'Lord (Kyrie)', audio: 'VocabularySounds/Class7/kyrios.wav' },
  { id: 'ouranos', greek: 'οὐρανός, -ου, ὁ', english: 'heaven; sky (Uranus)', audio: 'VocabularySounds/Class7/ouranos.wav' },
  { id: 'nomos', greek: 'νόμος, -ου, ὁ', english: 'law (normal)', audio: 'VocabularySounds/Class7/nomos.wav' },
  { id: 'angelos', greek: 'ἄγγελος, -ου, ὁ', english: 'angel (messenger)', audio: 'VocabularySounds/Class7/angelos.wav' },
  { id: 'ochlos', greek: 'ὄχλος, -ου, ὁ', english: 'crowd', audio: 'VocabularySounds/Class7/ochlos.wav' },
  { id: 'doulos', greek: 'δοῦλος, -ου, ὁ', english: 'slave (doula)', audio: 'VocabularySounds/Class7/doulos.wav' },
  { id: 'oikos', greek: 'οἶκος, -ου, ὁ', english: 'house (OIKOS; Ikea)', audio: 'VocabularySounds/Class7/oikos.wav' },
  { id: 'eimi', greek: 'εἰμί', english: 'I am', audio: 'VocabularySounds/Class7/eimi.wav' },
  { id: 'ei', greek: 'εἶ', english: 'you are', audio: 'VocabularySounds/Class7/ei.wav' },
  { id: 'esti', greek: 'ἐστί(ν)', english: 'he, she, it is', audio: 'VocabularySounds/Class7/esti.wav' },
  { id: 'esmen', greek: 'ἐσμέν', english: 'we are', audio: 'VocabularySounds/Class7/esmen.wav' },
  { id: 'este', greek: 'ἐστέ', english: "y'all are", audio: 'VocabularySounds/Class7/este.wav' },
  { id: 'eisi', greek: 'εἰσί(ν)', english: 'they are', audio: 'VocabularySounds/Class7/eisi.wav' },
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
    button.setAttribute('aria-label', `Hear and select the Greek entry ${item.greek}`);
  } else {
    button.textContent = item.english;
    button.setAttribute('aria-label', `English meaning ${item.english}`);
  }
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
  const angle = 52 - ((clamped - 2) / 12) * 104;
  speedNeedle.style.setProperty('--speed-angle', `${angle}deg`);
}

function stopTimer() {
  if (timer) window.clearInterval(timer);
  timer = null;
  updateTimer();
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
  stopTimer();
  const finalTime = Math.max(1, elapsed);
  completionTime.textContent = `You matched all thirteen Class 7 entries in ${finalTime} seconds.`;
  completePanel.hidden = false;
  try {
    const savedBest = Number(window.localStorage.getItem('class7VocabularyBest'));
    if (!savedBest || finalTime < savedBest) {
      window.localStorage.setItem('class7VocabularyBest', String(finalTime));
    }
  } catch {
    // The game still works if the browser does not allow saved progress.
  }
}

document.querySelector('#play-again').addEventListener('click', renderGame);
renderGame();
