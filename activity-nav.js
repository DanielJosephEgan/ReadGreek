const currentPage = window.location.pathname.split('/').filter(Boolean).pop() || 'index';
const query = new URLSearchParams(window.location.search);

let activeActivity = '';
if (currentPage.startsWith('capital')) activeActivity = 'capital';
else if (currentPage.startsWith('minuscule')) activeActivity = 'minuscule';
else if (currentPage.startsWith('forms')) activeActivity = 'forms';
else if (currentPage.startsWith('audio-quiz') || currentPage === 'audio' || currentPage === 'audio.html') activeActivity = 'audio';
else if (currentPage.startsWith('learn-sounds') || currentPage.startsWith('soundboard')) activeActivity = 'learn';
else if (currentPage.startsWith('vocabulary')) activeActivity = 'vocabulary';
else if (currentPage.startsWith('match')) {
  activeActivity = query.get('case') === 'capital' ? 'capital' : query.get('case') === 'forms' ? 'forms' : 'minuscule';
}

const activities = [
  { id: 'capital', number: '01', href: 'capital.html', sample: 'Α Β Γ', title: 'Capital letters' },
  { id: 'minuscule', number: '02', href: 'minuscule.html', sample: 'α β γ', title: 'Minuscule letters' },
  { id: 'forms', number: '03', href: 'forms.html', sample: 'Α α&nbsp; Β β', title: 'Match letter forms' },
  { id: 'audio', number: '04', href: 'audio.html', sample: '<b>♪</b> Α α', title: 'Listen and match', audio: true },
  { id: 'learn', number: '05', href: 'learn-sounds.html', sample: '<b>▶</b> Β β', title: 'Learn the Sounds', audio: true },
  { id: 'vocabulary', number: '06', href: 'vocabulary.html', sample: 'θεός', title: 'Class 4 Vocabulary' },
];

const nav = document.createElement('nav');
nav.className = 'activity-dock';
nav.setAttribute('aria-label', 'Greek alphabet activities');
nav.innerHTML = `<div class="activity-dock-inner">${activities.map((activity) => `
  <a class="dock-card${activity.id === activeActivity ? ' active' : ''}" href="${activity.href}"${activity.id === activeActivity ? ' aria-current="page"' : ''}>
    <span class="dock-card-number">${activity.number}</span>
    <span class="dock-card-title">${activity.title}</span>
    <span class="dock-card-sample${activity.audio ? ' dock-audio-sample' : ''}" aria-hidden="true">${activity.sample}</span>
  </a>`).join('')}</div>`;
document.body.prepend(nav);
