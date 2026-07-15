/* ============================================================
   StayVerse — Search & Filter Script (Vanilla JS)
   ============================================================ */

// Lazy load city hotel sliders via server-rendered EJS partials
async function loadCityHotels(city, containerId) {
  try {
    const response = await fetch(`/api/hotels/render-slider?city=${encodeURIComponent(city)}`);
    if (response.ok) {
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = await response.text();
        // Sync prices currency symbol
        const savedCurr = localStorage.getItem('sv_currency');
        if (savedCurr && typeof applyCurrency === 'function') {
          applyCurrency(savedCurr);
        }
      }
    }
  } catch (err) {
    console.error(`Error loading city ${city}:`, err);
  }
}

// Perform dynamic search results rendering
async function performSearch(query, category = '') {
  const loader = document.getElementById('searchLoader');
  const resultsContainer = document.getElementById('resultsContainer');
  const emptyState = document.getElementById('emptyState');
  if (!loader || !resultsContainer || !emptyState) return;

  resultsContainer.innerHTML = '';
  emptyState.classList.add('d-none');
  loader.style.display = 'block';

  try {
    const response = await fetch(`/api/hotels/render-search?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`);
    if (!response.ok) throw new Error("Search request failed");
    
    const html = await response.text();
    loader.style.display = 'none';
    if (html.trim() === '') {
      emptyState.classList.remove('d-none');
    } else {
      resultsContainer.innerHTML = html;
      
      // Update wishlist heart highlights on results cards
      if (typeof getWishlists === 'function') {
        const wishlists = getWishlists();
        const wishlistIds = new Set(wishlists.map(h => h.propertyId.toString()));
        document.querySelectorAll('.heart-wishlist-icon').forEach(icon => {
          const propertyId = icon.getAttribute('data-id');
          if (propertyId && wishlistIds.has(propertyId.toString())) {
            icon.classList.replace('fa-regular', 'fa-solid');
            icon.classList.remove('text-white');
            icon.classList.add('text-danger');
          }
        });
      }
      
      // Sync currency prices
      const savedCurr = localStorage.getItem('sv_currency');
      if (savedCurr && typeof applyCurrency === 'function') {
        applyCurrency(savedCurr);
      }
    }
  } catch (error) {
    console.error("Search fetch error:", error);
    loader.style.display = 'none';
    emptyState.classList.remove('d-none');
  }
}

// Destination filter pills (All, India, Foreign) on the homepage
document.addEventListener("DOMContentLoaded", () => {
  const filterLinks = document.querySelectorAll('.cat-tab, .scroll-filter-link');
  if (!filterLinks.length) return;

  const validFilters = new Set(['all', 'india', 'foreign']);
  const getDestinationFilter = (link) => {
    try {
      const url = new URL(link.getAttribute('href'), window.location.origin);
      const f = String(url.searchParams.get('filter') || 'all').toLowerCase();
      return f === 'foriegn' ? 'foreign' : (validFilters.has(f) ? f : 'all');
    } catch {
      return 'all';
    }
  };

  const applyDestinationFilter = (filter, options = {}) => {
    const nextFilter = validFilters.has(filter) ? filter : 'all';
    
    // Toggle class active
    filterLinks.forEach(link => {
      const isActive = getDestinationFilter(link) === nextFilter;
      link.classList.toggle('active', isActive);
    });

    // Toggle slider visibilities
    document.querySelectorAll('.group-slider').forEach(slider => {
      const region = slider.getAttribute('data-region');
      const shouldShow = nextFilter === 'all' || region === nextFilter;
      slider.classList.toggle('d-none', !shouldShow);
    });

    // Update URL query parameter
    if (options.updateUrl !== false) {
      const nextUrl = new URL(window.location.href);
      nextUrl.pathname = '/listings';
      nextUrl.searchParams.set('filter', nextFilter);
      window.history.pushState({ filter: nextFilter }, '', nextUrl.pathname + nextUrl.search);
    }
  };

  // Initial load alignment
  const initialUrl = new URL(window.location.href);
  const filterParam = initialUrl.searchParams.get('filter');
  if (filterParam) {
    applyDestinationFilter(filterParam.toLowerCase(), { updateUrl: false });
  }

  // Handle click on tabs
  document.addEventListener('click', (e) => {
    const link = e.target.closest('.cat-tab, .scroll-filter-link');
    if (link) {
      e.preventDefault();
      applyDestinationFilter(getDestinationFilter(link));
    }
  });

  window.addEventListener('popstate', () => {
    const url = new URL(window.location.href);
    applyDestinationFilter(url.searchParams.get('filter') || 'all', { updateUrl: false });
  });
});

// Initialize listings landing page sliders lazy loading queue
function initListingsIndex(config) {
  const activeFilter = config.activeFilter || 'all';
  const foreignCities = config.foreignCities || [];
  const indianCities = config.indianCities || [];

  let prioritizedCities = [];
  if (activeFilter === 'india') {
    prioritizedCities = [...indianCities, ...foreignCities];
  } else if (activeFilter === 'foreign') {
    prioritizedCities = [...foreignCities, ...indianCities];
  } else {
    prioritizedCities = [...indianCities, ...foreignCities];
  }

  const loadedCities = new Set();
  const loadSequential = async () => {
    for (const item of prioritizedCities) {
      if (!loadedCities.has(item.city)) {
        loadedCities.add(item.city);
        await loadCityHotels(item.city, item.id);
      }
    }
  };
  
  loadSequential();

  window.prioritizeFilterQueue = function(filterName) {
    const isIndia = (filterName === 'india');
    const isForeign = (filterName === 'foreign');
    prioritizedCities.sort((a, b) => {
      const aIsLoaded = loadedCities.has(a.city);
      const bIsLoaded = loadedCities.has(b.city);
      if (aIsLoaded && !bIsLoaded) return 1;
      if (!aIsLoaded && bIsLoaded) return -1;
      
      const aInIndia = indianCities.some(c => c.city === a.city);
      const bInIndia = indianCities.some(c => c.city === b.city);
      if (isIndia) {
        if (aInIndia && !bInIndia) return -1;
        if (!aInIndia && bInIndia) return 1;
      } else if (isForeign) {
        if (!aInIndia && bInIndia) return -1;
        if (aInIndia && !bInIndia) return 1;
      }
      return 0;
    });
  };
}

// StayAPI Modal Logic
let metaModalInstance = null;
window.openMetaModal = async (hotelName, location, fallbackAgodaUrl) => {
  if (!metaModalInstance) {
    metaModalInstance = new bootstrap.Modal(document.getElementById('metaBookingModal'));
  }
  
  document.getElementById('metaModalTitle').textContent = hotelName;
  document.getElementById('metaModalLocation').textContent = location;
  
  document.getElementById('metaModalLoader').classList.remove('d-none');
  document.getElementById('metaModalLinks').classList.add('d-none');
  document.getElementById('metaModalError').classList.add('d-none');
  
  metaModalInstance.show();

  try {
    const response = await fetch(`/api/hotels/meta?hotel_name=${encodeURIComponent(hotelName)}&location=${encodeURIComponent(location)}`);
    const data = await response.json();
    
    document.getElementById('metaModalLoader').classList.add('d-none');
    
    if (data.success && data.links) {
      document.getElementById('metaModalAgodaLink').href = fallbackAgodaUrl;
      document.getElementById('metaModalBookingLink').href = data.links.booking_com || '#';
      document.getElementById('metaModalExpediaLink').href = data.links.expedia || '#';
      document.getElementById('metaModalHotelsLink').href = data.links.hotels_com || '#';
      
      document.getElementById('metaModalLinks').classList.remove('d-none');
    } else {
      throw new Error("No links found");
    }
  } catch (err) {
    console.error("StayAPI Error:", err);
    document.getElementById('metaModalLoader').classList.add('d-none');
    document.getElementById('metaModalFallbackLink').href = fallbackAgodaUrl;
    document.getElementById('metaModalError').classList.remove('d-none');
  }
};
