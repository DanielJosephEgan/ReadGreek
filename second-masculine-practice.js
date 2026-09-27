const MASTERY_GOAL = 3;

const endingSets = {
  singular: [
    { id: 'nom-singular', caseName: 'Nominative', group: 'Singular', ending: '-ος' },
    { id: 'gen-singular', caseName: 'Genitive', group: 'Singular', ending: '-ου' },
    { id: 'dat-singular', caseName: 'Dative', group: 'Singular', ending: '-ῳ' },
    { id: 'acc-singular', caseName: 'Accusative', group: 'Singular', ending: '-ον' },
  ],
  plural: [
    { id: 'nom-plural', caseName: 'Nominative', group: 'Plural', ending: '-οι' },
    { id: 'gen-plural', caseName: 'Genitive', group: 'Plural', ending: '-ων' },
    { id: 'dat-plural', caseName: 'Dative', group: 'Plural', ending: '-οις' },
    { id: 'acc-plural', caseName: 'Accusative', group: 'Plural', ending: '-ους' },
  ],
};

const params = new URLSearchParams(window.location.search);
const requestedStep = params.get('step');
const step = ['order', 'type', 'final'].includes(requestedStep) ? requestedStep : 'order';
const requestedNumber = params.get('number');
const number = ['singular', 'plural', 'both'].includes(requestedNumber) ? requestedNumber : 'singular';
const items = number === 'both' ? [...endingSets.singular, ...endingSets.plural] : [...endingSets[number]];

const orderPractice = document.querySelector('#order-practice');
const typePractice = document.querySelector('#type-practice');
const bank = document.querySelector('#ending-bank');
const orderList = document.querySelector('#order-list');
const typeList = document.querySelector('#type-list');
const greekKeyboard = document.querySelector('#greek-keyboard');
const count = document.querySelector('#practice-count');
const kicker = document.querySelector('#practice-kicker');
const title = document.querySelector('#practice-title');
const directions = document.querySelector('#practice-directions');
const message = document.querySelector('#practice-message');
const checkButton = document.querySelector('#check-practice');
const resetButton = document.querySelector('#reset-practice');
const completePanel = document.querySelector('#practice-complete');
const completeMessage = document.querySelector('#complete-message');
const nextPractice = document.querySelector('#next-practice');
const fireworks = document.querySelector('#fireworks');

let placed = [];
let correctRounds = 0;
let checking = false;
let locked = false;
let pendingTimer = null;
let fireworksTimer = null;
let activeInput = null;

const latinAliases = {
  'nom-singular': ['os'],
  'gen-singular': ['ou'],
  'dat-singular': ['w', 'wi'],
  'acc-singular': ['on'],
  'nom-plural': ['oi'],
  'gen-plural': ['wn'],
  'dat-plural': ['ois'],
  'acc-plural': ['ous'],
};

function shuffle(values) {
  const copy = [...values];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[other]] = [copy[other], copy[index]];
  }
  return copy;
}

function groupLabel(value) {
  if (value === 'both') return 'Singular + plural';
  return `${value[0].toUpperCase()}${value.slice(1)}`;
}

function updateCount(value) {
  count.textContent = `${value} / ${items.length}`;
}

function setMessage(text, tone = '') {
  message.textContent = text;
  message.className = `ending-practice-message${tone ? ` ${tone}` : ''}`;
}

function clearRoundResult() {
  completePanel.hidden = true;
  orderList.querySelectorAll('.ending-order-row').forEach((row) => row.classList.remove('correct', 'wrong'));
  typeList.querySelectorAll('.ending-type-row').forEach((row) => row.classList.remove('correct', 'wrong'));
}

function makeDivider(item, previousItem) {
  if (number !== 'both' || previousItem?.group === item.group) return null;
  const divider = document.createElement('h2');
  divider.className = 'ending-group-divider';
  divider.textContent = item.group;
  return divider;
}

function renderOrder(roundMessage = '') {
  checking = false;
  locked = false;
  placed = Array(items.length).fill(null);
  bank.replaceChildren();
  orderList.replaceChildren();
  clearRoundResult();

  shuffle(items).forEach((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ending-bank-button';
    button.dataset.id = item.id;
    button.textContent = item.ending;
    button.setAttribute('aria-label', `Choose ending ${item.ending}`);
    button.addEventListener('click', () => placeEnding(item, button));
    bank.append(button);
  });

  items.forEach((item, index) => {
    const divider = makeDivider(item, items[index - 1]);
    if (divider) orderList.append(divider);

    const row = document.createElement('div');
    row.className = 'ending-order-row';
    row.dataset.index = String(index);
    row.innerHTML = `<span><small>${item.group}</small><strong>${item.caseName} · ${item.ending}</strong></span><button type="button" aria-label="${item.caseName} ending slot">Choose an ending</button>`;
    row.querySelector('button').addEventListener('click', () => returnEnding(index));
    orderList.append(row);
  });

  updateCount(0);
  setMessage(roundMessage || `Round ${correctRounds + 1} of ${MASTERY_GOAL}: match the endings in order.`);
}

function placeEnding(item, button) {
  if (checking || locked) return;
  const emptyIndex = placed.findIndex((entry) => entry === null);
  if (emptyIndex < 0) return;
  orderList.querySelectorAll('.ending-order-row').forEach((row) => row.classList.remove('correct', 'wrong'));
  placed[emptyIndex] = item;
  button.disabled = true;
  button.classList.add('used');
  const slot = orderList.querySelector(`[data-index="${emptyIndex}"] button`);
  slot.textContent = item.ending;
  slot.dataset.id = item.id;
  slot.classList.add('filled');
  const filledCount = placed.filter(Boolean).length;
  updateCount(filledCount);

  if (filledCount === items.length) {
    checking = true;
    setMessage(`Round ${correctRounds + 1} is filled. Checking…`);
    pendingTimer = window.setTimeout(checkOrder, 180);
  } else {
    setMessage(`Round ${correctRounds + 1} of ${MASTERY_GOAL}: ${filledCount} / ${items.length} filled.`);
  }
}

function returnEnding(index) {
  if (checking || locked) return;
  const item = placed[index];
  if (!item) return;
  placed[index] = null;
  const slot = orderList.querySelector(`[data-index="${index}"] button`);
  slot.textContent = 'Choose an ending';
  slot.className = '';
  delete slot.dataset.id;
  const bankButton = bank.querySelector(`[data-id="${item.id}"]`);
  bankButton.disabled = false;
  bankButton.classList.remove('used');
  orderList.querySelectorAll('.ending-order-row').forEach((row) => row.classList.remove('correct', 'wrong'));
  const filledCount = placed.filter(Boolean).length;
  updateCount(filledCount);
  setMessage(`Round ${correctRounds + 1} of ${MASTERY_GOAL}: ${filledCount} / ${items.length} filled.`);
}

function checkOrder() {
  pendingTimer = null;
  checking = false;
  const results = placed.map((item, index) => item?.id === items[index].id);
  orderList.querySelectorAll('.ending-order-row').forEach((row, index) => {
    row.classList.toggle('correct', results[index]);
    row.classList.toggle('wrong', !results[index]);
  });

  if (results.every(Boolean)) {
    correctRounds += 1;
    locked = true;
    if (correctRounds < MASTERY_GOAL) {
      setMessage(`Perfect round ${correctRounds}! The board will clear by itself.`, 'success');
      pendingTimer = window.setTimeout(
        () => renderOrder(`Good. Round ${correctRounds + 1} of ${MASTERY_GOAL}: do it again.`),
        correctRounds === 1 ? 850 : 1150,
      );
      return;
    }
    finishPractice(`You matched the ${groupLabel(number).toLowerCase()} endings in order three times.`);
    return;
  }

  setMessage('A few endings are out of order. Tap a filled line to return an ending, then try again.', 'error');
}

function renderTyping(roundMessage = '') {
  checking = false;
  locked = false;
  typeList.replaceChildren();
  clearRoundResult();
  const isFinal = step === 'final';

  items.forEach((item, index) => {
    const divider = makeDivider(item, items[index - 1]);
    if (divider) typeList.append(divider);

    const row = document.createElement('label');
    row.className = 'ending-type-row';
    const visibleEnding = isFinal ? '' : ` · <b>${item.ending}</b>`;
    row.innerHTML = `<span><small>${item.group}</small><strong>${item.caseName}${visibleEnding}</strong></span><input type="text" inputmode="text" autocomplete="off" autocapitalize="none" spellcheck="false" aria-label="Type the ${item.caseName} ${item.group.toLowerCase()} ending" placeholder="type ending" />`;
    const input = row.querySelector('input');
    input.addEventListener('focus', () => { activeInput = input; });
    input.addEventListener('pointerdown', () => { activeInput = input; });
    input.addEventListener('input', () => updateTypingRow(row, input, item, index));
    input.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      checkTyping();
    });
    typeList.append(row);
  });

  updateCount(0);
  checkButton.disabled = true;
  setMessage(roundMessage || (isFinal
    ? 'Final test: type each ending with no hint.'
    : `Round ${correctRounds + 1} of ${MASTERY_GOAL}: type each visible ending.`));
  activeInput = typeList.querySelector('input');
  window.setTimeout(() => activeInput?.focus(), 0);
}

function normalizeEnding(value) {
  return String(value || '').trim().replace(/^[-‐‑‒–—−]\s*/, '').normalize('NFC');
}

function endingAnswerMatches(value, item) {
  const answer = normalizeEnding(value).toLowerCase();
  const expected = normalizeEnding(item.ending);
  if (answer === expected) return true;
  if (item.id === 'dat-singular' && answer === 'ωι') return true;
  return latinAliases[item.id]?.includes(answer) || false;
}

function nextIncorrectInput(currentIndex = -1) {
  const inputs = [...typeList.querySelectorAll('input')];
  for (let index = currentIndex + 1; index < inputs.length; index += 1) {
    if (!endingAnswerMatches(inputs[index].value, items[index])) return inputs[index];
  }
  for (let index = 0; index <= currentIndex; index += 1) {
    if (!endingAnswerMatches(inputs[index].value, items[index])) return inputs[index];
  }
  return null;
}

function updateTypingRow(row, input, item, index) {
  if (checking || locked) return;
  const correct = endingAnswerMatches(input.value, item);
  row.classList.toggle('correct', correct);
  row.classList.remove('wrong');
  const inputs = [...typeList.querySelectorAll('input')];
  const filled = inputs.filter((field) => field.value.trim()).length;
  updateCount(filled);
  checkButton.disabled = filled !== items.length;

  if (!correct) {
    setMessage(step === 'final'
      ? 'Final test: type each ending with no hint.'
      : `Round ${correctRounds + 1} of ${MASTERY_GOAL}: ${filled} / ${items.length} typed.`);
    return;
  }

  const nextInput = nextIncorrectInput(index);
  if (nextInput) {
    setMessage(`Correct. Next: ${items[inputs.indexOf(nextInput)].caseName}.`, 'success');
    window.setTimeout(() => nextInput.focus(), 70);
    return;
  }

  checking = true;
  setMessage('All endings correct! Checking…', 'success');
  pendingTimer = window.setTimeout(checkTyping, 220);
}

function checkTyping() {
  if (locked) return;
  if (pendingTimer) window.clearTimeout(pendingTimer);
  pendingTimer = null;
  checking = false;
  const rows = [...typeList.querySelectorAll('.ending-type-row')];
  const firstBlankRow = rows.find((row) => !row.querySelector('input').value.trim());
  if (firstBlankRow) {
    setMessage('Finish every line before checking.', 'error');
    firstBlankRow.querySelector('input').focus();
    return;
  }
  const results = rows.map((row, index) => {
    const input = row.querySelector('input');
    const correct = endingAnswerMatches(input.value, items[index]);
    row.classList.toggle('correct', correct);
    row.classList.toggle('wrong', !correct);
    return correct;
  });

  if (results.every(Boolean)) {
    locked = true;
    if (step === 'final') {
      finishPractice(`You typed all ${items.length} ${groupLabel(number).toLowerCase()} endings without visible hints.`);
      return;
    }

    correctRounds += 1;
    if (correctRounds < MASTERY_GOAL) {
      setMessage(`Perfect typing round ${correctRounds}! The board will clear by itself.`, 'success');
      pendingTimer = window.setTimeout(
        () => renderTyping(`Good. Round ${correctRounds + 1} of ${MASTERY_GOAL}: type them again.`),
        correctRounds === 1 ? 850 : 1150,
      );
      return;
    }
    finishPractice(`You typed the ${groupLabel(number).toLowerCase()} endings correctly three times.`);
    return;
  }

  setMessage('A few endings need fixing. Check the red rows and try again.', 'error');
  rows[results.findIndex((result) => !result)]?.querySelector('input')?.focus();
}

function finishPractice(text) {
  locked = true;
  checking = false;
  setMessage(step === 'final' ? 'Final test complete!' : 'Three perfect rounds!', 'success');
  completeMessage.textContent = text;
  completePanel.hidden = false;
  completePanel.classList.remove('celebrate');
  window.requestAnimationFrame(() => completePanel.classList.add('celebrate'));
  if (step !== 'final' && correctRounds === MASTERY_GOAL) launchFireworks();

  if (step === 'order') {
    nextPractice.href = `second-masculine-practice.html?step=type&number=${number}`;
    nextPractice.textContent = 'Continue to Step 2';
  } else if (step === 'type') {
    nextPractice.href = `second-masculine-practice.html?step=final&number=${number}`;
    nextPractice.textContent = 'Continue to Final Test';
  } else {
    nextPractice.href = 'second-masculine-game.html';
    nextPractice.textContent = 'Choose another practice';
  }

  try {
    window.localStorage.setItem(`secondMasculine-${step}-${number}`, 'complete');
  } catch {
    // Practice remains fully usable when saved progress is unavailable.
  }
}

function launchFireworks() {
  if (!fireworks) return;
  if (fireworksTimer) window.clearTimeout(fireworksTimer);
  const colors = ['#ec7d67', '#f5c75e', '#5b8fc9', '#3e9b77', '#ffffff'];
  const bursts = [
    { x: 18, y: 28, delay: 0 },
    { x: 48, y: 20, delay: 240 },
    { x: 78, y: 31, delay: 480 },
    { x: 32, y: 47, delay: 760 },
    { x: 68, y: 50, delay: 980 },
  ];

  fireworks.replaceChildren(...bursts.map((burst, burstIndex) => {
    const element = document.createElement('span');
    element.className = 'firework-burst';
    element.style.setProperty('--burst-x', `${burst.x}%`);
    element.style.setProperty('--burst-y', `${burst.y}%`);
    element.style.setProperty('--burst-delay', `${burst.delay}ms`);

    for (let sparkIndex = 0; sparkIndex < 16; sparkIndex += 1) {
      const angle = (Math.PI * 2 * sparkIndex) / 16;
      const distance = 58 + ((sparkIndex + burstIndex) % 4) * 13;
      const spark = document.createElement('i');
      spark.className = 'firework-spark';
      spark.style.setProperty('--spark-x', `${Math.cos(angle) * distance}px`);
      spark.style.setProperty('--spark-y', `${Math.sin(angle) * distance}px`);
      spark.style.setProperty('--spark-angle', `${(sparkIndex * 360) / 16 + 90}deg`);
      spark.style.setProperty('--spark-color', colors[(sparkIndex + burstIndex) % colors.length]);
      element.append(spark);
    }
    return element;
  }));

  fireworks.classList.remove('active');
  window.requestAnimationFrame(() => fireworks.classList.add('active'));
  fireworksTimer = window.setTimeout(() => {
    fireworks.classList.remove('active');
    fireworks.replaceChildren();
    fireworksTimer = null;
  }, 2600);
}

function resetPractice() {
  if (pendingTimer) window.clearTimeout(pendingTimer);
  pendingTimer = null;
  if (!completePanel.hidden) correctRounds = 0;
  checking = false;
  locked = false;
  if (step === 'order') renderOrder();
  else renderTyping();
}

function updateInputFromKeypad(value) {
  if (!activeInput || locked || checking) return;
  activeInput.value = value;
  activeInput.dispatchEvent(new Event('input', { bubbles: true }));
  activeInput.focus();
}

greekKeyboard?.addEventListener('pointerdown', (event) => {
  if (event.target.closest('button')) event.preventDefault();
});

greekKeyboard?.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button || !activeInput) return;
  const greekKey = button.dataset.greekKey;
  const action = button.dataset.keyboardAction;
  if (greekKey) {
    updateInputFromKeypad(`${activeInput.value}${greekKey}`);
    return;
  }
  if (action === 'backspace') {
    updateInputFromKeypad(Array.from(activeInput.value).slice(0, -1).join(''));
  } else if (action === 'clear') {
    updateInputFromKeypad('');
  }
});

if (step === 'order') {
  kicker.textContent = 'Step 1 · Ending order';
  title.textContent = `${groupLabel(number)} endings`;
  directions.textContent = 'Choose endings from the shuffled bank. The board checks itself when every line is filled.';
} else if (step === 'type') {
  kicker.textContent = 'Step 2 · Type it yourself';
  title.textContent = `${groupLabel(number)} endings`;
  directions.textContent = 'Copy each visible ending into its box. Complete three perfect rounds to master it.';
} else {
  kicker.textContent = 'Step 3 · Final test';
  title.textContent = `${groupLabel(number)} final test`;
  directions.textContent = 'Type each ending from memory. No ending hints are shown.';
}

orderPractice.hidden = step !== 'order';
typePractice.hidden = step === 'order';
checkButton.hidden = step === 'order';
checkButton.textContent = step === 'final' ? 'Check final test' : 'Check answers';
checkButton.addEventListener('click', checkTyping);
resetButton.addEventListener('click', resetPractice);
resetPractice();
