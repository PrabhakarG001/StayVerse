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
}

// Ensure it runs even if DOMContentLoaded has already fired (typical for ES Modules)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAnimations);
} else {
  initAnimations();
}
