const bestLabel = document.querySelector('#vocabulary-best');

try {
  const savedBest = Number(window.localStorage.getItem('class4VocabularyBest'));
  if (savedBest > 0) {
    bestLabel.textContent = `Best: all 10 in ${savedBest} seconds`;
  }
} catch {
  bestLabel.textContent = 'Ten pairs to match';
}
