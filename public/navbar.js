

document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const menu = document.querySelector('.menu');
    
    hamburger.addEventListener('click', () => {
        menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    });

    // Check if menu was previously open (e.g., from a different page)
    const wasMenuOpen = localStorage.getItem('menuOpen');
    if (wasMenuOpen === 'true') {
        menu.style.display = 'block'; 
        localStorage.removeItem('menuOpen'); // Reset for the next page load
    }

    // Save menu state before page unload/reload
    window.addEventListener('beforeunload', () => {
        localStorage.setItem('menuOpen', menu.style.display === 'block');
    });
});