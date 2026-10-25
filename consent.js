/* unwaiting – lišta so súhlasom s cookies (Google Consent Mode v2) */
(function () {
  // Doplň ID, keď budú hotové účty. Kým je prázdne, nič sa nenačíta.
  var GTM_ID = '';

  var NAME = 'uw_cookie_consent';
  var MAX_AGE = 60 * 60 * 24 * 182; // 6 mesiacov

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  // Predvolene je všetko okrem nevyhnutného vypnuté
  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500
  });

  function read() {
    var m = document.cookie.match(new RegExp('(?:^|; )' + NAME + '=([^;]*)'));
    if (!m) return null;
    try { return JSON.parse(decodeURIComponent(m[1])); } catch (e) { return null; }
  }

  function save(c) {
    c.t = Date.now();
    document.cookie = NAME + '=' + encodeURIComponent(JSON.stringify(c)) +
      '; max-age=' + MAX_AGE + '; path=/; SameSite=Lax' +
      (location.protocol === 'https:' ? '; Secure' : '');
  }

  var gtmLoaded = false;
  function loadGTM() {
    if (!GTM_ID || gtmLoaded) return;
    gtmLoaded = true;
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=' + GTM_ID;
    document.head.appendChild(s);
  }

  function apply(c) {
    gtag('consent', 'update', {
      analytics_storage: c.a ? 'granted' : 'denied',
      ad_storage: c.m ? 'granted' : 'denied',
      ad_user_data: c.m ? 'granted' : 'denied',
      ad_personalization: c.m ? 'granted' : 'denied'
    });
    window.dataLayer.push({ event: 'uw_consent', analytics: !!c.a, marketing: !!c.m });
    if (c.a || c.m) loadGTM();
  }

  var current = read();
  if (current) apply(current);

  function el(html) {
    var d = document.createElement('div');
    d.innerHTML = html.trim();
    return d.firstChild;
  }

  var bar;
  function close() { if (bar) { bar.remove(); bar = null; } }

  function decide(a, m) {
    var c = { a: a ? 1 : 0, m: m ? 1 : 0 };
    save(c);
    apply(c);
    close();
  }

  function open(showSettings) {
    close();
    var c = read() || { a: 0, m: 0 };
    bar = el(
      '<div class="cc-bar" role="dialog" aria-live="polite" aria-label="Nastavenie cookies">' +
        '<div class="cc-inner">' +
          '<p class="cc-title">Cookies 🍪</p>' +
          '<p class="cc-text">Používame nevyhnutné cookies, aby web fungoval. S tvojím súhlasom aj analytické a marketingové, aby sme vedeli, čo funguje, a mohli ti ukázať naše eventy. ' +
          '<a href="cookies.html">Viac o cookies</a></p>' +
          '<div class="cc-settings"' + (showSettings ? '' : ' hidden') + '>' +
            '<label class="cc-opt"><input type="checkbox" checked disabled> <span><strong>Nevyhnutné</strong> – vždy zapnuté</span></label>' +
            '<label class="cc-opt"><input type="checkbox" name="a"' + (c.a ? ' checked' : '') + '> <span><strong>Analytické</strong> – Google Analytics</span></label>' +
            '<label class="cc-opt"><input type="checkbox" name="m"' + (c.m ? ' checked' : '') + '> <span><strong>Marketingové</strong> – Meta Pixel, Google Ads</span></label>' +
          '</div>' +
          '<div class="cc-actions">' +
            '<button type="button" class="cc-btn cc-accept">Prijať všetko</button>' +
            '<button type="button" class="cc-btn cc-reject">Odmietnuť</button>' +
            '<button type="button" class="cc-btn cc-more">' + (showSettings ? 'Uložiť výber' : 'Nastavenia') + '</button>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
    document.body.appendChild(bar);
    var settings = bar.querySelector('.cc-settings');
    bar.querySelector('.cc-accept').onclick = function () { decide(1, 1); };
    bar.querySelector('.cc-reject').onclick = function () { decide(0, 0); };
    var more = bar.querySelector('.cc-more');
    more.onclick = function () {
      if (settings.hidden) {
        settings.hidden = false;
        more.textContent = 'Uložiť výber';
      } else {
        decide(settings.querySelector('[name=a]').checked, settings.querySelector('[name=m]').checked);
      }
    };
  }

  window.uwCookieSettings = function () { open(true); };

  document.addEventListener('DOMContentLoaded', function () {
    if (!current) open(false);
    document.querySelectorAll('[data-cookie-settings]').forEach(function (b) {
      b.addEventListener('click', function (e) { e.preventDefault(); open(true); });
    });
  });
})();
