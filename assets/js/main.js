
(function () {
  'use strict';
  var WA = 'https://wa.me/375296263911';
  var SYM = {
    start: ['Плохо заводится', 'Просадка АКБ, окисленные клеммы, плохая масса, уставший стартер или датчик коленвала.', ['напряжение АКБ и просадка при запуске', 'состояние клемм и точек массы', 'ток потребления стартера', 'сигналы датчиков при прокрутке']],
    starter: ['Стартер не крутит', 'Втягивающее реле, щётки, замок зажигания, реле стартера или обрыв в цепи управления.', ['питание на втягивающем', 'цепь управления и реле', 'состояние АКБ под нагрузкой', 'снятие и проверка стартера']],
    power: ['Не тянет двигатель', 'Датчики (ДМРВ, лямбда, положение дросселя), давление топлива, катушки, ошибки по смеси.', ['чтение ошибок и живых данных', 'показания датчиков под нагрузкой', 'проверка проводки к датчикам', 'поиск подсоса и потерь сигнала']],
    rpm: ['Плавают обороты, посторонний звук', 'Катушки и свечи, форсунки, датчик холостого хода, натяжитель, проводка к датчикам.', ['пропуски воспроизведения по цилиндрам', 'сигналы датчиков в реальном времени', 'проверка жгута и разъёмов', 'локализация источника звука']],
    panel: ['Панель моргает как гирлянда', 'Плохая масса, окисление разъёмов, обрыв в жгуте панели, проблемы с блоком или генератором.', ['проверка массы и питания панели', 'разъёмы и шлейфы', 'напряжение при работающем двигателе', 'ошибки по CAN-шине']],
    interior: ['Не работает электрика салона', 'Предохранители, реле, блок комфорта, обрыв в двери или багажнике, окисленные контакты.', ['проверка предохранителей и реле', 'питание на потребителе', 'целостность жгута в переходах', 'проверка блока комфорта']],
    cold: ['После мороза не заводится', 'Разряд АКБ, замёрзшая влага в разъёмах, уставший стартер, сбитые параметры блока.', ['напряжение и пусковой ток АКБ', 'влажность и окисление разъёмов', 'проверка цепи запуска', 'считывание и сброс ошибок']]
  };

  /* мобильное меню */
  function initDrawer() {
    var d = document.getElementById('drawer');
    var b = document.querySelector('.header .burger');
    if (!d || !b) return;
    var last = null;
    function open() {
      last = document.activeElement;
      d.hidden = false; d.setAttribute('data-open', '');
      b.setAttribute('aria-expanded', 'true');
      document.body.classList.add('is-locked');
      var f = d.querySelector('a, button'); if (f) f.focus({ preventScroll: true });
    }
    function close() {
      d.hidden = true; d.removeAttribute('data-open');
      b.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('is-locked');
      if (last) last.focus({ preventScroll: true });
    }
    b.addEventListener('click', function () { d.hidden ? open() : close(); });
    d.addEventListener('click', function (e) {
      if (e.target.closest('[data-close]') || e.target.closest('a') || !e.target.closest('.drawer__in')) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !d.hidden) close();
      if (e.key === 'Tab' && !d.hidden) {
        var it = d.querySelectorAll('a, button, input');
        if (!it.length) return;
        var f = it[0], l = it[it.length - 1];
        if (e.shiftKey && document.activeElement === f) { e.preventDefault(); l.focus(); }
        else if (!e.shiftKey && document.activeElement === l) { e.preventDefault(); f.focus(); }
      }
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 1024 && !d.hidden) close(); });
  }

  /* симптом → что проверяем */
  function initDiag() {
    var host = document.getElementById('sym');
    if (!host) return;
    var keys = ['start', 'starter', 'power', 'rpm', 'panel', 'interior', 'cold'];
    var LAB = { start: 'Плохо заводится', starter: 'Стартер не крутит', power: 'Не тянет двигатель', rpm: 'Плавают обороты', panel: 'Панель как гирлянда', interior: 'Электрика салона', cold: 'После мороза не заводится' };
    host.innerHTML = keys.map(function (k, i) {
      return '<button class="symbtn' + (i === 0 ? ' is-on' : '') + '" type="button" data-k="' + k + '"><span class="n">0' + (i + 1) + '</span><span>' + LAB[k] + '</span></button>';
    }).join('');
    var out = {
      k: document.getElementById('dK'), t: document.getElementById('dT'),
      w: document.getElementById('dW'), l: document.getElementById('dL'), s: document.getElementById('dSend')
    };
    function show(k) {
      var d = SYM[k];
      out.k.textContent = 'СИМПТОМ · ' + LAB[k].toUpperCase();
      out.t.textContent = d[0];
      out.w.innerHTML = '<b>Вероятно:</b> ' + d[1];
      out.l.innerHTML = d[2].map(function (x) { return '<li>' + x + '</li>'; }).join('');
      out.s.href = WA + '?text=' + encodeURIComponent('Вызов автоэлектрика с сайта.\nСимптом: ' + d[0] + '\nЧто проверить: ' + d[2].join(', ') + '\n\nАвто: ');
      [].forEach.call(host.children, function (c) { c.classList.toggle('is-on', c.getAttribute('data-k') === k); });
    }
    host.addEventListener('click', function (e) {
      var b = e.target.closest('.symbtn'); if (!b) return;
      show(b.getAttribute('data-k'));
    });
    show('start');
  }

  /* часы и полоса смены */
  function initClock() {
    var bars = document.getElementById('bars');
    if (!bars) return;
    var html = '';
    for (var i = 0; i < 24; i++) html += '<i class="on" data-h="' + i + '"></i>';
    bars.innerHTML = html;
    var tEl = document.getElementById('clockT'), sEl = document.getElementById('clockS'), hEl = document.getElementById('heroT');
    function tick() {
      var now = new Date();
      var t;
      try { t = now.toLocaleTimeString('ru-RU', { timeZone: 'Europe/Minsk', hour12: false }); }
      catch (e) { t = now.toLocaleTimeString('ru-RU', { hour12: false }); }
      var h = parseInt(t.slice(0, 2), 10);
      if (tEl) tEl.textContent = t;
      if (hEl) hEl.textContent = t.slice(0, 5);
      if (sEl) sEl.textContent = 'МИНСК · ' + (h >= 23 || h < 6 ? 'НОЧНАЯ СМЕНА' : h < 12 ? 'УТРЕННЯЯ СМЕНА' : h < 18 ? 'ДНЕВНАЯ СМЕНА' : 'ВЕЧЕРНЯЯ СМЕНА');
      [].forEach.call(bars.children, function (b) { b.classList.toggle('now', +b.getAttribute('data-h') === h); });
    }
    tick(); setInterval(tick, 1000);
  }

  /* поиск по маркам */
  function initBrands() {
    var q = document.getElementById('bq');
    var list = document.getElementById('blist');
    if (!q || !list) return;
    var items = [].slice.call(list.children);
    var cnt = document.getElementById('bCnt'), empty = document.getElementById('bEmpty');
    function filter() {
      var v = q.value.trim().toLowerCase();
      var shown = 0;
      items.forEach(function (it) {
        var ok = !v || it.getAttribute('data-b').indexOf(v) > -1;
        it.hidden = !ok;
        if (ok) shown++;
      });
      if (cnt) cnt.textContent = 'показано ' + shown + ' из ' + items.length;
      if (empty) empty.hidden = shown > 0;
    }
    q.addEventListener('input', filter);
    filter();
  }

  /* форма */
  function initLead() {
    var f = document.getElementById('lead');
    if (!f) return;
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var n = document.getElementById('lName'), t = document.getElementById('lTel'), c = document.getElementById('lCar'), k = document.getElementById('lTask');
      var bad = false;
      [n, t].forEach(function (el) { if (!el.value.trim()) { el.style.borderColor = '#FFB020'; bad = true; } else { el.style.borderColor = ''; } });
      if (bad) return;
      var msg = 'Вызов автоэлектрика с сайта.\nИмя: ' + n.value.trim() + '\nТелефон: ' + t.value.trim() +
        (c.value.trim() ? '\nАвто: ' + c.value.trim() : '') + (k.value.trim() ? '\nСимптом: ' + k.value.trim() : '');
      window.open(WA + '?text=' + encodeURIComponent(msg), '_blank');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initDrawer(); initDiag(); initClock(); initBrands(); initLead();
    var y = document.getElementById('yr'); if (y) y.textContent = new Date().getFullYear();
  });
})();
