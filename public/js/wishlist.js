// Wishlist Local Storage Management

const WISHLIST_KEY = 'stayverse_wishlists';

// Initialize wishlist if not exists
function getWishlists() {
  const data = localStorage.getItem(WISHLIST_KEY);
  return data ? JSON.parse(data) : [];
}

function toggleWishlist(event, propertyId, name, location, price, rating, imageUrl, isPremium) {
  event.preventDefault();
  event.stopPropagation();
  
  const icon = event.currentTarget;
  let wishlists = getWishlists();
  
  // Check if exists
  const existsIndex = wishlists.findIndex(h => h.propertyId === propertyId);
  
  if (existsIndex > -1) {
    // Remove from wishlist
    wishlists.splice(existsIndex, 1);
    icon.classList.replace('fa-solid', 'fa-regular');
    icon.classList.remove('text-danger');
    icon.classList.add('text-white');
  } else {
    // Add to wishlist
    wishlists.push({ propertyId, name, location, price, rating, imageUrl, isPremium });
    icon.classList.replace('fa-regular', 'fa-solid');
    icon.classList.remove('text-white');
    icon.classList.add('text-danger');
  }
  
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlists));
}

// On page load, highlight all hearts that are in wishlist
document.addEventListener('DOMContentLoaded', () => {
  const wishlists = getWishlists();
  const wishlistIds = new Set(wishlists.map(h => h.propertyId.toString()));
  
  document.querySelectorAll('.heart-wishlist-icon').forEach(icon => {
    const propertyId = icon.getAttribute('data-id');
    if (wishlistIds.has(propertyId.toString())) {
      icon.classList.replace('fa-regular', 'fa-solid');
      icon.classList.remove('text-white');
      icon.classList.add('text-danger');
    }
  });
});
