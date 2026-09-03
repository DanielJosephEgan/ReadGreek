const letterGroups = {
  'alpha-delta': {
    range: 'α–δ',
    letters: [
      { name: 'Alpha', letter: 'Α α', audio: '01 alpha .mp3' },
      { name: 'Beta', letter: 'Β β', audio: '02 beta .mp3' },
      { name: 'Gamma', letter: 'Γ γ', audio: '03 gamma.mp3' },
      { name: 'Delta', letter: 'Δ δ', audio: '04 delta.mp3' },
    ],
  },
  'epsilon-theta': {
    range: 'ε–θ',
    letters: [
      { name: 'Epsilon', letter: 'Ε ε', audio: '05 epsilon.mp3' },
      { name: 'Zeta', letter: 'Ζ ζ', audio: '06 zeta .mp3' },
      { name: 'Eta', letter: 'Η η', audio: '07 eta.mp3' },
      { name: 'Theta', letter: 'Θ θ', audio: '08 theta.mp3' },
    ],
  },
  'iota-mu': {
    range: 'ι–μ',
    letters: [
      { name: 'Iota', letter: 'Ι ι', audio: '09 iota.mp3' },
      { name: 'Kappa', letter: 'Κ κ', audio: '10 cappa.mp3' },
      { name: 'Lambda', letter: 'Λ λ', audio: '11 lambda.mp3' },
      { name: 'Mu', letter: 'Μ μ', audio: '12 mu.mp3' },
    ],
  },
  'nu-pi': {
    range: 'ν–π',
    letters: [
      { name: 'Nu', letter: 'Ν ν', audio: '13 nu.mp3' },
      { name: 'Xi', letter: 'Ξ ξ', audio: '14 xi.mp3' },
      { name: 'Omicron', letter: 'Ο ο', audio: '15 mikron.mp3' },
      { name: 'Pi', letter: 'Π π', audio: '16 pi.mp3' },
    ],
  },
  'rho-upsilon': {
    range: 'ρ–υ',
    letters: [
      { name: 'Rho', letter: 'Ρ ρ', audio: '17 ro.mp3' },
      { name: 'Sigma', letter: 'Σ σ, ς', audio: '18 sigma.mp3' },
      { name: 'Tau', letter: 'Τ τ', audio: '19 tau.mp3' },
      { name: 'Upsilon', letter: 'Υ υ', audio: '20 upsilon.mp3' },
    ],
  },
  'phi-omega': {
    range: 'φ–ω',
    letters: [
      { name: 'Phi', letter: 'Φ φ', audio: '21 phi.mp3' },
      { name: 'Chi', letter: 'Χ χ', audio: '22 chi.mp3' },
      { name: 'Psi', letter: 'Ψ ψ', audio: '23 psi.mp3' },
      { name: 'Omega', letter: 'Ω ω', audio: '24 omega.mp3' },
    ],
  },
};

const params = new URLSearchParams(window.location.search);
const chosenGroups = (params.get('groups') || 'alpha-delta').split(',').filter((group) => letterGroups[group]);
const groupsContainer = document.querySelector('#sound-groups');
const audio = document.querySelector('#learning-audio');
const status = document.querySelector('#sound-status');
let activeButton = null;

function makeLetterButton(letter) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'sound-letter';
  button.innerHTML = `<span class="sound-letter-greek">${letter.letter}</span><span class="sound-letter-name">${letter.name}</span><span class="sound-letter-play" aria-hidden="true">▶</span>`;
  button.setAttribute('aria-label', `Play the sound for ${letter.name}`);
  button.addEventListener('click', async () => {
    if (activeButton) activeButton.classList.remove('playing');
    activeButton = button;
    button.classList.add('playing');
    audio.src = encodeURI(`GreekLetterSounds2/${letter.audio}`);
    status.textContent = `Playing ${letter.name}.`;
    status.className = 'game-message success';
    try {
      await audio.play();
    } catch {
      button.classList.remove('playing');
      status.textContent = `The sound for ${letter.name} could not play. Please try again.`;
      status.className = 'game-message error';
    }
  });
  return button;
}

chosenGroups.forEach((groupId) => {
  const group = letterGroups[groupId];
  const section = document.createElement('section');
  section.className = 'sound-group';
  const heading = document.createElement('h2');
  heading.textContent = `Letters ${group.range}`;
  const buttons = document.createElement('div');
  buttons.className = 'sound-letter-grid';
  buttons.replaceChildren(...group.letters.map(makeLetterButton));
  section.append(heading, buttons);
  groupsContainer.append(section);
});

audio.addEventListener('ended', () => {
  if (activeButton) activeButton.classList.remove('playing');
  status.textContent = 'Choose a letter to hear another sound.';
  status.className = 'game-message';
});
