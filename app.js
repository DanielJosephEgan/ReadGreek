const buttons = document.querySelectorAll('.letter-choice');
const toast = document.querySelector('.toast');
let timer;

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    if (button.dataset.href) {
      window.location.href = button.dataset.href;
      return;
    }
    buttons.forEach((item) => {
      const isChosen = item === button;
      item.classList.toggle('selected', isChosen);
      item.setAttribute('aria-pressed', String(isChosen));
    });
    toast.textContent = `${button.dataset.choice} selected — your first lesson is ready.`;
    toast.classList.add('show');
    clearTimeout(timer);
    timer = setTimeout(() => toast.classList.remove('show'), 2800);
  });
});
