// ── Tab switching for destination inspiration ──
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('.sv-dest-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      // Deactivate all tabs
      document.querySelectorAll('.sv-dest-tab').forEach(t => t.classList.remove('active'));
      // Activate clicked tab
      this.classList.add('active');
      // Hide all panels
      document.querySelectorAll('.sv-dest-panel').forEach(p => p.style.display = 'none');
      // Show target panel
      const target = this.getAttribute('data-tab');
      const panel = document.querySelector(`.sv-dest-panel[data-panel="${target}"]`);
      if (panel) panel.style.display = 'block';
    });
  });

  // Hide extra destinations initially
  document.querySelectorAll('.sv-dest-extra').forEach(el => {
    el.style.display = 'none';
  });
});

// ── Show more / Show less destinations ──
function toggleDestinations(btn) {
  const grid = btn.previousElementSibling;
  const extras = grid.querySelectorAll('.sv-dest-extra');
  const isExpanded = btn.classList.contains('expanded');

  extras.forEach(card => {
    card.style.display = isExpanded ? 'none' : 'block';
  });

  btn.classList.toggle('expanded');
  btn.innerHTML = isExpanded
    ? 'Show more <i class="fa-solid fa-chevron-down"></i>'
    : 'Show less <i class="fa-solid fa-chevron-up"></i>';
}

// ── Mobile accordion for footer columns ──
function toggleFooterCol(h5) {
  if (window.innerWidth >= 742) return; // Only on mobile
  const col = h5.parentElement;
  col.classList.toggle('open');
}
