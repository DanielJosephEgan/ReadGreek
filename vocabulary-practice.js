const lessons = {
  4: {
    title: 'Class 4 Vocabulary Practice',
    entries: [
      { greek: 'θεός', english: 'God', audio: 'VocabularySounds/Class4/theos.wav' },
      { greek: 'κόσμος', english: 'world', audio: 'VocabularySounds/Class4/kosmos.wav' },
      { greek: 'υἱός', english: 'son', audio: 'VocabularySounds/Class4/huios.wav' },
      { greek: 'ἀδελφός', english: 'brother', audio: 'VocabularySounds/Class4/adelphos.wav' },
      { greek: 'Ἰησοῦς', english: 'Jesus', audio: 'VocabularySounds/Class4/iesous.wav' },
      { greek: 'Χριστός', english: 'Christ', audio: 'VocabularySounds/Class4/christos.wav' },
      { greek: 'θάνατος', english: 'death', audio: 'VocabularySounds/Class4/thanatos.wav' },
      { greek: 'καί', english: 'and; also', audio: 'VocabularySounds/Class4/kai.wav' },
      { greek: 'ὅτι', english: 'that; because', audio: 'VocabularySounds/Class4/hoti.wav' },
      { greek: 'ἐάν', english: 'if; when', audio: 'VocabularySounds/Class4/ean.wav' },
    ],
  },
  5: {
    title: 'Class 5 Vocabulary Practice',
    entries: [
      { greek: 'λόγος', english: 'word', audio: 'VocabularySounds/Class5/logos.wav' },
      { greek: 'ἀντίχριστος', english: 'antichrist', audio: 'VocabularySounds/Class5/antichristos.wav' },
      { greek: 'θάνατος', english: 'death', audio: 'VocabularySounds/Class5/thanatos.wav' },
      { greek: 'ἵνα', english: 'in order that; that', audio: 'VocabularySounds/Class5/hina.wav' },
      { greek: 'ἀλλά', english: 'but; yet', audio: 'VocabularySounds/Class5/alla.wav' },
      { greek: 'ἐκ, ἐξ', english: 'Genitive: from; of', audio: 'VocabularySounds/Class5/ek-ex.wav' },
      { greek: 'ἐν', english: 'Dative: in (on, among)', audio: 'VocabularySounds/Class5/en.wav' },
      { greek: 'μή', english: 'not', audio: 'VocabularySounds/Class5/me.wav' },
      { greek: 'οὐ, οὐκ, οὐχ', english: 'not', audio: 'VocabularySounds/Class5/ou.wav' },
      { greek: 'ἐστιν', english: 'he, she, it is', audio: 'VocabularySounds/Class5/estin.wav' },
    ],
  },
  6: {
    title: 'Lesson 6 Vocabulary Practice',
    entries: [
      { greek: 'ἀγαπητός, -ή, -όν', english: 'beloved', audio: 'VocabularySounds/Lesson6/agapetos.wav' },
      { greek: 'ὀφθαλμός, -οῦ, ὁ', english: 'eye', audio: 'VocabularySounds/Lesson6/ophthalmos.wav' },
      { greek: 'τέκνον, -ου, τό', english: 'child', audio: 'VocabularySounds/Lesson6/teknon.wav' },
      { greek: 'ἔργον, -ου, τό', english: 'work', audio: 'VocabularySounds/Lesson6/ergon.wav' },
      { greek: 'γάρ', english: 'for (postpositive)', audio: 'VocabularySounds/Lesson6/gar.wav' },
      { greek: 'εἰς', english: 'Accusative: into', audio: 'VocabularySounds/Lesson6/eis.wav' },
      { greek: 'ἀπό, ἀπʼ, ἀφʼ', english: 'Genitive: from', audio: 'VocabularySounds/Lesson6/apo.wav' },
      { greek: 'πρός', english: 'Accusative: to, toward, with', audio: 'VocabularySounds/Lesson6/pros.wav' },
      { greek: 'πατήρ, πατρός, ὁ', english: 'father', audio: 'VocabularySounds/Lesson6/pater.wav' },
      { greek: 'πνεῦμα, πνεύματος, τό', english: 'spirit', audio: 'VocabularySounds/Lesson6/pneuma.wav' },
      { greek: 'ὄνομα, ὀνόματος, τό', english: 'name', audio: 'VocabularySounds/Lesson6/onoma.wav' },
    ],
  },
};

const requestedLesson = new URLSearchParams(window.location.search).get('lesson');
const lesson = lessons[requestedLesson] || lessons[4];
const title = document.querySelector('#practice-title');
const status = document.querySelector('#practice-status');
const rows = document.querySelector('#practice-rows');
let activeAudio = null;
let activeButton = null;

document.title = `${lesson.title} · φωνή`;
title.textContent = lesson.title;

function resetPlayback() {
  if (activeButton) {
    activeButton.classList.remove('playing');
    activeButton.querySelector('.practice-play').textContent = '▶';
  }
  activeAudio = null;
  activeButton = null;
}

function playEntry(entry, button) {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
  }
  resetPlayback();

  const audio = new Audio(entry.audio);
  activeAudio = audio;
  activeButton = button;
  button.classList.add('playing');
  button.querySelector('.practice-play').textContent = '■';
  status.textContent = `Playing ${entry.greek}.`;

  audio.addEventListener('ended', () => {
    resetPlayback();
    status.textContent = `Finished ${entry.greek}. Choose another entry when ready.`;
  }, { once: true });
  audio.addEventListener('error', () => {
    resetPlayback();
    status.textContent = 'That recording could not play. Please try again.';
  }, { once: true });
  audio.play().catch(() => {
    resetPlayback();
    status.textContent = 'Select the Greek entry again to hear its recording.';
  });
}

lesson.entries.forEach((entry) => {
  const row = document.createElement('article');
  row.className = 'practice-row';

  const greekButton = document.createElement('button');
  greekButton.type = 'button';
  greekButton.className = 'practice-greek';
  greekButton.setAttribute('aria-label', `Play the recording for ${entry.greek}`);

  const playMarker = document.createElement('span');
  playMarker.className = 'practice-play';
  playMarker.setAttribute('aria-hidden', 'true');
  playMarker.textContent = '▶';

  const greekText = document.createElement('span');
  greekText.textContent = entry.greek;
  greekButton.append(playMarker, greekText);
  greekButton.addEventListener('click', () => playEntry(entry, greekButton));

  const englishAnswer = document.createElement('div');
  englishAnswer.className = 'practice-answer';
  englishAnswer.textContent = entry.english;

  row.append(greekButton, englishAnswer);
  rows.append(row);
});
