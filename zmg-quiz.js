/* Zan Media Group lead quiz.
   One question per screen, contact details last. Answers are sent as JSON to the GoHighLevel
   inbound webhook below, then the visitor lands on /thank-you.html (which counts the Lead).
   Leave ENDPOINT blank to keep online submissions off; the form then asks people to call or text. */
(function () {
  'use strict';

  var ENDPOINT = '';
  var PHONE_HTML = '<a href="tel:+19107149175">(910) 714-9175</a>';
  var PHONE_RE = /^[+]?1?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var ATTR_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'];

  /* Keep the ad click details for the whole visit. */
  var attr = {};
  try { attr = JSON.parse(sessionStorage.getItem('zmgAttr') || '{}') || {}; } catch (e) { attr = {}; }
  var params = new URLSearchParams(window.location.search);
  ATTR_KEYS.forEach(function (k) { if (params.get(k)) attr[k] = params.get(k).slice(0, 200); });
  if (!attr.landing_page) attr.landing_page = window.location.pathname;
  if (!attr.referrer && document.referrer) attr.referrer = document.referrer.slice(0, 300);
  try { sessionStorage.setItem('zmgAttr', JSON.stringify(attr)); } catch (e) {}

  function setError(el, msg) {
    var box = document.getElementById(el.getAttribute('data-error'));
    if (box) box.textContent = msg || '';
    if (el.matches('input')) {
      if (msg) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
    } else {
      el.classList.toggle('has-error', !!msg);
    }
  }

  function validate(scope) {
    var first = null;
    scope.querySelectorAll('[data-required-group]').forEach(function (g) {
      var msg = g.querySelector('input:checked') ? '' : 'Pick one to keep going.';
      setError(g, msg);
      if (msg && !first) first = g.querySelector('input');
    });
    scope.querySelectorAll('input[data-error]').forEach(function (inp) {
      var v = (inp.value || '').trim(), label = inp.getAttribute('data-label') || 'This field', msg = '';
      if (inp.required && !v) msg = label + ' is required.';
      else if (v && inp.type === 'tel' && !PHONE_RE.test(v)) msg = 'Enter a 10 digit phone number, like 910-555-0123.';
      else if (v && inp.type === 'email' && !EMAIL_RE.test(v)) msg = 'Enter an email address, like name@company.com.';
      setError(inp, msg);
      if (msg && !first) first = inp;
    });
    return first;
  }

  function payload(form) {
    var data = {};
    new FormData(form).forEach(function (v, k) { if (k !== 'website') data[k] = String(v).trim(); });
    var parts = (data.full_name || '').split(/\s+/);
    data.first_name = parts.shift() || '';
    data.last_name = parts.join(' ');
    if (!data.sms_consent) data.sms_consent = 'no';
    Object.keys(attr).forEach(function (k) { data[k] = attr[k]; });
    data.page_url = window.location.href.split('#')[0];
    data.lead_source = 'Website quiz';
    data.submitted_at = new Date().toISOString();
    return data;
  }

  function setup(form) {
    var steps = Array.prototype.slice.call(form.querySelectorAll('.zq-step'));
    var progress = form.querySelector('.zq-progress');
    var bar = form.querySelector('.zq-bar span');
    var back = form.querySelector('.zq-back');
    var next = form.querySelector('.zq-next');
    var submit = form.querySelector('.zq-submit');
    var status = form.querySelector('.zq-status');
    var i = 0, byPointer = false;

    function show(n, focus) {
      i = Math.max(0, Math.min(n, steps.length - 1));
      steps.forEach(function (s, k) { s.hidden = k !== i; });
      progress.textContent = 'Question ' + (i + 1) + ' of ' + steps.length;
      bar.style.width = ((i + 1) / steps.length * 100) + '%';
      back.hidden = i === 0;
      next.hidden = i === steps.length - 1;
      submit.hidden = i !== steps.length - 1;
      if (focus) steps[i].querySelector('.zq-q').focus();
    }
    function forward() {
      var bad = validate(steps[i]);
      if (bad) { bad.focus(); return; }
      show(i + 1, true);
    }

    form.classList.add('zq-on');
    next.addEventListener('click', forward);
    back.addEventListener('click', function () { show(i - 1, true); });
    form.addEventListener('pointerdown', function () { byPointer = true; });
    form.addEventListener('keydown', function (e) {
      byPointer = false;
      if (e.key === 'Enter' && e.target.tagName === 'INPUT' && i < steps.length - 1) { e.preventDefault(); forward(); }
    });
    form.addEventListener('change', function (e) {
      var t = e.target;
      if (t.type === 'radio') {
        var g = t.closest('[data-required-group]');
        if (g) setError(g, '');
        /* A tap on a tile moves on by itself. Arrow keys only change the choice. */
        if (byPointer && i < steps.length - 1) setTimeout(forward, 180);
      }
      byPointer = false;
    });
    form.addEventListener('input', function (e) {
      if (e.target.getAttribute('aria-invalid') === 'true') setError(e.target, '');
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.className = 'zq-status';
      status.textContent = '';
      var bad = validate(form);
      if (bad) {
        show(steps.findIndex(function (s) { return s.contains(bad); }), false);
        bad.focus();
        return;
      }
      if (form.website && form.website.value) return;
      if (!ENDPOINT) {
        status.className = 'zq-status err';
        status.innerHTML = 'Online requests are not connected yet. Call or text ' + PHONE_HTML + ' and Zane will get back to you.';
        status.focus();
        return;
      }
      submit.disabled = true;
      submit.setAttribute('aria-busy', 'true');
      submit.textContent = 'Sending...';
      fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload(form)) })
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          window.location.href = '/thank-you.html';
        })
        .catch(function () {
          status.className = 'zq-status err';
          status.innerHTML = 'Something went wrong sending that. Call or text ' + PHONE_HTML + '.';
          status.focus();
          submit.disabled = false;
          submit.removeAttribute('aria-busy');
          submit.textContent = 'Send it';
        });
    });

    show(0, false);
  }

  document.querySelectorAll('form[data-zmg-quiz]').forEach(setup);
})();
