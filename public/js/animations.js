import { animate, inView, stagger, spring } from "https://cdn.jsdelivr.net/npm/motion@11.11.17/+esm";


function initAnimations() {
  // Only run if the js-enabled class was added (safeguard)
  if (!document.documentElement.classList.contains('js-enabled')) return;

  // 1. Initial Page Load Animations
  // Removed from JS and moved to CSS in boilerplate.ejs for instant performance without waiting for CDN!

  // 2. Scroll-Triggered Animations (inView)

  // Footer: Fade and slide up when scrolling to the bottom
  const footer = document.querySelector('.motion-footer');
  if (footer) {
    inView(footer, (info) => {
      animate(
        info.target,
        { y: [40, 0], opacity: [0, 1] },
        { duration: 0.8, easing: "ease-out" }
      );
    });
  }

  // 3. Interactive Animations (Hover/Press) for all buttons and interactive elements
  // We apply a subtle scale down effect on mouse down to give a tactile "app-like" feel
  const interactiveElements = document.querySelectorAll('.btn, .cat-tab, .sv-cat-pill, .hotel-card-hover, button, .motion-nav-item');
  
  interactiveElements.forEach(el => {
    // Only apply press animations on non-touch devices to avoid double-firing or jank,
    // or we can apply it globally but keep it subtle.
    el.addEventListener('mousedown', () => {
      animate(el, { scale: 0.96 }, { duration: 0.1 });
    });
    el.addEventListener('mouseup', () => {
      animate(el, { scale: 1 }, { duration: 0.2, easing: spring() });
    });
    el.addEventListener('mouseleave', () => {
      // Revert if the user drags out
      animate(el, { scale: 1 }, { duration: 0.2, easing: spring() });
    });
    
    // For touch devices
    el.addEventListener('touchstart', () => {
      animate(el, { scale: 0.96 }, { duration: 0.1 });
    }, { passive: true });
    el.addEventListener('touchend', () => {
      animate(el, { scale: 1 }, { duration: 0.2, easing: spring() });
    }, { passive: true });
  });

  // 4. Mobile-only: Card scroll-in animation via IntersectionObserver
  // Only activate on phone screens to avoid unnecessary overhead on desktop
  if (window.innerWidth <= 768 && 'IntersectionObserver' in window) {
    const cardObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const card = entry.target;
          // Stagger cards that appear close together using their index
          const delay = parseFloat(card.dataset.svDelay || 0);
          setTimeout(() => {
            card.classList.add('sv-card-visible');
          }, delay);
          // Stop watching once animated — no need to re-trigger
          observer.unobserve(card);
        }
      });
    }, {
      root: null,
      rootMargin: '-5% 0px -5% 0px', // trigger when card is 5% inside viewport
      threshold: 0.1
    });

    // Assign stagger delays and observe each card
    const cards = document.querySelectorAll('.sv-scroll-card');
    cards.forEach((card, i) => {
      // Group cards into rows of 1 on mobile; stagger within each 'visual group'
      const groupIndex = i % 2; // slight stagger between pairs
      card.dataset.svDelay = groupIndex * 55; // 0ms or 55ms offset
      cardObserver.observe(card);
    });
  }
}

// Ensure it runs even if DOMContentLoaded has already fired (typical for ES Modules)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAnimations);
} else {
  initAnimations();
}
