const header = document.querySelector('.cabecalho');
const toggle = header.querySelector('.botao-menu');
const menu = header.querySelector('.menu-topo');
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

    if (mobileViewport.matches) {
        menu.parentElement.append(menu);
        if (focusWasInMenu) toggle.focus();
    } else {
        menu.parentElement.prepend(menu);
        if (focusWasOnToggle) header.querySelector('.marca-topo').focus();
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

document.addEventListener('click', (event) => {
    const link = event.target.closest('a[aria-disabled="true"]');
    if (link?.getAttribute('href') === '') event.preventDefault();
});

mobileViewport.addEventListener('change', syncViewport);
syncViewport();

const menuHeading = document.querySelector('.chamada-cardapio');

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

const traditionSection = document.querySelector('.tradicao');

const menuSelectionBody = document.querySelector('.conteudo-opcoes');
const siteFooter = document.querySelector('.rodape');

if (menuSelectionBody) {
    let surfaceFrame;

    function updateHeaderSurface() {
        surfaceFrame = undefined;
        const panel = menuSelectionBody.getBoundingClientRect();
        const headerTop = header.getBoundingClientRect().top;
        const footer = siteFooter?.getBoundingClientRect();
        header.dataset.surface = footer && footer.top <= headerTop && footer.bottom > headerTop
            ? 'black'
            : panel.top <= headerTop && panel.bottom > headerTop ? 'white' : 'default';
    }

    function queueHeaderSurface() {
        if (surfaceFrame === undefined) surfaceFrame = requestAnimationFrame(updateHeaderSurface);
    }

    window.addEventListener('scroll', queueHeaderSurface, { passive: true });
    window.addEventListener('resize', queueHeaderSurface);
    document.fonts.ready.then(queueHeaderSurface);
    queueHeaderSurface();
}

if (traditionSection) {
    const stage = traditionSection.querySelector('.area-tradicao');
    const title = traditionSection.querySelector('#titulo-tradicao');
    const ring = traditionSection.querySelector('.destaque-tradicao');
    const foreground = traditionSection.querySelector('.frente-tradicao');
    const video = traditionSection.querySelector('video');
    const videoWrap = traditionSection.querySelector('.area-video');
    const videoToggle = traditionSection.querySelector('.botao-video');
    const pauseIcon = videoToggle.querySelector('.icone-pausar');
    const playIcon = videoToggle.querySelector('.icone-reproduzir');
    let frame;
    let videoInView = false;
    let userPausedVideo = false;

    function updateTraditionFrame() {
        frame = undefined;
        const motionEnabled = traditionSection.dataset.motion === 'enabled';
        const viewportHeight = stage.clientHeight;
        const travel = Math.max(1, traditionSection.offsetHeight - viewportHeight);
        const progress = motionEnabled
            ? Math.min(1, Math.max(0, -traditionSection.getBoundingClientRect().top / travel))
            : 0;

        traditionSection.style.setProperty('--tradition-shift', `${-progress * viewportHeight}px`);
        traditionSection.style.setProperty('--tradition-controls-opacity', motionEnabled ? String(Math.min(1, progress / 0.6)) : '1');
        foreground.inert = motionEnabled && progress >= 0.99;
        videoToggle.inert = motionEnabled && progress < 0.1;
    }

    function queueTraditionFrame() {
        if (frame === undefined) frame = requestAnimationFrame(updateTraditionFrame);
    }

    function updateVideoButton() {
        videoToggle.setAttribute('aria-label', video.paused ? 'Reproduzir vídeo' : 'Pausar vídeo');
        pauseIcon.toggleAttribute('hidden', video.paused);
        playIcon.toggleAttribute('hidden', !video.paused);
    }

    function syncTraditionPlayback() {
        if (videoInView && !reducedMotion.matches && !userPausedVideo) {
            video.play().catch(updateVideoButton);
        } else {
            video.pause();
        }
    }

    function syncTraditionMotion() {
        traditionSection.dataset.motion = reducedMotion.matches ? 'disabled' : 'enabled';
        if (reducedMotion.matches) {
            traditionSection.dataset.textRevealed = 'true';
            traditionSection.dataset.ringRevealed = 'true';
        }
        queueTraditionFrame();
        syncTraditionPlayback();
    }

    video.muted = true;
    video.controls = false;
    video.tabIndex = -1;
    videoToggle.hidden = false;
    video.addEventListener('play', updateVideoButton);
    video.addEventListener('pause', updateVideoButton);
    videoToggle.addEventListener('click', () => {
        userPausedVideo = !video.paused;
        if (video.paused) video.play().catch(updateVideoButton);
        else video.pause();
    });

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                if (entry.target === title) traditionSection.dataset.textRevealed = 'true';
                if (entry.target === ring) traditionSection.dataset.ringRevealed = 'true';
                observer.unobserve(entry.target);
            }
        }, { threshold: 0.01 });
        revealObserver.observe(title);
        revealObserver.observe(ring);

        const videoObserver = new IntersectionObserver(([entry]) => {
            videoInView = entry.isIntersecting;
            syncTraditionPlayback();
        }, { threshold: 0.01 });
        videoObserver.observe(videoWrap);
    } else {
        traditionSection.dataset.textRevealed = 'true';
        traditionSection.dataset.ringRevealed = 'true';
    }

    window.addEventListener('scroll', queueTraditionFrame, { passive: true });
    window.addEventListener('resize', queueTraditionFrame);
    reducedMotion.addEventListener('change', syncTraditionMotion);
    document.fonts.ready.then(queueTraditionFrame);
    syncTraditionMotion();
    updateVideoButton();
}
