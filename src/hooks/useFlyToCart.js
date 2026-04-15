/**
 * Fires a tiny image that "flies" from the modal centre to the cart icon.
 * Returns a trigger function: flyToCart(imageSrc)
 */
export function useFlyToCart() {
  function flyToCart(imgSrcUrl) {
    const cartIcon = document.querySelector('.cart-icon-btn');
    if (!cartIcon || !imgSrcUrl) return;

    const { left, top, width, height } = cartIcon.getBoundingClientRect();
    const cx = left + width  / 2;
    const cy = top  + height / 2;

    const img    = document.createElement('img');
    img.src       = imgSrcUrl;
    img.className = 'fly-particle';

    const sx = window.innerWidth  / 2 - 21;
    const sy = window.innerHeight / 2 - 80;
    img.style.left = `${sx}px`;
    img.style.top  = `${sy}px`;
    img.style.setProperty('--fx', `${cx - sx}px`);
    img.style.setProperty('--fy', `${cy - sy}px`);

    document.body.appendChild(img);
    img.addEventListener('animationend', () => img.remove());
  }

  return flyToCart;
}
