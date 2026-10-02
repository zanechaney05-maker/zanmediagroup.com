/* Zan Media Group: shared behavior for every page.
   1. Mobile menu toggle
   2. Footer copyright year
   3. Offline notice next to the lead forms */
(function () {
  var root = document.documentElement;

  /* 1. Mobile menu */
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('nav-menu');
  if (toggle && menu) {
    var setOpen = function (open) {
      menu.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 600) setOpen(false);
    });
  }

  /* 2. Copyright year stays current without editing every page */
  var year = String(new Date().getFullYear());
  var years = document.querySelectorAll('[data-year]');
  for (var i = 0; i < years.length; i++) years[i].textContent = year;

  /* 3. Show the form error notice while the visitor is offline */
  var syncOnline = function () {
    root.classList.toggle('is-offline', navigator.onLine === false);
  };
  window.addEventListener('online', syncOnline);
  window.addEventListener('offline', syncOnline);
  syncOnline();
})();
