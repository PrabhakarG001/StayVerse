(() => {
  'use strict';

  // Bootstrap custom form validation
  document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('.needs-validation');

    Array.from(forms).forEach(form => {
      form.addEventListener('submit', event => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add('was-validated');
      }, false);
    });

    // Tax Switch Toggler Logic
    const taxToggle = document.getElementById('taxToggle');
    if (taxToggle) {
      taxToggle.addEventListener('change', () => {
        const taxInfoElements = document.querySelectorAll('.tax-info');
        taxInfoElements.forEach(el => {
          if (taxToggle.checked) {
            el.classList.remove('d-none');
          } else {
            el.classList.add('d-none');
          }
        });
      });
    }

    // Wishlist Heart Icon Toggle Interaction
    const hearts = document.querySelectorAll('.heart-icon');
    hearts.forEach(heart => {
      heart.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (heart.classList.contains('fa-regular')) {
          heart.classList.remove('fa-regular', 'text-white');
          heart.classList.add('fa-solid', 'text-danger');
          heart.style.transform = 'scale(1.3)';
          setTimeout(() => {
            heart.style.transform = '';
          }, 150);
        } else {
          heart.classList.remove('fa-solid', 'text-danger');
          heart.classList.add('fa-regular', 'text-white');
        }
      });
    });
    // --- Dynamic Destination Filtering ---
    const validDestinationFilters = new Set(['all', 'india', 'foreign']);
    const getFilterLinks = () => Array.from(document.querySelectorAll('.cat-tab, .scroll-filter-link'));
    const normalizeDestinationFilter = (filter) => {
      const normalizedFilter = String(filter || 'all').toLowerCase();
      const aliasFilter = normalizedFilter === 'foriegn' ? 'foreign' : normalizedFilter;
      return validDestinationFilters.has(aliasFilter) ? aliasFilter : 'all';
    };
    const getDestinationFilter = (link) => {
      try {
        const url = new URL(link.getAttribute('href'), window.location.origin);
        return normalizeDestinationFilter(url.searchParams.get('filter'));
      } catch (err) {
        return 'all';
      }
    };
    
    // Add active styling for scroll-filter-links dynamically if missing
    if (!document.getElementById('dynamic-filter-styles')) {
      const style = document.createElement('style');
      style.id = 'dynamic-filter-styles';
      style.innerHTML = `
        .sv-scroll-pill .scroll-filter-link.active { background: #EBEBEB; }
        @keyframes fadeInSlider { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `;
      document.head.appendChild(style);
    }

    const applyDestinationFilter = (filter, options = {}) => {
      const sliders = Array.from(document.querySelectorAll('.group-slider'));
      if (!sliders.length) return false;

      const nextFilter = normalizeDestinationFilter(filter);
      const shouldAnimate = options.animate !== false;

      getFilterLinks().forEach(link => {
        const isActive = getDestinationFilter(link) === nextFilter;
        link.classList.toggle('active', isActive);
        if (isActive) {
          link.setAttribute('aria-current', 'page');
        } else {
          link.removeAttribute('aria-current');
        }
      });

      sliders.forEach(slider => {
        const region = slider.getAttribute('data-region');
        const shouldShow = nextFilter === 'all' || region === nextFilter;
        slider.classList.toggle('d-none', !shouldShow);

        if (shouldShow && shouldAnimate) {
          slider.style.animation = 'none';
          slider.offsetHeight; /* trigger reflow */
          slider.style.animation = 'fadeInSlider 0.4s ease forwards';
        }
      });

      if (options.updateUrl !== false) {
        const nextUrl = new URL(window.location.href);
        nextUrl.pathname = '/listings';
        nextUrl.searchParams.set('filter', nextFilter);
        const nextPath = nextUrl.pathname + nextUrl.search;
        if (nextPath !== window.location.pathname + window.location.search) {
          window.history.pushState({ filter: nextFilter }, '', nextPath);
        }
      }

      if (typeof window.prioritizeFilterQueue === 'function') {
        window.prioritizeFilterQueue(nextFilter);
      }

      return true;
    };

    window.applyDestinationFilter = applyDestinationFilter;

    if (getFilterLinks().length > 0) {
      const initialUrl = new URL(window.location.href);
      const activeFilterLink = getFilterLinks().find(link => link.classList.contains('active'));
      const initialFilter = initialUrl.searchParams.has('filter')
        ? normalizeDestinationFilter(initialUrl.searchParams.get('filter'))
        : (activeFilterLink ? getDestinationFilter(activeFilterLink) : 'all');
      applyDestinationFilter(initialFilter, { animate: false, updateUrl: false });

      document.addEventListener('click', (e) => {
        const link = e.target.closest('.cat-tab, .scroll-filter-link');
        if (!link) return;

        const filter = getDestinationFilter(link);
        const applied = applyDestinationFilter(filter);
        if (applied) {
          e.preventDefault();
        }
      });

      window.addEventListener('popstate', () => {
        const url = new URL(window.location.href);
        applyDestinationFilter(normalizeDestinationFilter(url.searchParams.get('filter')), {
          animate: false,
          updateUrl: false
        });
      });
    }
  });
})();
