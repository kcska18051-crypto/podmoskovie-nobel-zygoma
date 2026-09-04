(() => {
  const strip = document.querySelector('.booking-strip');
  const hero = document.querySelector('.hero');
  const form = document.querySelector('#appointment');
  if (!strip || !hero || !form) return;
  let queued = false;
  const update = () => {
    queued = false;
    const heroBounds = hero.getBoundingClientRect();
    const formBounds = form.getBoundingClientRect();
    const visible = heroBounds.bottom <= 0 && !(formBounds.top < window.innerHeight && formBounds.bottom > 0);
    strip.classList.toggle('is-visible', visible);
    strip.inert = !visible;
    strip.setAttribute('aria-hidden', String(!visible));
    document.documentElement.classList.toggle('booking-strip-active', visible);
  };
  const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('pageshow', schedule);
  new ResizeObserver(schedule).observe(document.body);
  strip.querySelector('a').addEventListener('click', event => {
    event.preventDefault();
    form.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
    form.querySelector('input[name="name"]')?.focus({ preventScroll: true });
  });
  update();
})();
