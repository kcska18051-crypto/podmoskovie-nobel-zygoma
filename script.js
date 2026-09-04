const dialog = document.querySelector('#consultation-dialog');
const openButtons = document.querySelectorAll('[data-open-form]');
const closeButton = document.querySelector('[data-close-form]');

function protectRussianShortWords(root = document.body) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const skippedParents = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'OPTION']);
  const shortWord = /(^|[\s(\[«„"])([А-Яа-яЁё]{1,2})[ \t]+(?=[А-Яа-яЁё0-9])/g;
  let node;

  while ((node = walker.nextNode())) {
    if (skippedParents.has(node.parentElement?.tagName)) continue;
    node.nodeValue = node.nodeValue.replace(shortWord, '$1$2\u00a0');
  }
}

protectRussianShortWords();

const implantChoice = document.querySelector('select[name="implant_type"]');
// Keep the native picker, keyboard navigation and required-field validation.
// Only its visible label is replaced, since native selects cannot wrap text.
const implantDisplay = document.createElement('span');
if (implantChoice) {
  implantDisplay.className = 'implant-select__display';
  implantDisplay.setAttribute('aria-hidden', 'true');
  implantChoice.parentElement.classList.add('implant-select');
  implantChoice.after(implantDisplay);
}
const doctorNote = document.querySelector('#zygoma-doctor-note');
function syncDoctorNote() {
  if (implantChoice) implantDisplay.textContent = implantChoice.selectedOptions[0]?.textContent || 'Вид имплантации';
  if (!implantChoice || !doctorNote) return;
  const isZygoma = implantChoice.value === 'zygoma';
  doctorNote.hidden = !isZygoma;
  if (isZygoma) implantChoice.setAttribute('aria-describedby', doctorNote.id);
  else implantChoice.removeAttribute('aria-describedby');
}
implantChoice?.addEventListener('change', syncDoctorNote);
implantChoice?.form?.addEventListener('reset', () => requestAnimationFrame(syncDoctorNote));
window.addEventListener('pageshow', syncDoctorNote);
syncDoctorNote();
document.querySelector('.zygoma-doctor__actions button')?.addEventListener('click', () => {
  if (!implantChoice) return;
  implantChoice.value = 'zygoma';
  syncDoctorNote();
  document.querySelector('#appointment')?.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    block: 'start'
  });
  implantChoice.focus({ preventScroll: true });
});

openButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (!dialog?.open) {
      dialog?.showModal();
      document.body.classList.add('dialog-open');
    }
  });
});

function closeDialog() {
  dialog?.close();
  document.body.classList.remove('dialog-open');
}

closeButton?.addEventListener('click', closeDialog);
dialog?.addEventListener('click', (event) => {
  const bounds = dialog.getBoundingClientRect();
  const inside = event.clientX >= bounds.left && event.clientX <= bounds.right
    && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
  if (!inside) closeDialog();
});
dialog?.addEventListener('close', () => document.body.classList.remove('dialog-open'));

document.querySelectorAll('.prototype-form').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const status = form.querySelector('.form-status');
    if (status) status.textContent = 'Форма демонстрационная — данные не отправлены.';
  });
});

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealItems = document.querySelectorAll('.reveal');
if (reducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  revealItems.forEach((item) => revealObserver.observe(item));
}

document.querySelectorAll('.before-after').forEach((comparison) => {
  const range = comparison.querySelector('.before-after__range');
  if (!range) return;

  const updatePosition = () => {
    comparison.style.setProperty('--position', `${range.value}%`);
  };

  range.addEventListener('input', updatePosition);
  range.addEventListener('change', updatePosition);
  updatePosition();
});
