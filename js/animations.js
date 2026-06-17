/* ============================================================
   ANIMATIONS.JS — Scroll-triggered animations & text reveals
   ============================================================ */

class AnimationEngine {
  constructor() {
    this.observers = [];
    this.countersAnimated = new Set();
    this.init();
  }

  init() {
    this.setupScrollAnimations();
    this.setupSectionTextAnimations();
    this.setupCounterAnimations();
  }

  setupScrollAnimations() {
    const elements = document.querySelectorAll('.animate-on-scroll, .animate-scale, .animate-slide-left, .animate-slide-right');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => observer.observe(el));
    this.observers.push(observer);
  }

  setupSectionTextAnimations() {
    const sectionTexts = document.querySelectorAll('.section-text-top');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        } else {
          entry.target.classList.remove('visible');
        }
      });
    }, {
      threshold: 0.3
    });

    sectionTexts.forEach(el => observer.observe(el));
    this.observers.push(observer);
  }

  setupCounterAnimations() {
    const counters = document.querySelectorAll('[data-count]');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.countersAnimated.has(entry.target)) {
          this.countersAnimated.add(entry.target);
          this.animateCounter(entry.target);
        }
      });
    }, {
      threshold: 0.5
    });

    counters.forEach(el => observer.observe(el));
    this.observers.push(observer);
  }

  animateCounter(element) {
    const target = parseInt(element.dataset.count);
    const suffix = element.dataset.suffix || '';
    const duration = 2000;
    const startTime = performance.now();

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);

      element.textContent = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = target + suffix;
      }
    };

    requestAnimationFrame(update);
  }

  // Typewriter effect for element
  typeWriter(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';

    const type = () => {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed);
      }
    };

    type();
  }

  destroy() {
    this.observers.forEach(obs => obs.disconnect());
    this.observers = [];
  }
}

window.AnimationEngine = AnimationEngine;
