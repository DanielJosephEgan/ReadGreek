const groupInputs = document.querySelectorAll('input[name="study-group"]');
const testButton = document.querySelector('.test-button');
const toast = document.querySelector('.toast');

groupInputs.forEach((input) => input.addEventListener('change', () => {
  testButton.disabled = ![...groupInputs].some((item) => item.checked);
  document.querySelectorAll('.letter-group').forEach((group) => group.classList.toggle('chosen', group.querySelector('input').checked));
}));

testButton.addEventListener('click', () => {
  const selectedGroups = [...groupInputs].filter((item) => item.checked).map((item) => item.value);
  if (!selectedGroups.length) return;
  const url = `match.html?groups=${encodeURIComponent(selectedGroups.join(','))}`;
  window.location.href = url;
});
