/**
 * Model Softwares — site scripts
 * Vanilla JS, no dependencies. hero3d.js is loaded separately.
 */

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ================================================================
     SCROLL PROGRESS BAR
     ================================================================ */
  var progressBar = document.querySelector('.scroll-progress');

  function updateProgress() {
    if (!progressBar) return;
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var progress = docHeight > 0 ? scrollTop / docHeight : 0;
    progressBar.style.transform = 'scaleX(' + progress + ')';
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* ================================================================
     NAV: scroll glass + active indicator
     ================================================================ */
  var header = document.querySelector('.site-header');

  function updateNav() {
    if (!header) return;
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  /* ================================================================
     MOBILE NAVIGATION
     ================================================================ */
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('mobile-menu');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ================================================================
     SCROLL REVEAL — IntersectionObserver
     ================================================================ */
  var revealEls = document.querySelectorAll('.reveal');

  if (reduced || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

    revealEls.forEach(function (el, i) {
      // Stagger: siblings in same parent get incremental delay
      var siblings = Array.prototype.slice.call(el.parentNode.children);
      var idx = siblings.filter(function (s) { return s.classList.contains('reveal'); }).indexOf(el);
      if (idx > 0) {
        el.style.transitionDelay = Math.min(idx * 80, 400) + 'ms';
      }
      revealObserver.observe(el);
    });
  }

  /* ================================================================
     HERO ENTRANCE ANIMATIONS
     ================================================================ */
  var heroEyebrow = document.querySelector('.hero__eyebrow');
  var heroH1 = document.querySelector('.hero h1');
  var heroSub = document.querySelector('.hero__sub');
  var heroCta = document.querySelector('.hero__cta');
  var heroMeta = document.querySelector('.hero__meta');

  if (heroEyebrow) {
    // Trigger hero elements in sequence after a short delay
    function triggerHeroEl(el, delay) {
      if (!el) return;
      if (reduced) { el.classList.add('is-visible'); return; }
      setTimeout(function () { el.classList.add('is-visible'); }, delay);
    }

    triggerHeroEl(heroEyebrow, 180);
    triggerHeroEl(heroH1, 320);
    triggerHeroEl(heroSub, 460);
    triggerHeroEl(heroCta, 580);
    triggerHeroEl(heroMeta, 680);
  }

  /* ================================================================
     PROCESS: animated vertical line draw on scroll
     ================================================================ */
  var processSection = document.querySelector('.process');
  var lineFill = document.querySelector('.process__line-fill');

  if (processSection && lineFill && !reduced && 'IntersectionObserver' in window) {
    var processObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          lineFill.style.height = '100%';
          processObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    processObserver.observe(processSection);
  } else if (lineFill) {
    lineFill.style.height = '100%';
  }

  /* ================================================================
     WORK PAGE: category filtering
     ================================================================ */
  var filters = document.querySelectorAll('.filter');
  var projects = document.querySelectorAll('[data-category]');

  filters.forEach(function (button) {
    button.addEventListener('click', function () {
      var value = button.getAttribute('data-filter');

      filters.forEach(function (b) {
        b.classList.toggle('is-active', b === button);
      });

      projects.forEach(function (project) {
        var match = value === 'all' || project.getAttribute('data-category') === value;
        project.hidden = !match;
      });
    });
  });

  /* ================================================================
     WORK PAGE: project detail panel
     ================================================================ */
  var detail = document.getElementById('project-detail');
  var detailTitle = detail && detail.querySelector('[data-detail-title]');
  var detailCat = detail && detail.querySelector('[data-detail-category]');
  var detailText = detail && detail.querySelector('[data-detail-text]');
  var detailScope = detail && detail.querySelector('[data-detail-scope]');

  if (detail) {
    document.querySelectorAll('[data-open-project]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        var card = link.closest('[data-category]');
        if (!card) return;

        if (detailTitle) detailTitle.textContent = card.getAttribute('data-title') || '';
        if (detailCat) detailCat.textContent = card.getAttribute('data-cat-label') || '';
        if (detailText) detailText.textContent = card.getAttribute('data-detail') || '';

        if (detailScope) {
          detailScope.innerHTML = '';
          (card.getAttribute('data-scope') || '')
            .split('|')
            .filter(Boolean)
            .forEach(function (item) {
              var li = document.createElement('li');
              li.textContent = item.trim();
              detailScope.appendChild(li);
            });
        }

        detail.classList.remove('is-open');
        void detail.offsetWidth; // force reflow so animation re-triggers
        detail.classList.add('is-open');
        detail.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest' });
      });
    });

    var closeBtn = detail.querySelector('.project-detail__close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        detail.classList.remove('is-open');
      });
    }
  }

  /* ================================================================
     CHECKLIST REVEAL (services page)
     ================================================================ */
  var checkItems = document.querySelectorAll('.checklist li');

  if (!reduced && 'IntersectionObserver' in window && checkItems.length) {
    var checkObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          checkObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    checkItems.forEach(function (li) { checkObserver.observe(li); });
  } else {
    checkItems.forEach(function (li) { li.classList.add('is-visible'); });
  }

  /* ================================================================
     CONTACT FORM VALIDATION & SUBMISSION
     ================================================================ */
  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');

  if (form) {
    function showError(field, msg) {
      field.classList.add('has-error');
      var el = field.querySelector('.error-msg');
      if (el) el.textContent = msg;
    }

    function clearError(field) {
      field.classList.remove('has-error');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      console.log('1. Submit event triggered!'); // <--- Debug log
      var valid = true;

      if (!valid) {
        console.log('2. Validation failed on one of the fields!'); // <--- Debug log
        var first = form.querySelector('.field.has-error input, .field.has-error select, .field.has-error textarea');
        if (first) first.focus();
        return;
      }

      console.log('3. Validation passed! Sending fetch request...'); // <--- Debug log

      form.querySelectorAll('.field').forEach(function (field) {
        var input = field.querySelector('input, select, textarea');
        if (!input) return;
        clearError(field);

        var val = input.value.trim();
        var required = input.hasAttribute('required');

        if (required && !val) {
          showError(field, 'This field is required.');
          valid = false;
          return;
        }
        if (input.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val)) {
          showError(field, 'Please enter a valid email address.');
          valid = false;
          return;
        }
        if (input.type === 'tel' && val && !/^[0-9+()\s\-]{7,20}$/.test(val)) {
          showError(field, 'Please enter a valid phone number.');
          valid = false;
          return;
        }
        if (input.name === 'message' && val && val.length < 20) {
          showError(field, 'Please give us at least a couple of sentences.');
          valid = false;
        }
      });

      if (!valid) {
        var first = form.querySelector('.field.has-error input, .field.has-error select, .field.has-error textarea');
        if (first) first.focus();
        return;
      }

      // Submission UI state
      var submitBtn = form.querySelector('button[type="submit"]');
      var originalBtnText = submitBtn.textContent;
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      var formData = new FormData(form);

      fetch(form.action || 'https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })
        .then(function (res) {
          console.log('Response status code:', res.status);
          return res.json();
        })

        .then(function (data) {
          console.log('Web3Forms returned data:', data);

          if (data.success) {
            if (status) {
              status.classList.add('is-visible');
              status.textContent = 'Thank you — your enquiry has been sent. We\'ll be in touch shortly.';
              status.style.color = 'var(--electric-cyan, #00f2fe)';
            }
            form.reset();
          } else {
            if (status) {
              status.classList.add('is-visible');
              status.textContent = data.message || 'Something went wrong. Please try again.';
              status.style.color = '#ff6b6b';
            }
          }
        })
        .catch(function (err) {
          console.error('Fetch caught an error:', err);
          if (status) {
            status.classList.add('is-visible');
            status.textContent = 'Unable to send. Please email us at modelsoftwares@outlook.com';
            status.style.color = '#ff6b6b';
          }
        })
        .finally(function () {
          submitBtn.textContent = originalBtnText;
          submitBtn.disabled = false;
        });
    });

    form.addEventListener('input', function (e) {
      var field = e.target.closest('.field');
      if (field) clearError(field);
    });
  }

  /* ================================================================
     3D CARD TILT
     Tracks mouse position relative to each card, applies rotateX/Y
     and moves a shine highlight. Touch/reduced-motion safe.
     ================================================================ */
  var isTouchDevice = (navigator.maxTouchPoints > 0);

  if (!reduced && !isTouchDevice) {
    var MAX_ROTATE_X = 8;   // degrees
    var MAX_ROTATE_Y = 12;  // degrees
    var PERSPECTIVE = 900; // px

    document.querySelectorAll('.card').forEach(function (card) {
      // Inject shine element once
      var shine = document.createElement('div');
      shine.className = 'card-shine';
      card.appendChild(shine);

      function onMove(e) {
        var rect = card.getBoundingClientRect();
        // Normalised position within card: -1..+1
        var nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        var ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

        var rotateY = nx * MAX_ROTATE_Y;
        var rotateX = -ny * MAX_ROTATE_X;

        card.style.transform =
          'perspective(' + PERSPECTIVE + 'px) ' +
          'rotateX(' + rotateX + 'deg) ' +
          'rotateY(' + rotateY + 'deg) ' +
          'translateZ(10px) translateY(-5px)';

        // Shine follows cursor — convert to percentage for CSS property
        var shineX = ((e.clientX - rect.left) / rect.width * 100).toFixed(1) + '%';
        var shineY = ((e.clientY - rect.top) / rect.height * 100).toFixed(1) + '%';
        shine.style.setProperty('--shine-x', shineX);
        shine.style.setProperty('--shine-y', shineY);

        card.classList.add('is-tilting');
        card.classList.remove('tilt-return');
      }

      function onLeave() {
        card.classList.remove('is-tilting');
        card.classList.add('tilt-return');
        card.style.transform = 'perspective(' + PERSPECTIVE + 'px) rotateX(0deg) rotateY(0deg) translateZ(0px)';

        // Remove helper class after spring settles
        var t = setTimeout(function () {
          card.classList.remove('tilt-return');
          card.style.transform = '';
        }, 620);
        card._tiltTimer = t;
      }

      card.addEventListener('mousemove', onMove, { passive: true });
      card.addEventListener('mouseleave', onLeave, { passive: true });
      card.addEventListener('mouseenter', function () {
        clearTimeout(card._tiltTimer);
        card.classList.remove('tilt-return');
      });
    });
  }

  /* ================================================================
     FOOTER YEAR
     ================================================================ */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
