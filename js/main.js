'use strict';

{
  // リロード時にはトップに戻す
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  /* =====================
     HTMLパーツ読み込み
     ===================== */
  function loadHTML(selector, url) {
    const target = document.querySelector(selector);
    if (!target) return Promise.resolve();

    return fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('load failed');
        return res.text();
      })
      .then((html) => {
        target.innerHTML = html;
      });
  }

  /* =====================
     初期化まとめ
     ===================== */
  function init() {
    initHamburger();     // ハンバーガー
    initSearch();        // 検索フォーム開閉
    initSwiper();        // Swiper
    initBackToTop();     // back-to-top
    initScrollEvent();   // スクロール時のヘッダー制御
    initFade();          // フェード表示
    initYear();          // 西暦表示
  }

  // header / footer を読み込んでから初期化
  Promise.all([
    loadHTML('#js-header', '/moic/parts/header.html'),
    loadHTML('#js-footer', '/moic/parts/footer.html'),
  ]).then(init);


  // スクロール判定
  function initScrollEvent() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    window.addEventListener(
      'scroll',
      () => {
        // 20px以上スクロールしたらクラスを付与
        header.classList.toggle('is-scrolled', window.scrollY > 20);
      },
      { passive: true }
    );
  }

  /* =====================
     ハンバーガーメニュー
     ===================== */
  function initHamburger() {
    const hamburger = document.querySelector('.hamburger');
    const menu = document.querySelector('.sp-global-nav');
    if (!hamburger || !menu) return;
    const menuItems = document.querySelectorAll('.sp-global-nav li');
    const menuOptions = {
      duration: 400,
      fill: 'forwards',
      easing: 'ease'
    };

    hamburger.addEventListener('click', () => {
      // ハンバーガーをクリックした時の状態を代入
      const isOpen = hamburger.classList.toggle('is-open');

      // 他の要素を連動
      menu.classList.toggle('is-open', isOpen);
      document.body.classList.toggle('is-menu-open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
      menu.setAttribute('aria-hidden', !isOpen);

      // 開いたときのリストの動き
      if (isOpen) {
        menuItems.forEach((menuItem, index) => {
          menuItem.animate(
            {
              opacity: [0, 1],
              transform: ['translateY(16px)', 'translateY(0)']
            },
            {
              duration: 400,
              delay: 150 * index,
              fill: 'forwards',
              easing: 'ease'
            }
          );
        });
      } else {
        // 閉じたときのリストの動き
        menuItems.forEach((menuItem) => {
          menuItem.animate({ opacity: [1, 0] }, menuOptions);
        });
      }
    });

    // メニューのリンクをクリックした時
    menu.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      e.preventDefault();

      // 全ての「開いている状態」を解除
      hamburger.classList.remove('is-open');
      menu.classList.remove('is-open');
      document.body.classList.remove('is-menu-open');
      hamburger.setAttribute('aria-expanded', false);
      menu.setAttribute('aria-hidden', true);

      setTimeout(() => {
        window.location.href = link.href;
      }, 500);
    });
  }

  /* =====================
     検索フォーム開閉
     ===================== */
  const initSearch = () => {
    const searchToggle = document.querySelector('.search-toggle');
    const searchContainer = document.querySelector('.sub-nav__search');
    const searchForm = document.querySelector('.search-form input');
    if (!searchToggle || !searchContainer || !searchForm) return;

    searchToggle.addEventListener('click', () => {
      const isOpen = searchContainer.classList.toggle('is-open');
      searchToggle.setAttribute('aria-expanded', isOpen);

      if (isOpen) searchForm.focus();
    });
  };

  /* =====================
     Swiper 初期化
     ===================== */
  function initSwiper() {
    const swiperEl = document.querySelector('.swiper');
    if (!swiperEl) return;

    new Swiper('.swiper', {
      loop: true,
      navigation: {
        prevEl: '.swiper-button-prev',
        nextEl: '.swiper-button-next',
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
    });
  }

  /* =====================
     back-to-top 制御
     ===================== */
  function initBackToTop() {
    const backToTop = document.querySelector('.back-to-top');
    if (!backToTop) return;

    const hero = document.querySelector('.hero');
    const header = document.querySelector('.site-header');

    // ヘッダーの高さ
    const headerHeight = header ? header.offsetHeight : 0;

    const toggle = (show) => {
      backToTop.classList.toggle('is-show', show);
    };

    /* --- トップページ --- */
    if (hero) {
      // トップページ：heroが画面外に出たら表示
      new IntersectionObserver(
        ([entry]) => toggle(!entry.isIntersecting),
        { rootMargin: `-${headerHeight}px 0px 0px 0px` }
      ).observe(hero);
    } else {

      // トップ以外のページ：スマホもPCも「スクロール量」で判定
      const showOnScroll = () => {
        // 200px以上スクロールしたら表示
        toggle(window.scrollY > 200);
      };
      window.addEventListener('scroll', showOnScroll);
      showOnScroll(); // 初期状態チェック
    }

    // クリックでトップに戻る
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  /* =====================
     フェードアップ 制御
     ===================== */
  function initFade() {
    const fadeTargets = document.querySelectorAll('.js-fade');
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target.classList.contains('js-reveal')) {
            entry.target.animate(
              { opacity: [0, 1], clipPath: ['inset(0 100% 0 0)', 'inset(0 0 0 0)'], },
              { duration: 600, delay: 300, fill: 'forwards', easing: 'ease' });
          } else {
            entry.target.animate(
              { opacity: [0, 1], translate: ['0 1rem', 0], },
              { duration: 300, fill: 'forwards', easing: 'ease' });
          }

          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -20% 0px',
      threshold: 0
    });

    fadeTargets.forEach((target) => {
      observer.observe(target);
    });
  }

  /* =====================
       コピーライト西暦
       ===================== */
  function initYear() {
    const yearEl = document.querySelector('#copyright');
    const currentYear = new Date().getFullYear();

    if (yearEl) {
      yearEl.textContent = currentYear;
    }
  }
}