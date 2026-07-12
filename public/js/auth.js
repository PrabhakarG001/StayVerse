document.addEventListener('DOMContentLoaded', () => {
  const authModalEl = document.getElementById('authModal');
  const authForm = document.getElementById('authForm');
  
  if (!authModalEl) return;
  const authModal = new bootstrap.Modal(authModalEl);
  let pendingActionUrl = null;

  // Intercept links that require authentication
  document.querySelectorAll('.auth-required').forEach(el => {
    el.addEventListener('click', (e) => {
      // Check local storage for auth state
      const isLoggedIn = sessionStorage.getItem('sv_logged_in') === 'true';
      
      if (!isLoggedIn) {
        // Prevent default navigation
        e.preventDefault();
        
        // Save the intended destination
        pendingActionUrl = el.getAttribute('href');
        
        // Show the login modal instead of redirecting to the dedicated page
        document.body.classList.add('auth-host-mode');
        authModal.show();
      }
    });
  });

  // Reset host mode styling when modal is closed
  authModalEl.addEventListener('hidden.bs.modal', () => {
    document.body.classList.remove('auth-host-mode');
  });

  // ---- Simulated Auth ----
  if (authForm) {
    authForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var ident = document.getElementById('authEmail').value;
      if (ident) {
        // Basic simulated login
        sessionStorage.setItem('sv_logged_in', 'true');
        sessionStorage.setItem('sv_user', ident);
        
        // If they were trying to go somewhere specific, take them there!
        if (pendingActionUrl) {
          window.location.href = pendingActionUrl;
        } else {
          window.location.reload();
        }
      }
    });
  }

  // Update UI based on auth state
  const isLoggedIn = sessionStorage.getItem('sv_logged_in') === 'true';
  if (isLoggedIn) {
    // Find the login link in the dropdown
    const loginLink = document.querySelector('a[data-bs-target="#authModal"]');
    if (loginLink) {
      loginLink.textContent = 'Log out';
      loginLink.removeAttribute('data-bs-toggle');
      loginLink.removeAttribute('data-bs-target');
      loginLink.addEventListener('click', function(e) {
        e.preventDefault();
        sessionStorage.removeItem('sv_logged_in');
        sessionStorage.removeItem('sv_user');
        window.location.reload();
      });
    }
  }
});
