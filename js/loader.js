/* ============================================================
   LOADER.JS — Preloader with heartbeat wave + letter reveal
   ============================================================ */

class Preloader {
  constructor() {
    this.preloader = document.getElementById('preloader');
    this.irisOverlay = document.getElementById('iris-overlay');
    this.letters = document.querySelectorAll('#preloader .letter');
    this.onComplete = null;
  }

  start(callback) {
    this.onComplete = callback;

    // Phase 1: Show heartbeat wave (already animated via CSS)
    // Phase 2: Reveal letters one by one after 600ms
    setTimeout(() => {
      this.revealLetters();
    }, 600);
  }

  revealLetters() {
    this.letters.forEach((letter, index) => {
      setTimeout(() => {
        letter.classList.add('visible');
      }, index * 80);
    });

    // Phase 3: After all letters shown, start iris open
    const totalLetterTime = this.letters.length * 80 + 800;
    setTimeout(() => {
      this.openIris();
    }, totalLetterTime);
  }

  openIris() {
    // Fade out preloader
    this.preloader.classList.add('hidden');

    // Open iris overlay
    if (this.irisOverlay) {
      this.irisOverlay.classList.add('open');
    }

    // Complete after transition
    setTimeout(() => {
      if (this.irisOverlay) {
        this.irisOverlay.style.display = 'none';
      }
      if (this.onComplete) {
        this.onComplete();
      }
    }, 1200);
  }
}

window.Preloader = Preloader;
