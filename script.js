const header = document.querySelector('.site-header');
const toggle = header.querySelector('.menu-toggle');
const menu = header.querySelector('.header-menu');
const mobileViewport = window.matchMedia('(max-width: 1023px)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let closeTimer;
let pageScroll;

function syncPageScrolling() {
    if (reducedMotion.matches || typeof window.Lenis !== 'function') {
        pageScroll?.destroy();
        pageScroll = undefined;
        return;
    }

    if (pageScroll) return;

    // Match the reference site's Lenis 1.3.1 defaults for wheel smoothing.
    pageScroll = new Lenis({
        autoRaf: true,
        smoothWheel: true,
        lerp: 0.1,
        wheelMultiplier: 1,
        syncTouch: false,
        prevent: (node) => mobileViewport.matches && node === menu,
    });
}

reducedMotion.addEventListener('change', syncPageScrolling);
syncPageScrolling();

function setMenuOpen(open, { restoreFocus = false, animate = true } = {}) {
    window.clearTimeout(closeTimer);
    menu.removeAttribute('data-opening');
    menu.removeAttribute('data-closing');
    toggle.setAttribute('aria-expanded', String(open));
    menu.inert = !open;

    if (open) {
        menu.hidden = false;
        if (animate && !reducedMotion.matches) menu.setAttribute('data-opening', '');
    } else if (animate && !reducedMotion.matches && !menu.hidden) {
        menu.setAttribute('data-closing', '');
        closeTimer = window.setTimeout(() => {
            menu.hidden = true;
            menu.removeAttribute('data-closing');
        }, 300);
    } else {
        menu.hidden = true;
    }

    if (restoreFocus) toggle.focus();
}

function syncViewport() {
    const focusWasInMenu = menu.contains(document.activeElement);
    const focusWasOnToggle = document.activeElement === toggle;
    window.clearTimeout(closeTimer);
    menu.removeAttribute('data-opening');
    menu.removeAttribute('data-closing');
    toggle.hidden = !mobileViewport.matches;
    toggle.setAttribute('aria-expanded', 'false');
    menu.hidden = mobileViewport.matches;
    menu.inert = mobileViewport.matches;

    // Keep reading and keyboard order aligned with each layout.
    if (mobileViewport.matches) {
        menu.parentElement.append(menu);
        if (focusWasInMenu) toggle.focus();
    } else {
        menu.parentElement.prepend(menu);
        if (focusWasOnToggle) header.querySelector('.header-brand').focus();
    }
}

toggle.addEventListener('click', () => {
    setMenuOpen(toggle.getAttribute('aria-expanded') !== 'true');
});

header.addEventListener('keydown', (event) => {
    if (!mobileViewport.matches) return;
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        event.preventDefault();
        setMenuOpen(false, { restoreFocus: true });
    }
    if (event.key === 'ArrowDown' && event.target === toggle) {
        event.preventDefault();
        setMenuOpen(true);
        menu.querySelector('a').focus();
    }
});

document.addEventListener('click', (event) => {
    if (mobileViewport.matches && !header.contains(event.target)) setMenuOpen(false);
});

header.addEventListener('focusout', () => {
    window.setTimeout(() => {
        if (mobileViewport.matches && !header.contains(document.activeElement)) setMenuOpen(false);
    }, 0);
});

// Empty href values are intentional. Filling one in activates that link.
document.addEventListener('click', (event) => {
    const link = event.target.closest('a[aria-disabled="true"]');
    if (link?.getAttribute('href') === '') event.preventDefault();
});

mobileViewport.addEventListener('change', syncViewport);
syncViewport();

const menuHeading = document.querySelector('.menu-heading');

if (menuHeading && 'IntersectionObserver' in window && !reducedMotion.matches) {
    menuHeading.dataset.reveal = 'pending';
    const headingObserver = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
            menuHeading.dataset.reveal = 'visible';
            headingObserver.disconnect();
        }
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

    headingObserver.observe(menuHeading);
    reducedMotion.addEventListener('change', (event) => {
        if (event.matches) {
            menuHeading.dataset.reveal = 'visible';
            headingObserver.disconnect();
        }
    });
}
