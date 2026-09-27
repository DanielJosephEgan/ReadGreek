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
const step = params.get('step') === 'type' ? 'type' : 'order';
const requestedNumber = params.get('number');
const number = ['singular', 'plural', 'both'].includes(requestedNumber) ? requestedNumber : 'singular';
const items = number === 'both' ? [...endingSets.singular, ...endingSets.plural] : [...endingSets[number]];

const orderPractice = document.querySelector('#order-practice');
const typePractice = document.querySelector('#type-practice');
const bank = document.querySelector('#ending-bank');
const orderList = document.querySelector('#order-list');
const typeList = document.querySelector('#type-list');
const count = document.querySelector('#practice-count');
const kicker = document.querySelector('#practice-kicker');
const title = document.querySelector('#practice-title');
const directions = document.querySelector('#practice-directions');
const message = document.querySelector('#practice-message');
const checkButton = document.querySelector('#check-practice');
const resetButton = document.querySelector('#reset-practice');
const completePanel = document.querySelector('#practice-complete');
const completeMessage = document.querySelector('#complete-message');

let placed = [];

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

function clearResult() {
  message.textContent = '';
  message.className = 'ending-practice-message';
  completePanel.hidden = true;
}

function makeDivider(item, previousItem) {
  if (number !== 'both' || previousItem?.group === item.group) return null;
  const divider = document.createElement('h2');
  divider.className = 'ending-group-divider';
  divider.textContent = item.group;
  return divider;
}

function renderOrder() {
  placed = Array(items.length).fill(null);
  bank.replaceChildren();
  orderList.replaceChildren();
  clearResult();

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
    row.innerHTML = `<span><small>${item.group}</small><strong>${item.caseName}</strong></span><button type="button" aria-label="${item.caseName} ending slot">Choose an ending</button>`;
    row.querySelector('button').addEventListener('click', () => returnEnding(index));
    orderList.append(row);
  });

  updateCount(0);
  checkButton.textContent = 'Check order';
  checkButton.disabled = true;
}

function placeEnding(item, button) {
  const emptyIndex = placed.findIndex((entry) => entry === null);
  if (emptyIndex < 0) return;
  clearResult();
  placed[emptyIndex] = item;
  button.disabled = true;
  button.classList.add('used');
  const slot = orderList.querySelector(`[data-index="${emptyIndex}"] button`);
  slot.textContent = item.ending;
  slot.dataset.id = item.id;
  slot.classList.add('filled');
  updateCount(placed.filter(Boolean).length);
  checkButton.disabled = placed.some((entry) => entry === null);
}

function returnEnding(index) {
  const item = placed[index];
  if (!item) return;
  clearResult();
  placed[index] = null;
  const slot = orderList.querySelector(`[data-index="${index}"] button`);
  slot.textContent = 'Choose an ending';
  slot.className = '';
  delete slot.dataset.id;
  const bankButton = bank.querySelector(`[data-id="${item.id}"]`);
  bankButton.disabled = false;
  bankButton.classList.remove('used');
  orderList.querySelectorAll('.ending-order-row').forEach((row) => row.classList.remove('correct', 'wrong'));
  updateCount(placed.filter(Boolean).length);
  checkButton.disabled = true;
}

function checkOrder() {
  const results = placed.map((item, index) => item?.id === items[index].id);
  orderList.querySelectorAll('.ending-order-row').forEach((row, index) => {
    row.classList.toggle('correct', results[index]);
    row.classList.toggle('wrong', !results[index]);
  });
  if (results.every(Boolean)) {
    finishPractice(`You put all ${items.length} ${groupLabel(number).toLowerCase()} endings in order.`);
  } else {
    message.textContent = 'A few endings are out of order. Tap a filled line to return an ending, then try again.';
    message.className = 'ending-practice-message error';
  }
}

function renderTyping() {
  typeList.replaceChildren();
  clearResult();
  items.forEach((item, index) => {
    const divider = makeDivider(item, items[index - 1]);
    if (divider) typeList.append(divider);

    const row = document.createElement('label');
    row.className = 'ending-type-row';
    row.innerHTML = `<span><small>${item.group}</small><strong>${item.caseName} · <b>${item.ending}</b></strong></span><input type="text" inputmode="text" autocomplete="off" autocapitalize="none" spellcheck="false" aria-label="Type the ${item.caseName} ${item.group.toLowerCase()} ending" placeholder="type ending" />`;
    const input = row.querySelector('input');
    input.addEventListener('input', () => updateTypingRow(row, input, item, index));
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') checkTyping();
    });
    typeList.append(row);
  });
  updateCount(0);
  checkButton.textContent = 'Check answers';
  checkButton.disabled = true;
  window.setTimeout(() => typeList.querySelector('input')?.focus(), 0);
}

function normalizeEnding(value) {
  return String(value || '').trim().replace(/^[-‐‑‒–—−]\s*/, '').normalize('NFC');
}

function updateTypingRow(row, input, item, index) {
  clearResult();
  const correct = normalizeEnding(input.value) === normalizeEnding(item.ending);
  row.classList.toggle('correct', correct);
  row.classList.remove('wrong');
  const inputs = [...typeList.querySelectorAll('input')];
  const filled = inputs.filter((field) => field.value.trim()).length;
  updateCount(filled);
  checkButton.disabled = filled !== items.length;
  if (correct && inputs[index + 1]) inputs[index + 1].focus();
}

function checkTyping() {
  const rows = [...typeList.querySelectorAll('.ending-type-row')];
  const results = rows.map((row, index) => {
    const input = row.querySelector('input');
    const correct = normalizeEnding(input.value) === normalizeEnding(items[index].ending);
    row.classList.toggle('correct', correct);
    row.classList.toggle('wrong', !correct);
    return correct;
  });
  if (results.every(Boolean)) {
    finishPractice(`You typed all ${items.length} ${groupLabel(number).toLowerCase()} endings correctly.`);
  } else {
    message.textContent = 'Some endings need another look. Correct the red lines and check again.';
    message.className = 'ending-practice-message error';
    rows[results.findIndex((result) => !result)]?.querySelector('input')?.focus();
  }
}

function finishPractice(text) {
  message.textContent = 'Perfect!';
  message.className = 'ending-practice-message success';
  completeMessage.textContent = text;
  completePanel.hidden = false;
  try {
    window.localStorage.setItem(`secondMasculine-${step}-${number}`, 'complete');
  } catch {
    // Practice remains fully usable when saved progress is unavailable.
  }
}

function resetPractice() {
  if (step === 'order') renderOrder();
  else renderTyping();
}

kicker.textContent = step === 'order' ? 'Step 1 · Ending order' : 'Step 2 · Type it yourself';
title.textContent = `${groupLabel(number)} endings`;
directions.textContent = step === 'order'
  ? 'Choose endings from the bank to fill the cases in order. Tap a filled line to return it.'
  : 'Copy each visible ending into its box. You may type the leading dash or leave it out.';
orderPractice.hidden = step !== 'order';
typePractice.hidden = step !== 'type';
checkButton.addEventListener('click', step === 'order' ? checkOrder : checkTyping);
resetButton.addEventListener('click', resetPractice);
resetPractice();
