/* Cookie consent for zanmediagroup.com.

   Nothing that tracks visitors (the Meta Pixel and Google Analytics) loads until the visitor taps Accept.
   Pages can call fbq() and gtag() at any time: the calls wait in a queue in the browser and are sent
   only after Accept. If the visitor taps Decline, or never chooses, the queue is never sent.

   A Global Privacy Control signal from the browser counts as Decline unless the visitor later taps Accept.
   The choice is saved in this browser for 12 months. "Cookie choices" in the footer reopens the banner.

   Load this file in <head>, before any inline script that calls fbq() or gtag(). */
(function () {
  var PIXEL_ID = '1217284990404446';
  var GA_ID = 'G-WXLGHLFHMK';
  var KEY = 'zmgConsent';
  var VERSION = 1;
  var MAX_AGE = 365 * 24 * 60 * 60 * 1000;
  var w = window, d = document, loaded = false;

  /* Queue-only stand-ins. These make no network requests. */
  if (!w.fbq) {
    var q = w.fbq = function () { q.callMethod ? q.callMethod.apply(q, arguments) : q.queue.push(arguments); };
    if (!w._fbq) w._fbq = q;
    q.push = q; q.loaded = true; q.version = '2.0'; q.queue = [];
  }
  w.dataLayer = w.dataLayer || [];
  if (!w.gtag) w.gtag = function () { w.dataLayer.push(arguments); };

  var DENIED = { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' };
  var GRANTED = { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'granted' };

  gtag('consent', 'default', DENIED);
  gtag('js', new Date());
  gtag('config', GA_ID);
  /* Only the events this site sends itself; no automatic event detection. */
  fbq('set', 'autoConfig', false, PIXEL_ID);
  fbq('init', PIXEL_ID);
  fbq('track', 'PageView');

  function readChoice() {
    try {
      var v = JSON.parse(w.localStorage.getItem(KEY));
      if (v && v.v === VERSION && (v.c === 'granted' || v.c === 'denied') && Date.now() - v.t < MAX_AGE) return v.c;
    } catch (e) {}
    return null;
  }

  function saveChoice(c) {
    try { w.localStorage.setItem(KEY, JSON.stringify({ c: c, v: VERSION, t: Date.now() })); } catch (e) {}
  }

  function addScript(src) {
    var s = d.createElement('script');
    s.async = true;
    s.src = src;
    d.head.appendChild(s);
  }

  function loadTracking() {
    if (loaded) return;
    loaded = true;
    gtag('consent', 'update', GRANTED);
    addScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID));
    addScript('https://connect.facebook.net/en_US/fbevents.js');
  }

  function clearTrackingCookies() {
    var host = w.location.hostname;
    var domains = ['', host, '.' + host, '.' + host.replace(/^www\./, '')];
    d.cookie.split(';').forEach(function (part) {
      var name = part.split('=')[0].trim();
      if (!/^(_ga|_gid|_gat|_gcl|_fbp|_fbc)/.test(name)) return;
      domains.forEach(function (dm) {
        d.cookie = name + '=; Max-Age=0; path=/' + (dm ? '; domain=' + dm : '');
      });
    });
  }

  var gpc = w.navigator && w.navigator.globalPrivacyControl === true;
  var choice = readChoice();
  if (choice === 'granted') loadTracking();
  else clearTrackingCookies();

  /* ---------- Banner ---------- */
  var css =
    '.zmg-consent{position:fixed;left:16px;right:16px;bottom:16px;z-index:2147483000;max-width:760px;margin:0 auto;' +
    'background:#000;color:#fff;border:1px solid #2c2c31;border-top:3px solid #5b2be0;border-radius:14px;' +
    'padding:18px 20px;display:flex;gap:16px 24px;align-items:center;flex-wrap:wrap;' +
    'box-shadow:0 10px 30px rgba(0,0,0,.25);font:inherit;font-size:.95rem;line-height:1.5}' +
    '.zmg-consent[hidden]{display:none}' +
    '.zmg-consent p{margin:0;flex:1 1 320px;color:#e9e9ee}' +
    '.zmg-consent a{color:#fff;text-decoration:underline;text-underline-offset:3px}' +
    '.zmg-consent-btns{display:flex;gap:10px;flex:0 0 auto}' +
    '.zmg-consent button{font:inherit;font-weight:600;font-size:.95rem;min-width:110px;min-height:44px;padding:10px 18px;' +
    'border-radius:999px;border:1.5px solid #fff;background:#fff;color:#000;cursor:pointer}' +
    '.zmg-consent button:hover{background:#e9e9ee}' +
    '.zmg-consent button:focus-visible,.zmg-consent a:focus-visible{outline:3px solid #bba6ff;outline-offset:2px}' +
    '@media (max-width:520px){.zmg-consent-btns{width:100%}.zmg-consent button{flex:1}}';

  var banner = null;

  function buildBanner() {
    var style = d.createElement('style');
    style.textContent = css;
    d.head.appendChild(style);

    banner = d.createElement('div');
    banner.className = 'zmg-consent';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Cookie choices');
    banner.hidden = true;
    banner.innerHTML =
      '<p>We use cookies for site analytics and to measure our ads on Facebook and Instagram. ' +
      'Nothing that tracks you loads unless you tap Accept. <a href="/privacy.html#cookies">Privacy Policy</a></p>' +
      '<div class="zmg-consent-btns">' +
      '<button type="button" data-zmg-choice="denied">Decline</button>' +
      '<button type="button" data-zmg-choice="granted">Accept</button>' +
      '</div>';
    banner.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-zmg-choice]');
      if (btn) choose(btn.getAttribute('data-zmg-choice'));
    });
    d.body.appendChild(banner);
  }

  function showBanner(focus) {
    if (!banner) buildBanner();
    banner.hidden = false;
    if (focus) {
      var first = banner.querySelector('button');
      if (first) first.focus();
    }
  }

  function choose(c) {
    var wasLoaded = loaded;
    saveChoice(c);
    if (banner) banner.hidden = true;
    if (c === 'granted') {
      loadTracking();
    } else {
      clearTrackingCookies();
      /* Tracking already ran on this page before the visitor changed their mind: reload so it stops. */
      if (wasLoaded) w.location.reload();
    }
  }

  function init() {
    if (!choice && !gpc) showBanner(false);
    else if (!banner) buildBanner();
    d.addEventListener('click', function (e) {
      var link = e.target.closest('[data-cookie-settings]');
      if (!link) return;
      e.preventDefault();
      showBanner(true);
    });
  }

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init);
  else init();

  /* For testing and support: window.zmgConsent.state() */
  w.zmgConsent = {
    state: function () { return { choice: readChoice(), gpc: gpc, trackingLoaded: loaded }; },
    open: function () { showBanner(true); }
  };
})();
