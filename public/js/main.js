/* ============================================================
   StayVerse — Main Global Script (Vanilla JS)
   ============================================================ */

// Google Translate Initialization
function googleTranslateElementInit() {
  new google.translate.TranslateElement({
    pageLanguage: 'en',
    includedLanguages: 'en,hi',
    autoDisplay: false
  }, 'google_translate_element');
}

// User preferences
function changeLanguage(langCode) {
  const select = document.querySelector('select.goog-te-combo');
  if (select) {
    select.value = langCode;
    select.dispatchEvent(new Event('change'));
  } else {
    document.cookie = `googtrans=/en/${langCode}; path=/`;
    document.cookie = `googtrans=/en/${langCode}; path=/; domain=${window.location.hostname}`;
    window.location.reload();
  }
  
  document.querySelectorAll('.currentLangText').forEach(el => {
    el.textContent = langCode === 'hi' ? 'Hindi' : 'English';
  });
  localStorage.setItem('sv_lang', langCode);
}

function changeCurrency(currCode) {
  localStorage.setItem('sv_currency', currCode);
  applyCurrency(currCode);
}

function applyCurrency(currCode) {
  const isUSD = currCode === 'USD';
  const rate = 83;
  const currSymbol = isUSD ? '$' : '₹';
  const currText = isUSD ? '$ Dollar' : '₹ (Rupees)';
  
  document.querySelectorAll('.currentCurrSymbol').forEach(el => el.textContent = currSymbol);
  document.querySelectorAll('.currentCurrText').forEach(el => el.textContent = currText);
  
  document.querySelectorAll('.price-val').forEach(el => {
    const inrVal = parseInt(el.getAttribute('data-inr')) || 0;
    if (isUSD) {
       el.innerHTML = '$' + Math.round(inrVal / rate).toLocaleString('en-US');
    } else {
       el.innerHTML = '₹' + inrVal.toLocaleString('en-IN');
    }
  });
}

// Wishlist Manage
const WISHLIST_KEY = 'stayverse_wishlists';
function getWishlists() {
  const data = localStorage.getItem(WISHLIST_KEY);
  return data ? JSON.parse(data) : [];
}

async function toggleWishlist(event, propertyId, name, location, price, rating, imageUrl, isPremium) {
  event.preventDefault();
  event.stopPropagation();
  const icon = event.currentTarget;
  
  try {
    const response = await fetch('/api/wishlists/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId, name, location, price, rating, imageUrl, isPremium })
    });
    
    if (response.status === 401) {
      alert("Please login first to manage your wishlist.");
      window.location.href = "/auth/login-user";
      return;
    }
    
    const data = await response.json();
    if (data.success) {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(data.wishlist));
      if (data.action === 'added') {
        icon.classList.replace('fa-regular', 'fa-solid');
        icon.classList.remove('text-white');
        icon.classList.add('text-danger');
      } else {
        icon.classList.replace('fa-solid', 'fa-regular');
        icon.classList.remove('text-danger');
        icon.classList.add('text-white');
      }
    }
  } catch (err) {
    console.error("Wishlist toggle error:", err);
  }
}

// Form validations & widgets initialization
document.addEventListener("DOMContentLoaded", () => {
  const savedCurr = localStorage.getItem('sv_currency');
  if (savedCurr) applyCurrency(savedCurr);
  
  const savedLang = localStorage.getItem('sv_lang') || 'en';
  document.querySelectorAll('.currentLangText').forEach(el => {
    el.textContent = savedLang === 'hi' ? 'Hindi' : 'English';
  });

  // Sync wishlist cache with DB
  fetch('/api/wishlists')
    .then(res => res.ok ? res.json() : null)
    .then(dbWishlist => {
      if (dbWishlist) {
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(dbWishlist));
        const wishlistIds = new Set(dbWishlist.map(h => h.propertyId.toString()));
        document.querySelectorAll('.heart-wishlist-icon').forEach(icon => {
          const propertyId = icon.getAttribute('data-id');
          if (propertyId && wishlistIds.has(propertyId.toString())) {
            icon.classList.replace('fa-regular', 'fa-solid');
            icon.classList.remove('text-white');
            icon.classList.add('text-danger');
          }
        });
      }
    }).catch(err => console.error("Wishlist sync error:", err));

  // Forms bootstrap validator
  document.querySelectorAll('.needs-validation').forEach(form => {
    form.addEventListener('submit', e => {
      if (!form.checkValidity()) {
        e.preventDefault();
        e.stopPropagation();
      }
      form.classList.add('was-validated');
    }, false);
  });

  // Tax display switch toggler
  const taxToggle = document.getElementById('taxToggle');
  if (taxToggle) {
    taxToggle.addEventListener('change', () => {
      document.querySelectorAll('.tax-info').forEach(el => {
        el.classList.toggle('d-none', !taxToggle.checked);
      });
    });
  }

  // Scroll Progress indicator
  const progressContainer = document.querySelector('.sv-scroll-progress-container');
  if (progressContainer) {
    let ticking = false;
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) : 0;
      document.documentElement.style.setProperty('--scroll-progress', Math.max(0, Math.min(1, progress)));
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollProgress);
        ticking = true;
      }
    }, { passive: true });
  }
});
