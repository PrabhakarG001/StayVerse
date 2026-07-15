/* ============================================================
   StayVerse — UI & Interactions Script (Vanilla JS)
   ============================================================ */

// Scroll and navbar style triggers
window.addEventListener('scroll', function() {
  const header = document.getElementById('sv-header');
  if (header) {
    header.classList.toggle('scrolled', window.scrollY > 50);
  }
  
  // Mobile bottom navigation scroll triggers
  const bottomNav = document.querySelector('.mobile-bottom-nav');
  if (bottomNav) {
    // Hide immediately when scrolling starts
    bottomNav.classList.add('scroll-hide');
    
    // Clear any existing scroll timeout
    clearTimeout(bottomNav._scrollTimeout);
    
    // Show the bottom nav again 250ms after scroll events stop firing
    bottomNav._scrollTimeout = setTimeout(() => {
      bottomNav.classList.remove('scroll-hide');
    }, 250);
  }
}, { passive: true });

// Close mobile offcanvas menu when links are clicked
document.querySelectorAll('#mobileSidebar .list-group-item').forEach(link => {
  link.addEventListener('click', () => {
    const bsOffcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('mobileSidebar'));
    if (bsOffcanvas) bsOffcanvas.hide();
  });
});

// Mobile show page carousel dots sync
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('.show-mobile-carousel').forEach(carousel => {
    carousel.addEventListener('scroll', () => {
      const scrollLeft = carousel.scrollLeft;
      const width = carousel.clientWidth;
      const index = Math.round(scrollLeft / width);
      const dots = carousel.nextElementSibling.querySelectorAll('.show-dot');
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === index);
      });
    }, { passive: true });
  });

  // Flatpickr Date Picker on Hotel Detail Page
  const checkinInput = document.getElementById('checkin_date');
  const checkoutInput = document.getElementById('checkout_date');

  if (checkinInput && checkoutInput) {
    const fpCheckin = flatpickr(checkinInput, {
      minDate: "today",
      dateFormat: "Y-m-d",
      nextArrow: '<i class="fa-solid fa-chevron-right"></i>',
      prevArrow: '<i class="fa-solid fa-chevron-left"></i>',
      onChange: function(selectedDates) {
        if (selectedDates[0]) {
          const checkOutMin = new Date(selectedDates[0]);
          checkOutMin.setDate(checkOutMin.getDate() + 1);
          fpCheckout.set("minDate", checkOutMin);
          setTimeout(() => { if (fpCheckout && fpCheckout.open) fpCheckout.open(); else if (fpCheckout[0]) fpCheckout[0].open(); }, 100);
        }
      }
    });

    const fpCheckout = flatpickr(checkoutInput, {
      minDate: "today",
      dateFormat: "Y-m-d",
      nextArrow: '<i class="fa-solid fa-chevron-right"></i>',
      prevArrow: '<i class="fa-solid fa-chevron-left"></i>'
    });

    const checkinContainer = document.querySelector('.checkin-date-container');
    if (checkinContainer) checkinContainer.addEventListener('click', () => { if (fpCheckin.open) fpCheckin.open(); else if (fpCheckin[0]) fpCheckin[0].open(); });
    
    const checkoutContainer = document.querySelector('.checkout-date-container');
    if (checkoutContainer) checkoutContainer.addEventListener('click', () => { if (fpCheckout.open) fpCheckout.open(); else if (fpCheckout[0]) fpCheckout[0].open(); });
  }

  // Setup Custom select dropdown overlays (Hotel Details)
  document.querySelectorAll('#guests-dropdown-group, #rooms-dropdown-group').forEach(group => {
    group.addEventListener('click', (e) => {
      e.stopPropagation();
      const menu = group.querySelector('.custom-dropdown-menu');
      if (!menu) return;
      document.querySelectorAll('.custom-dropdown-menu').forEach(m => {
        if (m !== menu) m.classList.add('d-none');
      });
      menu.classList.toggle('d-none');
    });
  });

  document.addEventListener('click', () => {
    document.querySelectorAll('.custom-dropdown-menu').forEach(m => m.classList.add('d-none'));
    const customContainer = document.getElementById('custom-guest-input-container');
    if (customContainer) customContainer.classList.add('d-none');
  });

  // Handle guest option selections
  document.querySelectorAll('#guests-options .custom-dropdown-item').forEach(item => {
    item.addEventListener('click', function(e) {
      e.stopPropagation();
      const val = this.getAttribute('data-value');
      const customContainer = document.getElementById('custom-guest-input-container');
      
      if (val === 'custom') {
        if (customContainer) {
          customContainer.classList.remove('d-none');
          const inputEl = document.getElementById('custom-guest-input');
          if (inputEl) inputEl.focus();
        }
        document.querySelectorAll('#guests-options .custom-dropdown-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        return;
      }
      
      if (customContainer) customContainer.classList.add('d-none');
      
      document.getElementById('guests-hidden-val').value = val;
      document.getElementById('guests-display-val').textContent = this.textContent;
      document.querySelectorAll('#guests-options .custom-dropdown-item').forEach(i => i.classList.remove('active'));
      this.classList.add('active');
      this.closest('.custom-dropdown-menu').classList.add('d-none');
    });
  });

  // Handle Custom Guest Apply button
  const customGuestApplyBtn = document.getElementById('custom-guest-apply');
  if (customGuestApplyBtn) {
    customGuestApplyBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      const inputEl = document.getElementById('custom-guest-input');
      const inputVal = parseInt(inputEl.value);
      if (isNaN(inputVal) || inputVal < 1) {
        alert("Please enter a valid number of guests (1 or more).");
        return;
      }
      
      const label = inputVal === 1 ? "1 Guest" : inputVal + " Guests";
      document.getElementById('guests-hidden-val').value = inputVal;
      document.getElementById('guests-display-val').textContent = label;
      document.getElementById('guests-options').classList.add('d-none');
      document.getElementById('custom-guest-input-container').classList.add('d-none');
    });
  }

  // Prevent click inside custom input container from closing the dropdown
  const customContainer = document.getElementById('custom-guest-input-container');
  if (customContainer) {
    customContainer.addEventListener('click', e => e.stopPropagation());
  }

  // Handle room type options
  document.querySelectorAll('#rooms-options .custom-dropdown-item').forEach(item => {
    item.addEventListener('click', function(e) {
      e.stopPropagation();
      const val = this.getAttribute('data-value');
      document.getElementById('rooms-hidden-val').value = val;
      document.getElementById('rooms-display-val').textContent = this.textContent;
      document.querySelectorAll('#rooms-options .custom-dropdown-item').forEach(i => i.classList.remove('active'));
      this.classList.add('active');
      this.closest('.custom-dropdown-menu').classList.add('d-none');
      
      // Update price display based on room upcharge
      const activeRoom = document.querySelector('#rooms-options .custom-dropdown-item.active');
      const priceDisplayEl = document.querySelector('.price-val[data-inr]');
      const configEl = document.getElementById('hotel-show-config');
      if (activeRoom && priceDisplayEl && configEl) {
        const config = JSON.parse(configEl.textContent);
        const basePrice = parseInt(config.basePrice) || 5000;
        const extra = parseInt(activeRoom.getAttribute('data-extra')) || 0;
        const total = basePrice + extra;
        priceDisplayEl.setAttribute('data-inr', total);
        if (typeof applyCurrency === 'function') {
          const savedCurr = localStorage.getItem('sv_currency') || 'INR';
          applyCurrency(savedCurr);
        } else {
          priceDisplayEl.textContent = "₹" + total.toLocaleString('en-IN');
        }
      }
    });
  });

  // --- Hero Search Bar Segment Toggles ---
  const segWhere = document.getElementById('sb-seg-where');
  const segGuests = document.getElementById('sb-seg-guests');
  const dropWhere = document.getElementById('sb-dropdown-where');
  const dropGuests = document.getElementById('sb-dropdown-guests');
  const whereInput = document.getElementById('sb-where-input');

  if (segWhere && dropWhere && whereInput) {
    segWhere.addEventListener('click', (e) => {
      e.stopPropagation();
      dropWhere.classList.remove('d-none');
      if (dropGuests) dropGuests.classList.add('d-none');
      whereInput.focus();
    });
    whereInput.addEventListener('focus', (e) => {
      e.stopPropagation();
      dropWhere.classList.remove('d-none');
      if (dropGuests) dropGuests.classList.add('d-none');
    });
  }

  if (segGuests && dropGuests) {
    segGuests.addEventListener('click', (e) => {
      e.stopPropagation();
      dropGuests.classList.remove('d-none');
      if (dropWhere) dropWhere.classList.add('d-none');
    });
  }

  document.addEventListener('click', (e) => {
    if (dropWhere && !e.target.closest('#sb-seg-where')) {
      dropWhere.classList.add('d-none');
    }
    if (dropGuests && !e.target.closest('#sb-seg-guests')) {
      dropGuests.classList.add('d-none');
    }
  });

  // --- Hero Search Bar Guest Counter Actions ---
  let adults = 0;
  let children = 0;
  const adultsVal = document.getElementById('sb-adults-count');
  const childrenVal = document.getElementById('sb-children-count');
  const guestDisplay = document.getElementById('sb-val-guests');
  const guestsInput = document.getElementById('sb-guests-input');

  const updateHeroGuests = () => {
    if (adultsVal) adultsVal.textContent = adults;
    if (childrenVal) childrenVal.textContent = children;
    
    const total = adults + children;
    if (guestsInput) guestsInput.value = total;
    
    if (guestDisplay) {
      if (total === 0) {
        guestDisplay.textContent = 'Add guests';
        guestDisplay.style.color = '#717171';
        guestDisplay.style.fontWeight = '300';
      } else {
        const parts = [];
        if (adults > 0) parts.push(`${adults} Adult${adults > 1 ? 's' : ''}`);
        if (children > 0) parts.push(`${children} Child${children > 1 ? 'ren' : ''}`);
        guestDisplay.textContent = parts.join(', ');
        guestDisplay.style.color = '#222';
        guestDisplay.style.fontWeight = '400';
      }
    }
    
    // Toggle minus btn disabled styling
    const adMinus = document.getElementById('sb-adults-minus');
    const chMinus = document.getElementById('sb-children-minus');
    if (adMinus) adMinus.classList.toggle('disabled', adults <= 0);
    if (chMinus) chMinus.classList.toggle('disabled', children <= 0);
  };

  document.getElementById('sb-adults-plus')?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (adults < 16) { adults++; updateHeroGuests(); }
  });
  document.getElementById('sb-adults-minus')?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (adults > 0) { adults--; updateHeroGuests(); }
  });
  document.getElementById('sb-children-plus')?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (children < 10) { children++; updateHeroGuests(); }
  });
  document.getElementById('sb-children-minus')?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (children > 0) { children--; updateHeroGuests(); }
  });
});

// Toast Notification System
window.showToast = function(message) {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'position-fixed bottom-0 start-50 translate-middle-x p-3';
    toastContainer.style.zIndex = '1055';
    // Style to ensure it shows above everything, specifically on mobile
    toastContainer.style.bottom = '80px'; 
    document.body.appendChild(toastContainer);
  }
  
  const toast = document.createElement('div');
  toast.className = 'toast align-items-center text-bg-dark border-0 show';
  toast.role = 'alert';
  toast.style.borderRadius = '8px';
  toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
  toast.style.transition = 'opacity 0.3s ease';
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body fw-medium" style="font-family: 'Plus Jakarta Sans', sans-serif;">${message}</div>
    </div>
  `;
  toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
};

// Protected Actions (NO REDIRECT)
window.handleProtectedRoute = function(path) {
  const userLoggedIn = document.body.getAttribute('data-logged-in') === 'true';
  if (!userLoggedIn) {
    showToast("Please login first");
    return;
  }
  window.location.href = path;
};

// Protected Action callback
window.handleProtectedAction = function(actionCallback) {
  const userLoggedIn = document.body.getAttribute('data-logged-in') === 'true';
  if (!userLoggedIn) {
    showToast("Please login first");
    return;
  }
  actionCallback();
};

// Switch Role function for Hosts logging in as User
window.switchToUser = function() {
  fetch('/auth/switch-role', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ role: 'user' })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      localStorage.setItem("role", "user");
      window.location.href = '/home';
    } else {
      showToast(data.message || 'Error switching role');
    }
  })
  .catch(err => {
    console.error(err);
    showToast('Failed to switch role');
  });
};
