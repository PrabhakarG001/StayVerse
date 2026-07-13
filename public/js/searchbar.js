/* ============================================================
   StayVerse — Hero Booking Search Bar  (Vanilla JS)
   ============================================================ */
(function () {
  'use strict';

  // ---- State ----
  var state = {
    checkinDate: null,
    checkoutDate: null,
    adults: 0,
    children: 0,
    activeSeg: null,
    calMonth: {}
  };

  var MONTHS = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];
  var DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

  var now = new Date();
  state.calMonth.checkin  = new Date(now.getFullYear(), now.getMonth(), 1);
  state.calMonth.checkout = new Date(now.getFullYear(), now.getMonth(), 1);
  state.calMonth.when     = new Date(now.getFullYear(), now.getMonth(), 1);

  // ---- SVG icons (inline — no external deps) ----
  var svgSearch = '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg>';
  var svgChevronLeft  = '<svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>';
  var svgChevronRight = '<svg viewBox="0 0 24 24"><polyline points="9 6 15 12 9 18"/></svg>';

  // ============================================================
  //  Build DOM
  // ============================================================
  function buildSearchBar() {
    var wrapper = document.getElementById('sv-booking-bar');
    if (!wrapper) return;

    wrapper.classList.add('sv-booking-bar-wrapper');

    var bar = el('div', 'sv-booking-bar');
    bar.id = 'sb-bar';

    // --- Where ---
    var segWhere = makeWhereSeg();

    // --- Divider ---
    var d1 = el('div', 'sb-divider');

    // --- When ---
    var segWhen = makeSeg('when', 'When', 'Add dates');
    var cal = makeCalendar('when');
    segWhen.appendChild(cal);

    // --- Divider ---
    var d2 = el('div', 'sb-divider');

    // --- Who ---
    var segWho = makeSeg('guests', 'Who', 'Add guests');
    var gDropdown = makeGuestsDropdown();
    segWho.appendChild(gDropdown);

    // --- Search Button ---
    var btnWrap = el('div', 'sb-search-btn-wrap');
    var btn = el('button', 'sb-search-btn');
    btn.id = 'sb-search-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Search');
    btn.innerHTML = svgSearch;
    btnWrap.appendChild(btn);

    bar.appendChild(segWhere);
    bar.appendChild(d1);
    bar.appendChild(segWhen);
    bar.appendChild(d2);
    bar.appendChild(segWho);
    bar.appendChild(btnWrap);

    wrapper.appendChild(bar);

    // --- Events ---
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      performSearch();
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('#sb-bar')) closeSeg();
    });

    updateGuestBtns();
  }

  // ---- helpers ----
  function el(tag, cls) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    return e;
  }

  function makeSeg(name, label, placeholder) {
    var seg = el('div', 'sb-seg');
    seg.id = 'sb-seg-' + name;
    seg.setAttribute('role', 'button');
    seg.setAttribute('tabindex', '0');
    seg.setAttribute('aria-label', label);

    var lbl = el('div', 'sb-seg-label');
    lbl.textContent = label;

    var val = el('div', 'sb-seg-value');
    val.id = 'sb-val-' + name;
    val.textContent = placeholder;

    seg.appendChild(lbl);
    seg.appendChild(val);

    seg.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleSeg(name);
    });

    seg.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleSeg(name);
      }
    });

    return seg;
  }

  // ---- Custom Where Segment with Input & Dropdown ----
  function makeWhereSeg() {
    var seg = el('div', 'sb-seg');
    seg.id = 'sb-seg-where';
    seg.setAttribute('role', 'button');
    seg.setAttribute('tabindex', '0');
    
    var lbl = el('div', 'sb-seg-label');
    lbl.textContent = 'Where';

    var form = el('form', '');
    form.action = '/hotels/search';
    form.method = 'GET';
    form.style.width = '100%';
    form.style.margin = '0';

    var input = el('input', 'sb-seg-input');
    input.type = 'text';
    input.name = 'query';
    input.placeholder = 'Search destinations';
    input.autocomplete = 'off';
    input.id = 'sb-where-input';
    input.style.border = 'none';
    input.style.background = 'transparent';
    input.style.outline = 'none';
    input.style.width = '100%';
    input.style.fontSize = '0.88rem';
    input.style.color = '#222';
    input.style.fontWeight = '400';

    // Prevent enter from submitting the whole page normally if we want to handle it
    input.addEventListener('keydown', function(e) {
      if(e.key === 'Enter') {
        // let the form submit normally
      }
    });

    form.appendChild(input);
    
    var valWrap = el('div', 'sb-seg-value');
    valWrap.appendChild(form);

    seg.appendChild(lbl);
    seg.appendChild(valWrap);

    // Dropdown
    var drop = el('div', 'sb-dropdown sb-where-dropdown');
    drop.id = 'sb-dropdown-where';
    drop.style.width = '420px';
    drop.style.padding = '32px 16px';
    drop.style.left = '0';
    drop.style.borderRadius = '32px';
    drop.style.textAlign = 'left';
    
    drop.innerHTML = `
      <!-- Recent searches -->
      <div class="mb-4">
        <h6 class="fw-bold mb-3 text-secondary" style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; margin-left: 16px; margin-top:0;">Recent searches</h6>
        <a href="/hotels/search?query=Varanasi" class="d-flex align-items-center text-decoration-none text-dark py-2 px-3 sv-dest-list-item rounded-4" style="transition: background 0.2s;">
          <div class="d-flex align-items-center justify-content-center flex-shrink-0" style="width: 48px; height: 48px; background: #FFF4F4; border-radius: 12px; margin-right: 16px;">
            <i class="fa-solid fa-city" style="font-size: 1.25rem; color: #FF385C;"></i>
          </div>
          <div>
            <div class="fw-bold" style="font-size: 0.95rem; color: #222;">Varanasi</div>
            <div class="text-secondary mt-1" style="font-size: 0.8rem; color: #717171;">11–12 Aug • 1 guest</div>
          </div>
        </a>
      </div>

      <!-- Suggested destinations -->
      <div>
        <h6 class="fw-bold mb-3 text-secondary" style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; margin-left: 16px; margin-top:0;">Suggested destinations</h6>
        
        <a href="/hotels/search?query=Nearby" class="d-flex align-items-center text-decoration-none text-dark py-2 px-3 sv-dest-list-item rounded-4 mb-1" style="transition: background 0.2s;">
          <div class="d-flex align-items-center justify-content-center flex-shrink-0" style="width: 48px; height: 48px; background: #F0F6FF; border-radius: 12px; margin-right: 16px;">
            <i class="fa-solid fa-location-arrow" style="font-size: 1.25rem; color: #0D6EFD;"></i>
          </div>
          <div>
            <div class="fw-bold" style="font-size: 0.95rem; color: #222;">Nearby</div>
            <div class="text-secondary mt-1" style="font-size: 0.8rem; color: #717171;">Find what's around you</div>
          </div>
        </a>

        <a href="/hotels/search?query=Puri" class="d-flex align-items-center text-decoration-none text-dark py-2 px-3 sv-dest-list-item rounded-4 mb-1" style="transition: background 0.2s;">
          <div class="d-flex align-items-center justify-content-center flex-shrink-0" style="width: 48px; height: 48px; background: #F0F6FF; border-radius: 12px; margin-right: 16px;">
            <i class="fa-solid fa-umbrella-beach" style="font-size: 1.25rem; color: #0D6EFD;"></i>
          </div>
          <div>
            <div class="fw-bold" style="font-size: 0.95rem; color: #222;">Puri, Odisha</div>
            <div class="text-secondary mt-1" style="font-size: 0.8rem; color: #717171;">For its seaside allure</div>
          </div>
        </a>

        <a href="/hotels/search?query=Lucknow" class="d-flex align-items-center text-decoration-none text-dark py-2 px-3 sv-dest-list-item rounded-4 mb-1" style="transition: background 0.2s;">
          <div class="d-flex align-items-center justify-content-center flex-shrink-0" style="width: 48px; height: 48px; background: #F8F5F2; border-radius: 12px; margin-right: 16px;">
            <i class="fa-solid fa-tree-city" style="font-size: 1.25rem; color: #8A6D56;"></i>
          </div>
          <div>
            <div class="fw-bold" style="font-size: 0.95rem; color: #222;">Lucknow, Uttar Pradesh</div>
            <div class="text-secondary mt-1" style="font-size: 0.8rem; color: #717171;">Guests interested in Varanasi also looked here</div>
          </div>
        </a>

        <a href="/hotels/search?query=Kolkata" class="d-flex align-items-center text-decoration-none text-dark py-2 px-3 sv-dest-list-item rounded-4 mb-1" style="transition: background 0.2s;">
          <div class="d-flex align-items-center justify-content-center flex-shrink-0" style="width: 48px; height: 48px; background: #FFF4F4; border-radius: 12px; margin-right: 16px;">
            <i class="fa-solid fa-monument" style="font-size: 1.25rem; color: #FF385C;"></i>
          </div>
          <div>
            <div class="fw-bold" style="font-size: 0.95rem; color: #222;">Kolkata, West Bengal</div>
            <div class="text-secondary mt-1" style="font-size: 0.8rem; color: #717171;">For sights like Victoria Memorial</div>
          </div>
        </a>

        <a href="/hotels/search?query=Goa" class="d-flex align-items-center text-decoration-none text-dark py-2 px-3 sv-dest-list-item rounded-4 mb-1" style="transition: background 0.2s;">
          <div class="d-flex align-items-center justify-content-center flex-shrink-0" style="width: 48px; height: 48px; background: #F8F5F2; border-radius: 12px; margin-right: 16px;">
            <i class="fa-solid fa-umbrella-beach" style="font-size: 1.25rem; color: #8A6D56;"></i>
          </div>
          <div>
            <div class="fw-bold" style="font-size: 0.95rem; color: #222;">North Goa, Goa</div>
            <div class="text-secondary mt-1" style="font-size: 0.8rem; color: #717171;">Guests interested in Varanasi also looked here</div>
          </div>
        </a>
      </div>
    `;

    seg.appendChild(drop);

    seg.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleSeg('where');
      input.focus();
    });
    
    input.addEventListener('focus', function (e) {
      if (state.activeSeg !== 'where') toggleSeg('where');
    });

    // Add hover states to lists (CSS in JS to avoid touching main CSS files repeatedly)
    drop.querySelectorAll('.sv-dest-list-item').forEach(function(item) {
      item.addEventListener('mouseenter', function() { this.style.background = '#EBEBEB'; });
      item.addEventListener('mouseleave', function() { this.style.background = 'transparent'; });
    });

    return seg;
  }

  // ---- Calendar ----
  function makeCalendar(type) {
    var drop = el('div', 'sb-dropdown sb-cal');
    drop.id = 'sb-dropdown-' + type;

    var header = el('div', 'sb-cal-header');

    var prevBtn = el('button', 'sb-cal-nav');
    prevBtn.type = 'button';
    prevBtn.setAttribute('aria-label', 'Previous month');
    prevBtn.innerHTML = svgChevronLeft;
    prevBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      changeMonth(-1, type);
    });

    var monthLabel = el('span', '');
    monthLabel.id = 'sb-month-' + type;

    var nextBtn = el('button', 'sb-cal-nav');
    nextBtn.type = 'button';
    nextBtn.setAttribute('aria-label', 'Next month');
    nextBtn.innerHTML = svgChevronRight;
    nextBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      changeMonth(1, type);
    });

    header.appendChild(prevBtn);
    header.appendChild(monthLabel);
    header.appendChild(nextBtn);

    var grid = el('div', 'sb-cal-grid');
    grid.id = 'sb-cal-grid-' + type;

    drop.appendChild(header);
    drop.appendChild(grid);
    return drop;
  }

  function changeMonth(dir, type) {
    var m = state.calMonth[type];
    state.calMonth[type] = new Date(m.getFullYear(), m.getMonth() + dir, 1);
    renderCalendar(type);
  }

  function renderCalendar(type) {
    var month = state.calMonth[type];
    var label = document.getElementById('sb-month-' + type);
    var grid  = document.getElementById('sb-cal-grid-' + type);
    if (!label || !grid) return;

    label.textContent = MONTHS[month.getMonth()] + ' ' + month.getFullYear();

    var today = new Date();
    today.setHours(0, 0, 0, 0);

    var firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
    var daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();

    var minDate = null;
    if ((type === 'checkout' || (type === 'when' && state.checkinDate && !state.checkoutDate)) && state.checkinDate) {
      minDate = new Date(state.checkinDate);
      minDate.setDate(minDate.getDate() + 1);
    }

    var html = '';
    DAYS.forEach(function (d) {
      html += '<div class="sb-cal-day-name">' + d + '</div>';
    });

    for (var i = 0; i < firstDay; i++) {
      html += '<div class="sb-cal-day empty"></div>';
    }

    for (var d = 1; d <= daysInMonth; d++) {
      var date = new Date(month.getFullYear(), month.getMonth(), d);
      date.setHours(0, 0, 0, 0);

      var cls = 'sb-cal-day';
      var disabled = false;

      if (date < today) { cls += ' disabled'; disabled = true; }
      if (minDate && date < minDate) { cls += ' disabled'; disabled = true; }
      if (date.getTime() === today.getTime()) cls += ' today';

      var sel = (type === 'checkin') ? state.checkinDate : ((type === 'checkout') ? state.checkoutDate : null);
      if (type === 'when') {
        if (state.checkinDate && date.getTime() === state.checkinDate.getTime()) cls += ' selected';
        if (state.checkoutDate && date.getTime() === state.checkoutDate.getTime()) cls += ' selected';
      } else {
        if (sel && date.getTime() === sel.getTime()) cls += ' selected';
      }

      // Range highlighting
      if (state.checkinDate && state.checkoutDate &&
          date > state.checkinDate && date < state.checkoutDate) {
        cls += ' in-range';
      }

      if (disabled) {
        html += '<div class="' + cls + '">' + d + '</div>';
      } else {
        html += '<div class="' + cls + '" data-type="' + type + '" data-ts="' + date.getTime() + '">' + d + '</div>';
      }
    }

    grid.innerHTML = html;

    // Attach click events to active days
    var activeDays = grid.querySelectorAll('.sb-cal-day:not(.disabled):not(.empty)');
    activeDays.forEach(function (dayEl) {
      dayEl.addEventListener('click', function (e) {
        e.stopPropagation();
        var t = this.getAttribute('data-type');
        var ts = parseInt(this.getAttribute('data-ts'), 10);
        pickDate(t, ts);
      });
    });
  }

  function pickDate(type, ts) {
    var date = new Date(ts);

    if (type === 'when') {
      if (!state.checkinDate || (state.checkinDate && state.checkoutDate)) {
        state.checkinDate = date;
        state.checkoutDate = null;
        setVal('when', formatDate(date) + ' – Add checkout');
      } else {
        if (date <= state.checkinDate) {
          state.checkinDate = date;
          setVal('when', formatDate(date) + ' – Add checkout');
        } else {
          state.checkoutDate = date;
          var shortIn = state.checkinDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          var shortOut = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          setVal('when', shortIn + ' – ' + shortOut);
          setTimeout(function () { toggleSeg('guests'); }, 220);
        }
      }
      renderCalendar('when');
    } else if (type === 'checkin') {
      state.checkinDate = date;
      setVal('checkin', formatDate(date));
      if (state.checkoutDate && state.checkoutDate <= date) {
        state.checkoutDate = null;
        resetVal('checkout', 'Add dates');
      }
      setTimeout(function () { toggleSeg('checkout'); }, 220);
    } else {
      state.checkoutDate = date;
      setVal('checkout', formatDate(date));
      setTimeout(function () { toggleSeg('guests'); }, 220);
    }
  }

  function formatDate(d) {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function setVal(name, text) {
    var v = document.getElementById('sb-val-' + name);
    if (v) { v.textContent = text; v.classList.add('has-value'); }
  }

  function resetVal(name, placeholder) {
    var v = document.getElementById('sb-val-' + name);
    if (v) { v.textContent = placeholder; v.classList.remove('has-value'); }
  }

  // ---- Guests Dropdown ----
  function makeGuestsDropdown() {
    var drop = el('div', 'sb-dropdown sb-guests-dropdown');
    drop.id = 'sb-dropdown-guests';

    drop.appendChild(makeGuestRow('Adults', 'Ages 13 or above', 'adults'));
    drop.appendChild(makeGuestRow('Children', 'Ages 2 – 12', 'children'));

    return drop;
  }

  function makeGuestRow(title, desc, key) {
    var row = el('div', 'sb-guest-row');

    var labelDiv = el('div', '');
    var t = el('div', 'sb-guest-title');
    t.textContent = title;
    var d = el('div', 'sb-guest-desc');
    d.textContent = desc;
    labelDiv.appendChild(t);
    labelDiv.appendChild(d);

    var controls = el('div', 'sb-guest-controls');

    var minusBtn = el('button', 'sb-guest-btn');
    minusBtn.type = 'button';
    minusBtn.id = 'sb-' + key + '-minus';
    minusBtn.textContent = '−';
    minusBtn.setAttribute('aria-label', 'Decrease ' + title.toLowerCase());
    minusBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      changeGuest(key, -1);
    });

    var count = el('span', 'sb-guest-count');
    count.id = 'sb-' + key + '-count';
    count.textContent = state[key];

    var plusBtn = el('button', 'sb-guest-btn');
    plusBtn.type = 'button';
    plusBtn.id = 'sb-' + key + '-plus';
    plusBtn.textContent = '+';
    plusBtn.setAttribute('aria-label', 'Increase ' + title.toLowerCase());
    plusBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      changeGuest(key, 1);
    });

    controls.appendChild(minusBtn);
    controls.appendChild(count);
    controls.appendChild(plusBtn);

    row.appendChild(labelDiv);
    row.appendChild(controls);
    return row;
  }

  function changeGuest(key, dir) {
    state[key] = Math.max(0, state[key] + dir);
    document.getElementById('sb-' + key + '-count').textContent = state[key];
    updateGuestBtns();
    updateGuestDisplay();
  }

  function updateGuestBtns() {
    toggleBtnDisabled('sb-adults-minus', state.adults <= 0);
    toggleBtnDisabled('sb-adults-plus', state.adults >= 16);
    toggleBtnDisabled('sb-children-minus', state.children <= 0);
    toggleBtnDisabled('sb-children-plus', state.children >= 10);
  }

  function toggleBtnDisabled(id, isDisabled) {
    var btn = document.getElementById(id);
    if (!btn) return;
    if (isDisabled) btn.classList.add('disabled');
    else btn.classList.remove('disabled');
  }

  function updateGuestDisplay() {
    var total = state.adults + state.children;
    var v = document.getElementById('sb-val-guests');
    if (!v) return;

    if (total === 0) {
      v.textContent = 'Add guests';
      v.classList.remove('has-value');
    } else {
      var parts = [];
      if (state.adults) parts.push(state.adults + ' Adult' + (state.adults > 1 ? 's' : ''));
      if (state.children) parts.push(state.children + ' Child' + (state.children > 1 ? 'ren' : ''));
      v.textContent = parts.join(', ');
      v.classList.add('has-value');
    }
  }

  // ---- Segment toggling ----
  function toggleSeg(name) {
    if (state.activeSeg === name) {
      closeSeg();
      return;
    }
    openSeg(name);
  }

  function openSeg(name) {
    state.activeSeg = name;

    // Deactivate all
    document.querySelectorAll('#sb-bar .sb-seg').forEach(function (s) { s.classList.remove('active'); });
    document.querySelectorAll('#sb-bar .sb-dropdown').forEach(function (d) { d.classList.remove('open'); });

    var seg = document.getElementById('sb-seg-' + name);
    if (seg) seg.classList.add('active');

    if (name === 'checkin' || name === 'checkout' || name === 'when') renderCalendar(name);

    var drop = document.getElementById('sb-dropdown-' + name);
    if (drop) {
      setTimeout(function () { drop.classList.add('open'); }, 15);
    }
  }

  function closeSeg() {
    state.activeSeg = null;
    document.querySelectorAll('#sb-bar .sb-seg').forEach(function (s) { s.classList.remove('active'); });
    document.querySelectorAll('#sb-bar .sb-dropdown').forEach(function (d) { d.classList.remove('open'); });
  }

  // ---- Search ----
  function performSearch() {
    var data = {
      checkin:  state.checkinDate ? state.checkinDate.toISOString().split('T')[0] : null,
      checkout: state.checkoutDate ? state.checkoutDate.toISOString().split('T')[0] : null,
      adults:   state.adults,
      children: state.children,
      totalGuests: state.adults + state.children
    };

    // Validate: at minimum need check-in
    var whereInput = document.getElementById('sb-where-input');
    if (whereInput && whereInput.value.trim() !== '') {
      data.query = whereInput.value.trim();
    }

    if (data.query) {
      var params = new URLSearchParams();
      params.set('query', data.query);
      if (data.checkin) params.set('checkin', data.checkin);
      if (data.checkout) params.set('checkout', data.checkout);
      if (data.totalGuests > 0) params.set('guests', data.totalGuests);
      window.location.href = '/hotels/search?' + params.toString();
      return;
    }

    if (!state.checkinDate) {
      var seg = document.getElementById('sb-seg-checkin') || document.getElementById('sb-seg-when');
      if (seg) {
        seg.classList.add('sb-shake');
        setTimeout(function () { seg.classList.remove('sb-shake'); }, 500);
      }
      openSeg(document.getElementById('sb-seg-checkin') ? 'checkin' : 'when');
      return;
    }

    if (!state.checkoutDate) {
      var segCo = document.getElementById('sb-seg-checkout') || document.getElementById('sb-seg-when');
      if (segCo) {
        segCo.classList.add('sb-shake');
        setTimeout(function () { segCo.classList.remove('sb-shake'); }, 500);
      }
      openSeg(document.getElementById('sb-seg-checkout') ? 'checkout' : 'when');
      return;
    }

    if (state.adults + state.children === 0) {
      var segG = document.getElementById('sb-seg-guests');
      if (segG) {
        segG.classList.add('sb-shake');
        setTimeout(function () { segG.classList.remove('sb-shake'); }, 500);
      }
      openSeg('guests');
      return;
    }

    closeSeg();

    console.log('%c🔍 StayVerse Search', 'font-size:14px; font-weight:bold; color:#FF385C');
    console.log('  Check-in:    ', data.checkin);
    console.log('  Check-out:   ', data.checkout);
    console.log('  Adults:      ', data.adults);
    console.log('  Children:    ', data.children);
    console.log('  Total Guests:', data.totalGuests);
    console.log('  Full data:   ', data);

    // Visual confirmation — quick flash on search button
    var btn = document.getElementById('sb-search-btn');
    if (btn) {
      btn.style.transform = 'scale(0.92)';
      setTimeout(function () { btn.style.transform = ''; }, 150);
    }

    var params = new URLSearchParams();
    params.set('query', 'Worldwide');
    if (data.checkin) params.set('checkin', data.checkin);
    if (data.checkout) params.set('checkout', data.checkout);
    if (data.totalGuests > 0) params.set('guests', data.totalGuests);
    window.location.href = '/hotels/search?' + params.toString();
  }

  // ---- Init ----
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildSearchBar);
  } else {
    buildSearchBar();
  }
})();
