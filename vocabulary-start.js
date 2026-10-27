const bestLabel = document.querySelector('#vocabulary-best');
const class5BestLabel = document.querySelector('#class5-vocabulary-best');
const class6BestLabel = document.querySelector('#class6-vocabulary-best');
const class7BestLabel = document.querySelector('#class7-vocabulary-best');
const class8BestLabel = document.querySelector('#class8-vocabulary-best');

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

if (class6BestLabel) {
  try {
    const savedBest = Number(window.localStorage.getItem('lesson6VocabularyBest'));
    if (savedBest > 0) {
      class6BestLabel.textContent = `Best: all 11 in ${savedBest} seconds`;
    }
  } catch {
    class6BestLabel.textContent = 'Eleven pairs to match';
  }
}

if (class7BestLabel) {
  try {
    const savedBest = Number(window.localStorage.getItem('class7VocabularyBest'));
    if (savedBest > 0) {
      class7BestLabel.textContent = `Best: all 13 in ${savedBest} seconds`;
    }
  } catch {
    class7BestLabel.textContent = 'Thirteen pairs to match';
  }
}

if (class8BestLabel) {
  try {
    const savedBest = Number(window.localStorage.getItem('class8VocabularyBest'));
    if (savedBest > 0) {
      class8BestLabel.textContent = `Best: all 11 in ${savedBest} seconds`;
    }
  } catch {
    class8BestLabel.textContent = 'Eleven pairs to match';
  }
}
