
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const menu = document.querySelector('.dropdown-menu');

    if (!hamburger || !menu) return;

    // Initialize aria state
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-controls', menu.id || '');

    const openMenu = () => {
        menu.classList.add('open');
        hamburger.classList.add('is-active');
        hamburger.setAttribute('aria-expanded', 'true');
    };

    const closeMenu = () => {
        menu.classList.remove('open');
        hamburger.classList.remove('is-active');
        hamburger.setAttribute('aria-expanded', 'false');
    };

    const toggleMenu = (e) => {
        e.stopPropagation();
        if (menu.classList.contains('open')) closeMenu();
        else openMenu();
    };

    hamburger.addEventListener('click', toggleMenu);

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!menu.classList.contains('open')) return;
        if (e.target.closest('.dropdown-menu') || e.target.closest('.hamburger')) return;
        closeMenu();
    });

    // Close when a link inside the menu is clicked (common mobile behavior)
    menu.addEventListener('click', (e) => {
        if (e.target.closest('a')) closeMenu();
    });

    // Close on ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menu.classList.contains('open')) closeMenu();
    });

    // Optional: close on viewport resize if you want desktop to reset state
    window.addEventListener('resize', () => {
        // adjust breakpoint if needed (default 768)
        if (window.innerWidth > 768 && menu.classList.contains('open')) closeMenu();
    });
});


let cancel = document.getElementById("cl")
let errorPopup = document.querySelector(".alert-error")
let success = document.querySelector(".alert-success")
cancel.addEventListener("click", function(){
    errorPopup.style.display = "none"
})
cancel.addEventListener("click", function(){
    success.style.display = "none"
})

