(() => {
  const panel = document.querySelector('#pm-navigation');
  const title = panel.querySelector('#pm-panel-title');
  const back = panel.querySelector('[data-pm-back]');
  const menu = panel.querySelector('[data-pm-menu-view]');
  const services = panel.querySelector('[data-pm-services-view]');
  const all = panel.querySelector('.pm-all-services');
  let returnFocus;
  let fromMenu = false;

  function view(name) {
    const isServices = name === 'services';
    menu.hidden = isServices;
    services.hidden = !isServices;
    title.textContent = isServices ? 'Услуги' : 'Меню';
    back.hidden = !isServices || !fromMenu;
    all.hidden = !isServices;
    panel.querySelector('.pm-panel-body').scrollTop = 0;
  }
  document.querySelectorAll('[data-pm-open]').forEach(button => {
    button.addEventListener('click', () => {
      fromMenu = panel.open;
      view(button.dataset.pmOpen);
      if (!panel.open) {
        returnFocus = button;
        panel.showModal();
        document.body.classList.add('pm-navigation-open');
        button.setAttribute('aria-expanded', 'true');
      }
      panel.querySelector('[data-pm-close]').focus();
    });
  });
  panel.querySelector('[data-pm-close]').addEventListener('click', () => panel.close());
  back.addEventListener('click', () => { view('menu'); menu.querySelector('button').focus(); });
  panel.addEventListener('click', event => { if (event.target === panel) {
    const r = panel.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) panel.close();
  } });
  panel.addEventListener('close', () => {
    document.body.classList.remove('pm-navigation-open');
    document.querySelectorAll('[data-pm-open]').forEach(button => button.setAttribute('aria-expanded', 'false'));
    returnFocus?.focus({preventScroll: true});
  });
  const groups = [...panel.querySelectorAll('details')];
  groups.forEach(group => group.addEventListener('toggle', () => {
    if (group.open && matchMedia('(max-width: 760px)').matches) {
      groups.forEach(other => { if (other !== group) other.open = false; });
    }
  }));
  document.querySelectorAll('[data-pm-book]').forEach(button => button.addEventListener('click', () => {
    if (panel.open) { returnFocus = null; panel.close(); }
    const form = document.querySelector('#appointment');
    form.scrollIntoView({behavior: 'instant', block: 'start'});
    form.querySelector('input')?.focus({preventScroll: true});
  }));
})();
