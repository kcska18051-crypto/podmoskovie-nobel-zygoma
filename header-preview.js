(() => {
  const panel = document.querySelector('#pm-navigation');
  const title = panel.querySelector('#pm-panel-title');
  const back = panel.querySelector('[data-pm-back]');
  const menu = panel.querySelector('[data-pm-menu-view]');
  const services = panel.querySelector('[data-pm-services-view]');
  const all = panel.querySelector('.pm-all-services');
  const mobile = matchMedia('(max-width: 760px)');
  const groups = [...panel.querySelectorAll('details')];
  const scrollArea = panel.querySelector('.pm-panel-body');
  let pageHash = location.hash.startsWith('#pm-service-') ? '' : location.hash;
  let returnFocus;
  let fromMenu = false;

  const pathOf = value => new URL(value, location.href).pathname.replace(/\/+$/, '') || '/';
  function currentPath() {
    // The preview has a different URL from the clinic's service page.
    // On the clinic website the actual service URL always takes precedence.
    return location.pathname.startsWith('/services/') ? pathOf(location.href)
      : pathOf(document.querySelector('[data-pm-current-path]')?.dataset.pmCurrentPath || location.href);
  }
  function reveal(group, updateAnchor = true) {
    groups.forEach(other => { other.open = other === group && !group.classList.contains('pm-service-leaf'); });
    if (updateAnchor) history.replaceState(history.state, '', `${location.pathname}${location.search}#${group.id}`);
    requestAnimationFrame(() => {
      scrollArea.scrollTo({top: scrollArea.scrollTop + group.getBoundingClientRect().top - scrollArea.getBoundingClientRect().top - 8, behavior: 'instant'});
    });
  }
  function markCurrent() {
    const current = currentPath();
    let selected;
    groups.forEach(group => {
      const category = pathOf(group.querySelector('.pm-direction').href);
      const belongs = current === category || current.startsWith(category + '/');
      group.classList.toggle('pm-current-category', belongs);
      const categoryLink = group.querySelector('.pm-mobile-category-link');
      if (current === category) categoryLink.setAttribute('aria-current', 'page');
      else categoryLink.removeAttribute('aria-current');
      if (belongs) selected = group;
      group.querySelectorAll('.pm-service-links > a').forEach(link => {
        const exact = pathOf(link.href) === current;
        if (exact) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      });
    });
    return selected;
  }
  groups.forEach(group => {
    const summary = group.querySelector('summary');
    const destination = group.querySelector('.pm-direction').href;
    const hasChildren = !!group.querySelector('.pm-service-links > a:not(.pm-direction)');
    group.classList.toggle('pm-service-leaf', !hasChildren);
    group.id = `pm-service-${new URL(destination).pathname.split('/')[2]}`;
    const link = document.createElement('a');
    link.className = 'pm-mobile-category-link';
    link.innerHTML = summary.innerHTML;
    link.href = `#${group.id}`;
    summary.append(link);
    const syncLink = () => {
      link.href = !hasChildren || group.open ? destination : `#${group.id}`;
      if (hasChildren) {
        link.setAttribute('aria-expanded', String(group.open));
        link.setAttribute('aria-controls', `${group.id}-links`);
      }
    };
    group.querySelector('.pm-service-links').id = `${group.id}-links`;
    link.addEventListener('click', event => {
      if (!mobile.matches || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      if (hasChildren && !group.open) {
        event.preventDefault();
        reveal(group);
        syncLink();
      }
      // An already expanded category follows its normal navigation URL.
      event.stopPropagation();
    });
    group.addEventListener('toggle', syncLink);
    syncLink();
  });
  markCurrent();

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
      if (button.dataset.pmOpen === 'services' && mobile.matches) {
        const anchored = groups.find(group => `#${group.id}` === location.hash);
        const active = anchored || markCurrent();
        if (active) reveal(active, false);
      }
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
    if (location.hash.startsWith('#pm-service-')) history.replaceState(history.state, '', `${location.pathname}${location.search}${pageHash}`);
  });
  groups.forEach(group => group.addEventListener('toggle', () => {
    if (group.open && matchMedia('(max-width: 760px)').matches) {
      groups.forEach(other => { if (other !== group) other.open = false; });
    }
  }));
  function openAnchor() {
    if (!mobile.matches) return;
    const group = groups.find(item => `#${item.id}` === location.hash);
    if (!group) return;
    fromMenu = false;
    view('services');
    if (!panel.open) { panel.showModal(); document.body.classList.add('pm-navigation-open'); }
    reveal(group, false);
  }
  window.addEventListener('hashchange', openAnchor);
  openAnchor();
  document.querySelectorAll('[data-pm-book]').forEach(button => button.addEventListener('click', () => {
    if (panel.open) { returnFocus = null; panel.close(); }
    const form = document.querySelector('#appointment');
    form.scrollIntoView({behavior: 'instant', block: 'start'});
    form.querySelector('input')?.focus({preventScroll: true});
  }));
})();
