const bestLabel = document.querySelector('#vocabulary-best');
const class5BestLabel = document.querySelector('#class5-vocabulary-best');

if (bestLabel) {
  try {
    const savedBest = Number(window.localStorage.getItem('class4VocabularyBest'));
    if (savedBest > 0) {
      bestLabel.textContent = `Best: all 10 in ${savedBest} seconds`;
    }
  } catch {
    bestLabel.textContent = 'Ten pairs to match';
  }
}

if (class5BestLabel) {
  try {
    const savedBest = Number(window.localStorage.getItem('class5VocabularyBest'));
    if (savedBest > 0) {
      class5BestLabel.textContent = `Best: all 10 in ${savedBest} seconds`;
    }
  } catch {
    class5BestLabel.textContent = 'Ten pairs to match';
  }
}
