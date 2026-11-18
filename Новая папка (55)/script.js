'use strict';

/* ================= CONFIG =================
   Telegram: НЕ храните токен бота в браузере.
   Создайте свой сервер (Node/PHP/Cloudflare Worker), который принимает POST JSON
   и сам отправляет сообщение в Telegram Bot API. Укажите его адрес ниже.
   Пока адрес пустой — заказ только подтверждается на экране. */
const CONFIG = {
  ORDER_ENDPOINT: '',        // например: 'https://your-server.uz/api/order'
  DELIVERY_FEE: 10000,
  FREE_DELIVERY_FROM: 100000,
  PROMOS: { FIRST20: 0.2 }
};

/* ================= DATA ================= */
const U = id => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&q=75`;
const PHOTOS = {
  burger: ['1568901346375-23c9450c58cd', '1550547660-d9450f859349'],
  shawarma: ['1626700051175-6818013e1d4f', '1529006557810-274b9b2fc783'],
  pizza: ['1513104890138-7c749659a591', '1628840042765-356cda07504e'],
  snack: ['1573080496219-bb080dd4f877', '1567620832903-9fc6debc209f'],
  drink: ['1622483767028-3f66f32aef97', '1572490122747-3968b75cc699']
};
const CATS = { all: 'Все', burger: 'Бургеры', shawarma: 'Шаурма', pizza: 'Пицца', snack: 'Закуски', drink: 'Напитки' };

const MENU = [
  { id: 1, cat: 'burger', name: 'Classic Burger', price: 35000, emoji: '🍔', desc: 'Сочная говяжья котлета, салат, томат, фирменный соус.' },
  { id: 2, cat: 'burger', name: 'Double Cheeseburger', price: 45000, emoji: '🍔', desc: 'Две котлеты, двойной чеддер, маринованные огурчики.', tag: 'Хит' },
  { id: 3, cat: 'burger', name: 'Chicken Burger', price: 32000, emoji: '🍔', desc: 'Хрустящее куриное филе, салат и сливочный соус.' },
  { id: 4, cat: 'burger', name: 'BBQ Burger', price: 42000, emoji: '🍔', desc: 'Говядина, соус барбекю, карамелизированный лук, бекон.' },
  { id: 5, cat: 'burger', name: 'Spicy Burger', price: 40000, emoji: '🌶️', desc: 'Острая котлета, халапеньо, острый соус и сыр.', tag: 'Острое' },
  { id: 6, cat: 'shawarma', name: 'Классическая шаурма', price: 28000, emoji: '🌯', desc: 'Курица, свежие овощи, чесночный соус в лаваше.' },
  { id: 7, cat: 'shawarma', name: 'Сырная шаурма', price: 33000, emoji: '🌯', desc: 'Курица, плавленый сыр, овощи и соус.', tag: 'Хит' },
  { id: 8, cat: 'shawarma', name: 'Острый ролл', price: 30000, emoji: '🌯', desc: 'Мясо, острый соус, огурцы и капуста.', tag: 'Острое' },
  { id: 9, cat: 'shawarma', name: 'Chicken Roll', price: 32000, emoji: '🌯', desc: 'Нежная курица, сыр и свежий салат.' },
  { id: 10, cat: 'pizza', name: 'Pepperoni', price: 55000, emoji: '🍕', desc: 'Пепперони, моцарелла и томатный соус.', tag: 'Хит' },
  { id: 11, cat: 'pizza', name: 'Cheese Pizza', price: 48000, emoji: '🍕', desc: 'Четыре вида сыра на тонком тесте.' },
  { id: 12, cat: 'pizza', name: 'Chicken Pizza', price: 52000, emoji: '🍕', desc: 'Курица, грибы, моцарелла и соус.' },
  { id: 13, cat: 'snack', name: 'Картофель фри', price: 15000, emoji: '🍟', desc: 'Золотистый хрустящий картофель.' },
  { id: 14, cat: 'snack', name: 'Наггетсы', price: 22000, emoji: '🍗', desc: '9 нежных куриных наггетсов с соусом.' },
  { id: 15, cat: 'snack', name: 'Сырные палочки', price: 25000, emoji: '🧀', desc: 'Тянущийся сыр в хрустящей панировке.' },
  { id: 16, cat: 'snack', name: 'Куриные крылышки', price: 30000, emoji: '🍗', desc: 'Сочные крылья в пикантной глазури.' },
  { id: 17, cat: 'drink', name: 'Coca-Cola', price: 10000, emoji: '🥤', desc: 'Холодная, 0.5 л.' },
  { id: 18, cat: 'drink', name: 'Fanta', price: 10000, emoji: '🥤', desc: 'Апельсиновая, 0.5 л.' },
  { id: 19, cat: 'drink', name: 'Sprite', price: 10000, emoji: '🥤', desc: 'Лимон-лайм, 0.5 л.' },
  { id: 20, cat: 'drink', name: 'Молочный коктейль', price: 20000, emoji: '🥛', desc: 'Густой коктейль со сливками.' }
];
// Фото по категории; чередуем два варианта
MENU.forEach((m, i) => { m.img = U(PHOTOS[m.cat][i % 2]); });

const COMBOS = [
  { name: 'Combo Classic', em: '🍔🍟🥤', items: ['Classic Burger', 'Картофель фри', 'Coca-Cola'], ids: [1, 13, 17], old: 60000, price: 52000 },
  { name: 'Combo Shawarma', em: '🌯🍗🥤', items: ['Сырная шаурма', 'Наггетсы', 'Fanta'], ids: [7, 14, 18], old: 65000, price: 56000 },
  { name: 'Family Pizza', em: '🍕🍗🥤', items: ['Pepperoni', 'Куриные крылышки', '2 × Sprite'], ids: [10, 16, 19, 19], old: 105000, price: 92000 }
];

/* ================= HELPERS ================= */
const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];
const money = n => n.toLocaleString('ru-RU').replace(/\u00a0/g, ' ') + ' сум';
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const safe = (k, fb) => { try { return JSON.parse(localStorage.getItem(k)) ?? fb; } catch { return fb; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } };

/* Показ всплывающего уведомления */
let toastTimer;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}
/* Если фото не загрузилось — показываем эмодзи */
function imgFallback(img, emoji) {
  img.addEventListener('error', () => {
    const s = document.createElement('span'); s.className = 'emoji'; s.textContent = emoji; img.replaceWith(s);
  }, { once: true });
}

/* ================= THEME ================= */
const themeBtn = $('#themeBtn');
function setTheme(t) {
  document.documentElement.dataset.theme = t;
  themeBtn.textContent = t === 'dark' ? '☀️' : '🌙';
  save('bc_theme', t);
}
setTheme(safe('bc_theme', matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
themeBtn.addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));

/* ================= PRELOADER ================= */
window.addEventListener('load', () => setTimeout(() => $('#preloader').classList.add('done'), reduceMotion ? 0 : 1200));

/* ================= MENU: render, filter, search ================= */
let activeCat = 'all';
const grid = $('#menuGrid');

function renderFilters() {
  $('#filters').innerHTML = Object.entries(CATS).map(([k, v]) =>
    `<button class="chip ${k === activeCat ? 'active' : ''}" data-cat="${k}">${v}</button>`).join('');
}
function renderMenu() {
  const q = $('#search').value.trim().toLowerCase();
  const list = MENU.filter(m => (activeCat === 'all' || m.cat === activeCat) &&
    (!q || (m.name + ' ' + m.desc).toLowerCase().includes(q)));
  grid.innerHTML = list.map((m, i) => `
    <article class="card tilt" style="animation-delay:${i * 40}ms">
      <div class="card-img">
        <img src="${m.img}" alt="${m.name}" loading="lazy" data-emoji="${m.emoji}">
        ${m.tag ? `<span class="tag">${m.tag}</span>` : ''}
      </div>
      <div class="card-body">
        <h3>${m.name}</h3><p>${m.desc}</p>
        <div class="card-foot"><span class="price">${money(m.price)}</span>
        <button class="add" data-add="${m.id}">В корзину</button></div>
      </div>
    </article>`).join('');
  $$('img[data-emoji]', grid).forEach(img => imgFallback(img, img.dataset.emoji));
  $('#emptyMsg').hidden = list.length > 0;
}
$('#filters').addEventListener('click', e => {
  const b = e.target.closest('[data-cat]'); if (!b) return;
  activeCat = b.dataset.cat; renderFilters(); renderMenu();
});
$('#search').addEventListener('input', renderMenu);

/* 3D Tilt для карточек (делегирование событий) */
if (!reduceMotion && matchMedia('(hover:hover)').matches) {
  grid.addEventListener('mousemove', e => {
    const c = e.target.closest('.tilt'); if (!c) return;
    const r = c.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    c.style.transform = `perspective(800px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateY(-6px)`;
  });
  grid.addEventListener('mouseout', e => {
    const c = e.target.closest('.tilt'); if (c && !c.contains(e.relatedTarget)) c.style.transform = '';
  });
}

/* ================= CART ================= */
let cart = safe('bc_cart', []);       // [{id, qty}]
let promo = safe('bc_promo', null);   // 'FIRST20' | null
const byId = id => MENU.find(m => m.id === id);

const subtotal = () => cart.reduce((s, c) => s + byId(c.id).price * c.qty, 0);
const discount = () => Math.round(subtotal() * (CONFIG.PROMOS[promo] || 0));
const cartTotal = () => subtotal() - discount();
const persist = () => { save('bc_cart', cart); save('bc_promo', promo); };

function addToCart(id, qty = 1) {
  const it = cart.find(c => c.id === id);
  it ? it.qty += qty : cart.push({ id, qty });
  persist(); renderCart();
  const b = $('#cartBtn'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
}
function changeQty(id, d) {
  const it = cart.find(c => c.id === id); if (!it) return;
  it.qty += d; if (it.qty <= 0) cart = cart.filter(c => c.id !== id);
  persist(); renderCart();
}
function removeItem(id) { cart = cart.filter(c => c.id !== id); persist(); renderCart(); }
function clearCart() { cart = []; promo = null; persist(); renderCart(); }

function renderCart() {
  const count = cart.reduce((s, c) => s + c.qty, 0);
  $('#cartCount').textContent = count;
  const box = $('#cartItems');
  if (!cart.length) {
    box.innerHTML = `<div class="cart-empty"><span>🛒</span>Корзина пуста.<br>Добавьте что-нибудь вкусное!</div>`;
  } else {
    box.innerHTML = cart.map(c => { const m = byId(c.id); return `
      <div class="ci">
        <div class="ci-img"><img src="${m.img}" alt="${m.name}" data-emoji="${m.emoji}"></div>
        <div><h4>${m.name}</h4><small>${money(m.price * c.qty)}</small>
          <div class="qty"><button data-dec="${c.id}" aria-label="Меньше">−</button><b>${c.qty}</b><button data-inc="${c.id}" aria-label="Больше">+</button></div></div>
        <button class="rm" data-rm="${c.id}" aria-label="Удалить ${m.name}">🗑</button>
      </div>`; }).join('') +
      (discount() ? `<p class="ci" style="grid-template-columns:1fr auto"><span>Скидка (${promo})</span><b>−${money(discount())}</b></p>` : '');
    $$('img[data-emoji]', box).forEach(img => imgFallback(img, img.dataset.emoji));
  }
  $('#cartTotal').textContent = money(cartTotal());
  $('#checkoutBtn').disabled = !cart.length;
  $('#clearBtn').disabled = !cart.length;
}

/* Кнопки добавления (меню) с анимацией */
document.addEventListener('click', e => {
  const add = e.target.closest('[data-add]');
  if (add) {
    addToCart(+add.dataset.add);
    add.classList.add('ok'); add.textContent = '✓ Добавлено';
    setTimeout(() => { add.classList.remove('ok'); add.textContent = 'В корзину'; }, 1100);
    return;
  }
  const combo = e.target.closest('[data-combo]');
  if (combo) { COMBOS[+combo.dataset.combo].ids.forEach(id => addToCart(id)); toast('Комбо добавлено в корзину'); return; }
  const p = e.target.closest('[data-promo]');
  if (p) { promo = p.dataset.promo; persist(); renderCart(); toast(`Промокод ${promo} применён: −20%`); }
});
$('#cartItems').addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t) return;
  if (t.dataset.inc) changeQty(+t.dataset.inc, 1);
  if (t.dataset.dec) changeQty(+t.dataset.dec, -1);
  if (t.dataset.rm) removeItem(+t.dataset.rm);
});
$('#clearBtn').addEventListener('click', () => { clearCart(); toast('Корзина очищена'); });

/* Боковая панель корзины */
const drawer = $('#drawer'), overlay = $('#overlay');
function openCart() { drawer.classList.add('open'); overlay.classList.add('show'); drawer.setAttribute('aria-hidden', 'false'); document.body.classList.add('lock'); }
function closeCart() { drawer.classList.remove('open'); overlay.classList.remove('show'); drawer.setAttribute('aria-hidden', 'true'); document.body.classList.remove('lock'); }
$('#cartBtn').addEventListener('click', openCart);
$('#closeCart').addEventListener('click', closeCart);
overlay.addEventListener('click', closeCart);

/* ================= CHECKOUT ================= */
const modal = $('#modal'), form = $('#orderForm');
const orderType = () => form.type.value;
const deliveryFee = () => orderType() === 'Доставка' && cartTotal() < CONFIG.FREE_DELIVERY_FROM ? CONFIG.DELIVERY_FEE : 0;

function updateModalTotal() {
  const isDel = orderType() === 'Доставка';
  $('#addrRow').hidden = !isDel;
  $('#modalTotal').textContent = money(cartTotal() + deliveryFee());
}
function openModal() {
  if (!cart.length) return toast('Добавьте блюда в корзину');
  closeCart(); form.hidden = false; $('#success').hidden = true; $('#formErr').textContent = '';
  updateModalTotal(); modal.classList.add('show'); modal.setAttribute('aria-hidden', 'false'); document.body.classList.add('lock');
  setTimeout(() => form.name.focus(), 300);
}
function closeModal() { modal.classList.remove('show'); modal.setAttribute('aria-hidden', 'true'); document.body.classList.remove('lock'); }
$('#checkoutBtn').addEventListener('click', openModal);
$('#closeModal').addEventListener('click', closeModal);
$('#doneBtn').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
form.addEventListener('change', updateModalTotal);

/* Отправка заказа */
form.addEventListener('submit', async e => {
  e.preventDefault();
  const f = new FormData(form), err = $('#formErr');
  const name = f.get('name').trim(), phone = f.get('phone').trim(), addr = (f.get('address') || '').trim();
  $$('input', form).forEach(i => i.classList.remove('invalid'));
  const phoneOk = phone.replace(/\D/g, '').length >= 9;
  if (!name) { form.name.classList.add('invalid'); return err.textContent = 'Введите имя.'; }
  if (!phoneOk) { form.phone.classList.add('invalid'); return err.textContent = 'Введите корректный номер телефона.'; }
  if (orderType() === 'Доставка' && !addr) { form.address.classList.add('invalid'); return err.textContent = 'Укажите адрес доставки.'; }
  err.textContent = '';

  const order = {
    name, phone, type: orderType(), address: addr, comment: (f.get('comment') || '').trim(),
    items: cart.map(c => ({ name: byId(c.id).name, qty: c.qty, price: byId(c.id).price })),
    discount: discount(), delivery: deliveryFee(), total: cartTotal() + deliveryFee(), createdAt: new Date().toISOString()
  };
  const btn = $('#submitBtn'); btn.disabled = true; btn.textContent = 'Отправляем…';
  let sent = true;
  if (CONFIG.ORDER_ENDPOINT) {
    try {
      const r = await fetch(CONFIG.ORDER_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(order) });
      sent = r.ok;
    } catch { sent = false; }
  }
  btn.disabled = false; btn.textContent = 'Подтвердить заказ';
  if (!sent) return err.textContent = 'Не удалось отправить заказ. Попробуйте ещё раз или позвоните нам.';

  $('#successMsg').textContent = `${name}, ваш заказ на ${money(order.total)} принят. ` +
    (order.type === 'Доставка' ? 'Привезём за 20 минут.' : 'Будет готов через 15 минут.');
  form.hidden = true; $('#success').hidden = false;
  clearCart(); form.reset();
});

/* ================= COMBOS & GALLERY ================= */
$('#comboGrid').innerHTML = COMBOS.map((c, i) => `
  <article class="combo reveal">
    <div class="em">${c.em}</div><h3>${c.name}</h3>
    <ul>${c.items.map(x => `<li>${x}</li>`).join('')}</ul>
    <p><span class="old">${money(c.old)}</span><span class="price">${money(c.price)}</span></p>
    <button class="btn btn-primary full" data-combo="${i}">Добавить комбо</button>
  </article>`).join('');
$('#gallery-grid').innerHTML = [0, 2, 5, 9, 12, 13, 15, 19].map(i => {
  const m = MENU[i];
  return `<div class="reveal"><img src="${m.img}" alt="${m.name}" loading="lazy" data-emoji="${m.emoji}"></div>`;
}).join('');
$$('#gallery-grid img').forEach(img => imgFallback(img, img.dataset.emoji));

/* ================= NAVIGATION ================= */
const burger = $('#burgerBtn'), nav = $('#nav');
function toggleNav(open) {
  nav.classList.toggle('open', open); burger.classList.toggle('open', open);
  document.body.classList.toggle('lock', open);
}
burger.addEventListener('click', () => toggleNav(!nav.classList.contains('open')));
$$('a', nav).forEach(a => a.addEventListener('click', () => toggleNav(false)));
$$('[data-order]').forEach(b => b.addEventListener('click', () => { /* «Заказать сейчас» ведёт к меню */ }));
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeCart(); closeModal(); toggleNav(false); } });

/* Header + Parallax + активный пункт меню */
const header = $('#header'), heroImg = $('.hero-img'), floats = $$('.float');
const sections = $$('main section[id]'), links = $$('a', nav);
let ticking = false;
function onScroll() {
  const y = scrollY;
  header.classList.toggle('scrolled', y > 40);
  if (!reduceMotion && y < innerHeight) {
    heroImg.style.transform = `translateY(${y * .08}px)`;
    floats.forEach((f, i) => f.style.translate = `0 ${y * (.05 + i * .03)}px`);
  }
  const cur = sections.filter(s => s.offsetTop - 120 <= y).pop();
  links.forEach(a => a.classList.toggle('active', cur && a.getAttribute('href') === '#' + cur.id));
  ticking = false;
}
addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });

/* ================= SCROLL REVEAL + COUNTERS ================= */
function countUp(el) {
  const target = parseFloat(el.dataset.count), dec = +el.dataset.dec || 0, dur = 1600, t0 = performance.now();
  const fmt = v => dec ? v.toFixed(dec) : Math.round(v).toLocaleString('ru-RU') + (target >= 1000 ? '+' : '');
  if (reduceMotion) return el.textContent = fmt(target);
  (function tick(t) {
    const p = Math.min((t - t0) / dur, 1);
    el.textContent = fmt(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}
const io = new IntersectionObserver(entries => entries.forEach(en => {
  if (!en.isIntersecting) return;
  en.target.classList.add('in');
  $$('[data-count]', en.target).forEach(countUp);
  io.unobserve(en.target);
}), { threshold: .15 });
$$('.reveal').forEach(el => io.observe(el));

/* ================= INIT ================= */
$('#year').textContent = new Date().getFullYear();
renderFilters(); renderMenu(); renderCart(); onScroll();
