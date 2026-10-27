const MASTERY_GOAL = 3;
const forms = {
  singular: [
    { id: 'first-singular', person: '1st person', group: 'Singular', meaning: 'I am', form: 'εἰμί', answers: ['ειμι', 'eimi'] },
    { id: 'second-singular', person: '2nd person', group: 'Singular', meaning: 'you are', form: 'εἶ', answers: ['ει', 'ei'] },
    { id: 'third-singular', person: '3rd person', group: 'Singular', meaning: 'he, she, it is', form: 'ἐστί(ν)', answers: ['εστι', 'εστιν', 'esti', 'estin'] },
  ],
  plural: [
    { id: 'first-plural', person: '1st person', group: 'Plural', meaning: 'we are', form: 'ἐσμέν', answers: ['εσμεν', 'esmen'] },
    { id: 'second-plural', person: '2nd person', group: 'Plural', meaning: "y'all are", form: 'ἐστέ', answers: ['εστε', 'este'] },
    { id: 'third-plural', person: '3rd person', group: 'Plural', meaning: 'they are', form: 'εἰσί(ν)', answers: ['εισι', 'εισιν', 'eisi', 'eisin'] },
  ],
};

const params = new URLSearchParams(window.location.search);
const requestedStep = params.get('step');
const step = ['order', 'type', 'final'].includes(requestedStep) ? requestedStep : 'order';
const requestedNumber = params.get('number');
const number = ['singular', 'plural', 'both'].includes(requestedNumber) ? requestedNumber : 'singular';
const items = number === 'both' ? [...forms.singular, ...forms.plural] : [...forms[number]];

const orderPractice = document.querySelector('#order-practice');
const typePractice = document.querySelector('#type-practice');
const bank = document.querySelector('#form-bank');
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

function makeDivider(item, previousItem) {
  if (number !== 'both' || previousItem?.group === item.group) return null;
  const divider = document.createElement('h2');
  divider.className = 'ending-group-divider';
  divider.textContent = item.group;
  return divider;
}

function clearResult() {
  completePanel.hidden = true;
  orderList.querySelectorAll('.ending-order-row').forEach((row) => row.classList.remove('correct', 'wrong'));
  typeList.querySelectorAll('.ending-type-row').forEach((row) => row.classList.remove('correct', 'wrong'));
}

function renderOrder(roundMessage = '') {
  checking = false;
  locked = false;
  placed = Array(items.length).fill(null);
  bank.replaceChildren();
  orderList.replaceChildren();
  clearResult();

  shuffle(items).forEach((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ending-bank-button';
    button.dataset.id = item.id;
    button.textContent = item.form;
    button.setAttribute('aria-label', `Choose form ${item.form}`);
    button.addEventListener('click', () => placeForm(item, button));
    bank.append(button);
  });

  items.forEach((item, index) => {
    const divider = makeDivider(item, items[index - 1]);
    if (divider) orderList.append(divider);
    const row = document.createElement('div');
    row.className = 'ending-order-row';
    row.dataset.index = String(index);
    row.innerHTML = `<span><small>${item.group}</small><strong>${item.person} · ${item.meaning}</strong></span><button type="button" aria-label="${item.person} ${item.group.toLowerCase()} form slot">Choose a form</button>`;
    row.querySelector('button').addEventListener('click', () => returnForm(index));
    orderList.append(row);
  });

  updateCount(0);
  setMessage(roundMessage || `Round ${correctRounds + 1} of ${MASTERY_GOAL}: place the forms in person order.`);
}

function placeForm(item, button) {
  if (checking || locked) return;
  const emptyIndex = placed.findIndex((entry) => entry === null);
  if (emptyIndex < 0) return;
  placed[emptyIndex] = item;
  button.disabled = true;
  button.classList.add('used');
  const slot = orderList.querySelector(`[data-index="${emptyIndex}"] button`);
  slot.textContent = item.form;
  slot.dataset.id = item.id;
  slot.classList.add('filled');
  const filled = placed.filter(Boolean).length;
  updateCount(filled);
  if (filled === items.length) {
    checking = true;
    setMessage(`Round ${correctRounds + 1} is filled. Checking…`);
    pendingTimer = window.setTimeout(checkOrder, 180);
  } else {
    setMessage(`Round ${correctRounds + 1} of ${MASTERY_GOAL}: ${filled} / ${items.length} filled.`);
  }
}

function returnForm(index) {
  if (checking || locked) return;
  const item = placed[index];
  if (!item) return;
  placed[index] = null;
  const slot = orderList.querySelector(`[data-index="${index}"] button`);
  slot.textContent = 'Choose a form';
  slot.className = '';
  delete slot.dataset.id;
  const bankButton = bank.querySelector(`[data-id="${item.id}"]`);
  bankButton.disabled = false;
  bankButton.classList.remove('used');
  updateCount(placed.filter(Boolean).length);
}

function checkOrder() {
  pendingTimer = null;
  checking = false;
  const results = placed.map((item, index) => item?.id === items[index].id);
  orderList.querySelectorAll('.ending-order-row').forEach((row, index) => {
    row.classList.toggle('correct', results[index]);
    row.classList.toggle('wrong', !results[index]);
  });
  if (!results.every(Boolean)) {
    setMessage('A few forms are out of order. Select a filled line to return it, then try again.', 'error');
    return;
  }
  correctRounds += 1;
  locked = true;
  if (correctRounds < MASTERY_GOAL) {
    setMessage(`Perfect round ${correctRounds}! The board will clear by itself.`, 'success');
    pendingTimer = window.setTimeout(() => renderOrder(`Good. Round ${correctRounds + 1} of ${MASTERY_GOAL}: do it again.`), 850);
    return;
  }
  finishPractice(`You placed the ${groupLabel(number).toLowerCase()} forms in order three times.`);
}

function normalize(value) {
  return String(value || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[()'’\s]/g, '');
}

function answerMatches(value, item) {
  const answer = normalize(value);
  return item.answers.some((candidate) => normalize(candidate) === answer);
}

function renderTyping(roundMessage = '') {
  checking = false;
  locked = false;
  typeList.replaceChildren();
  clearResult();
  const isFinal = step === 'final';

  items.forEach((item, index) => {
    const divider = makeDivider(item, items[index - 1]);
    if (divider) typeList.append(divider);
    const row = document.createElement('label');
    row.className = 'ending-type-row';
    const visibleForm = isFinal ? '' : ` · <b>${item.form}</b>`;
    row.innerHTML = `<span><small>${item.group}</small><strong>${item.person} · ${item.meaning}${visibleForm}</strong></span><input type="text" inputmode="text" autocomplete="off" autocapitalize="none" spellcheck="false" aria-label="Type the ${item.person} ${item.group.toLowerCase()} form" placeholder="type form" />`;
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
  setMessage(roundMessage || (isFinal ? 'Final test: type each form with no Greek hint.' : `Round ${correctRounds + 1} of ${MASTERY_GOAL}: type each visible form.`));
  activeInput = typeList.querySelector('input');
  window.setTimeout(() => activeInput?.focus(), 0);
}

function nextIncorrectInput(currentIndex = -1) {
  const inputs = [...typeList.querySelectorAll('input')];
  for (let offset = 1; offset <= inputs.length; offset += 1) {
    const index = (currentIndex + offset) % inputs.length;
    if (!answerMatches(inputs[index].value, items[index])) return inputs[index];
  }
  return null;
}

function updateTypingRow(row, input, item, index) {
  if (checking || locked) return;
  const correct = answerMatches(input.value, item);
  row.classList.toggle('correct', correct);
  row.classList.remove('wrong');
  const inputs = [...typeList.querySelectorAll('input')];
  const filled = inputs.filter((field) => field.value.trim()).length;
  updateCount(filled);
  checkButton.disabled = filled !== items.length;
  if (!correct) return;
  const nextInput = nextIncorrectInput(index);
  if (nextInput) {
    setMessage(`Correct. Next: ${items[inputs.indexOf(nextInput)].person}.`, 'success');
    window.setTimeout(() => nextInput.focus(), 70);
    return;
  }
  checking = true;
  setMessage('All forms correct! Checking…', 'success');
  pendingTimer = window.setTimeout(checkTyping, 220);
}

function checkTyping() {
  if (locked) return;
  if (pendingTimer) window.clearTimeout(pendingTimer);
  pendingTimer = null;
  checking = false;
  const rows = [...typeList.querySelectorAll('.ending-type-row')];
  const blank = rows.find((row) => !row.querySelector('input').value.trim());
  if (blank) {
    setMessage('Finish every line before checking.', 'error');
    blank.querySelector('input').focus();
    return;
  }
  const results = rows.map((row, index) => {
    const correct = answerMatches(row.querySelector('input').value, items[index]);
    row.classList.toggle('correct', correct);
    row.classList.toggle('wrong', !correct);
    return correct;
  });
  if (!results.every(Boolean)) {
    setMessage('A few forms need fixing. Check the red rows and try again.', 'error');
    rows[results.findIndex((result) => !result)]?.querySelector('input')?.focus();
    return;
  }

  locked = true;
  if (step === 'final') {
    finishPractice(`You typed all ${items.length} ${groupLabel(number).toLowerCase()} forms without Greek hints.`);
    return;
  }
  correctRounds += 1;
  if (correctRounds < MASTERY_GOAL) {
    setMessage(`Perfect typing round ${correctRounds}! The board will clear by itself.`, 'success');
    pendingTimer = window.setTimeout(() => renderTyping(`Good. Round ${correctRounds + 1} of ${MASTERY_GOAL}: type them again.`), 850);
    return;
  }
  finishPractice(`You typed the ${groupLabel(number).toLowerCase()} forms correctly three times.`);
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
    nextPractice.href = `verb-of-being-practice.html?step=type&number=${number}`;
    nextPractice.textContent = 'Continue to Step 2';
  } else if (step === 'type') {
    nextPractice.href = `verb-of-being-practice.html?step=final&number=${number}`;
    nextPractice.textContent = 'Continue to Final Test';
  } else {
    nextPractice.href = 'verb-of-being-game.html';
    nextPractice.textContent = 'Choose another practice';
  }
  try {
    window.localStorage.setItem(`verbOfBeing-${step}-${number}`, 'complete');
  } catch {
    // Practice remains fully usable when saved progress is unavailable.
  }
}

function launchFireworks() {
  if (!fireworks) return;
  if (fireworksTimer) window.clearTimeout(fireworksTimer);
  const colors = ['#ec7d67', '#f5c75e', '#5b8fc9', '#3e9b77', '#ffffff'];
  const bursts = [{ x: 18, y: 28, delay: 0 }, { x: 48, y: 20, delay: 240 }, { x: 78, y: 31, delay: 480 }, { x: 32, y: 47, delay: 760 }, { x: 68, y: 50, delay: 980 }];
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
  if (button.dataset.greekKey) updateInputFromKeypad(`${activeInput.value}${button.dataset.greekKey}`);
  else if (button.dataset.keyboardAction === 'backspace') updateInputFromKeypad(Array.from(activeInput.value).slice(0, -1).join(''));
  else if (button.dataset.keyboardAction === 'clear') updateInputFromKeypad('');
});

if (step === 'order') {
  kicker.textContent = 'Step 1 · Form order';
  title.textContent = `${groupLabel(number)} forms`;
  directions.textContent = 'Choose forms from the shuffled bank. The board checks itself when every line is filled.';
} else if (step === 'type') {
  kicker.textContent = 'Step 2 · Type it yourself';
  title.textContent = `${groupLabel(number)} forms`;
  directions.textContent = 'Copy each visible form into its box. Complete three perfect rounds to master it.';
} else {
  kicker.textContent = 'Step 3 · Final test';
  title.textContent = `${groupLabel(number)} final test`;
  directions.textContent = 'Type each form from memory. No Greek hints are shown.';
}

orderPractice.hidden = step !== 'order';
typePractice.hidden = step === 'order';
checkButton.hidden = step === 'order';
checkButton.textContent = step === 'final' ? 'Check final test' : 'Check answers';
checkButton.addEventListener('click', checkTyping);
resetButton.addEventListener('click', resetPractice);
resetPractice();
