"use strict";
const gallery = document.querySelector('.gallery');
const panels = Array.from(document.querySelectorAll('.panel'));
const markers = Array.from(document.querySelectorAll('.index a'));
const previous = document.querySelector('#previous');
const next = document.querySelector('#next');
const position = document.querySelector('#position');
const mobile = window.matchMedia('(max-width: 600px)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let current = 0;
function goToPanel(index) {
    const panel = panels[index];
    if (!panel || !gallery)
        return;
    const behavior = reducedMotion.matches ? 'instant' : 'smooth';
    const inset = parseFloat(getComputedStyle(gallery).paddingLeft) || 0;
    gallery.scrollBy({ left: panel.getBoundingClientRect().left - gallery.getBoundingClientRect().left - inset, behavior });
}
function updatePosition() {
    if (!gallery)
        return;
    const inset = parseFloat(getComputedStyle(gallery).paddingLeft) || 0;
    const left = gallery.getBoundingClientRect().left + inset;
    current = panels.reduce((closest, panel, index) => Math.abs(panel.getBoundingClientRect().left - left) < Math.abs(panels[closest].getBoundingClientRect().left - left) ? index : closest, 0);
    markers.forEach((marker, index) => {
        if (index === current)
            marker.setAttribute('aria-current', 'true');
        else
            marker.removeAttribute('aria-current');
    });
    document.documentElement.style.setProperty('--gallery-progress', String(gallery.scrollLeft / Math.max(1, gallery.scrollWidth - gallery.clientWidth)));
    document.querySelectorAll('.site-header nav a').forEach(link => {
        const section = panels[current]?.id;
        const destination = link.getAttribute('href');
        const active = destination === `#${section}` || (destination === '#heal-in' && ['heal-in', 'kabeirion', 'orderit', 'employee', 'visual-work'].includes(section));
        if (active)
            link.setAttribute('aria-current', 'location');
        else
            link.removeAttribute('aria-current');
    });
    if (previous)
        previous.disabled = current === 0;
    if (next)
        next.disabled = current === panels.length - 1;
    if (position)
        position.textContent = `${String(current + 1).padStart(2, '0')} / ${String(panels.length).padStart(2, '0')}`;
}
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
        const index = panels.findIndex(panel => `#${panel.id}` === link.getAttribute('href'));
        if (index < 0)
            return;
        event.preventDefault();
        goToPanel(index);
        history.replaceState(null, '', `#${panels[index].id}`);
        // Move keyboard focus to the destination without interrupting the animation.
        panels[index].setAttribute('tabindex', '-1');
        panels[index].focus({ preventScroll: true });
    });
});
previous?.addEventListener('click', () => goToPanel(current - 1));
next?.addEventListener('click', () => goToPanel(current + 1));
gallery?.addEventListener('keydown', event => {
    if (event.target !== gallery && !panels.includes(event.target))
        return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        goToPanel(current + (event.key === 'ArrowRight' ? 1 : -1));
    }
});
let scheduled = false;
function scheduleUpdate() {
    if (scheduled)
        return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; updatePosition(); updateScrollMotion(); });
}
gallery?.addEventListener('scroll', updatePosition, { passive: true });
gallery?.addEventListener('scroll', scheduleUpdate, { passive: true });
document.addEventListener('scroll', scheduleUpdate, { passive: true, capture: true });
// A mouse wheel moves between sections; the project collection keeps vertical gestures.
gallery?.addEventListener('wheel', event => {
    if (event.ctrlKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY))
        return;
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest('.visual-content'))
        return;
    event.preventDefault();
    const unit = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 16 : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? gallery.clientWidth : 1;
    gallery.scrollLeft += event.deltaY * unit;
}, { passive: false });
document.querySelector('.visual-content')?.addEventListener('scroll', scheduleUpdate, { passive: true });
window.addEventListener('scroll', scheduleUpdate, { passive: true });
window.addEventListener('resize', scheduleUpdate);
window.addEventListener('pageshow', scheduleUpdate);
window.addEventListener('hashchange', scheduleUpdate);
updatePosition();
// CV download uses the PDF in the assets folder.
const contactLinks = {
    instagram: 'https://www.instagram.com/stamatis.asv/',
    linkedin: 'https://www.linkedin.com/in/stamatis-asvestas-7791b1438/',
    cv: 'assets/CVAsvestas.pdf',
};
document.querySelectorAll('[data-contact]').forEach(link => {
    const url = contactLinks[link.dataset.contact || ''];
    if (!url)
        return;
    link.href = url;
    link.removeAttribute('aria-disabled');
    if (link.dataset.contact !== 'cv') {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
    }
});
const emailButton = document.querySelector('.contact-email');
const emailAddress = document.querySelector('.email-address');
const copyStatus = document.querySelector('#copy-status');
const email = emailButton?.dataset.email?.trim();
let copyTimer;
let copying = false;
if (emailButton && emailAddress && email) {
    emailAddress.textContent = 'Email';
    emailButton.disabled = false;
    emailButton.setAttribute('aria-label', `Copy email address: ${email}`);
    emailButton.addEventListener('click', async () => {
        if (copying)
            return;
        copying = true;
        clearTimeout(copyTimer);
        try {
            await navigator.clipboard.writeText(email);
            emailButton.classList.add('is-copied');
            if (copyStatus)
                copyStatus.textContent = 'Email address copied to clipboard.';
            copyTimer = setTimeout(() => {
                emailButton.classList.remove('is-copied');
                if (copyStatus)
                    copyStatus.textContent = '';
            }, 1800);
        }
        catch {
            emailButton.classList.remove('is-copied');
            if (copyStatus)
                copyStatus.textContent = 'Could not copy automatically. Opening your email app.';
            window.location.href = `mailto:${email}`;
        }
        finally {
            copying = false;
        }
    });
}
const aboutDetails = document.querySelector('.about-details');
const aboutScroll = document.querySelector('.about-scroll');
if (aboutDetails && aboutScroll) {
    const updateAboutScroll = () => {
        const atBottom = aboutDetails.scrollTop + aboutDetails.clientHeight >= aboutDetails.scrollHeight - 2;
        aboutScroll.disabled = atBottom;
        aboutScroll.innerHTML = atBottom ? 'All caught up <span aria-hidden="true">✓</span>' : 'Scroll down <span aria-hidden="true">↓</span>';
    };
    aboutScroll.addEventListener('click', () => {
        aboutDetails.scrollBy({ top: aboutDetails.clientHeight * 0.65, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    });
    aboutDetails.addEventListener('scroll', updateAboutScroll, { passive: true });
    new ResizeObserver(updateAboutScroll).observe(aboutDetails);
    updateAboutScroll();
}
// Replay a gentle entrance only when a panel comes into view.
const panelObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.target.classList.toggle('is-visible', entry.isIntersecting));
}, { threshold: 0, rootMargin: '0px 0px -40px 0px' });
panels.forEach(panel => panelObserver.observe(panel));
const stories = Array.from(document.querySelectorAll('.social-story, .music-story'));
stories.forEach(story => panelObserver.observe(story));
const introSurface = document.querySelector('.intro-surface');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
introSurface?.addEventListener('pointermove', event => {
    if (reducedMotion.matches || !finePointer.matches)
        return;
    const rect = introSurface.getBoundingClientRect();
    introSurface.style.setProperty('--orb-x', `${((event.clientX - rect.left) / rect.width - 0.5) * 24}px`);
    introSurface.style.setProperty('--orb-y', `${((event.clientY - rect.top) / rect.height - 0.5) * 24}px`);
});
introSurface?.addEventListener('pointerleave', () => {
    introSurface.style.setProperty('--orb-x', '0px');
    introSurface.style.setProperty('--orb-y', '0px');
});
// Scroll changes visual scale without changing layout or intercepting gestures.
function updateScrollMotion() {
    const intro = panels[0]?.querySelector('.intro-surface');
    if (!intro)
        return;
    const travel = gallery?.scrollLeft || 0;
    const progress = reducedMotion.matches ? 1 : Math.min(1, Math.max(0, travel / Math.min(window.innerHeight * 0.4, 240)));
    intro.style.setProperty('--intro-scale', String(0.94 + progress * 0.06));
    intro.style.setProperty('--intro-radius', `${(1 - progress) * 24}px`);
    intro.style.setProperty('--orb-scale', String(1 + progress * 0.22));
    [...panels, ...stories].forEach(panel => {
        const rect = panel.getBoundingClientRect();
        const distance = (rect.left + rect.width / 2 - window.innerWidth / 2) / window.innerWidth;
        const shift = reducedMotion.matches ? 0 : Math.max(-24, Math.min(24, distance * 32));
        panel.style.setProperty('--art-shift', `${shift}px`);
        panel.style.setProperty('--collage-shift', `${mobile.matches ? 0 : shift * 0.6}px`);
        if (rect.right < 0 || rect.left > window.innerWidth || rect.bottom < 0 || rect.top > window.innerHeight) {
            panel.querySelectorAll('video').forEach(video => { if (!video.paused)
                video.pause(); });
        }
    });
}
reducedMotion.addEventListener('change', scheduleUpdate);
mobile.addEventListener('change', scheduleUpdate);
updateScrollMotion();
const projectCards = Array.from(document.querySelectorAll('.visual-project-card'));
// Reveal the depth of the collection once, then leave scrolling to the visitor.
const visualContent = document.querySelector('.visual-content');
if (visualContent) {
    let revealed = false;
    let revealTimer;
    let revealFrame = 0;
    const prepareReveal = () => {
        if (revealed || reducedMotion.matches)
            return;
        const firstMusic = visualContent.querySelector('[data-category="music"]');
        if (!firstMusic)
            return;
        const offset = firstMusic.getBoundingClientRect().top - visualContent.getBoundingClientRect().top + visualContent.scrollTop;
        visualContent.scrollTop = Math.min(offset, visualContent.scrollHeight - visualContent.clientHeight);
    };
    prepareReveal();
    const revealLayoutObserver = new ResizeObserver(prepareReveal);
    const projectGrid = visualContent.querySelector('.project-grid');
    if (projectGrid)
        revealLayoutObserver.observe(projectGrid);
    revealLayoutObserver.observe(visualContent);
    const stopReveal = () => {
        revealed = true;
        clearTimeout(revealTimer);
        cancelAnimationFrame(revealFrame);
    };
    ['pointerdown', 'touchstart', 'wheel', 'keydown'].forEach(type => {
        visualContent.addEventListener(type, stopReveal, { passive: true });
    });
    const revealObserver = new IntersectionObserver(entries => {
        const visible = entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= 0.65);
        if (!visible) {
            clearTimeout(revealTimer);
            cancelAnimationFrame(revealFrame);
            return;
        }
        if (revealed || reducedMotion.matches || document.hidden)
            return;
        clearTimeout(revealTimer);
        revealTimer = setTimeout(() => {
            if (revealed || reducedMotion.matches)
                return;
            prepareReveal();
            const startOffset = visualContent.scrollTop;
            if (startOffset <= 0)
                return;
            revealed = true;
            revealLayoutObserver.disconnect();
            let start;
            const reveal = (now) => {
                start ?? (start = now);
                const progress = Math.min(1, Math.max(0, (now - start - 180) / 2200));
                // Ease out as the first projects return into view.
                visualContent.scrollTop = startOffset * Math.pow(1 - progress, 3);
                if (progress < 1)
                    revealFrame = requestAnimationFrame(reveal);
            };
            revealFrame = requestAnimationFrame(reveal);
        }, 300);
    }, { threshold: [0, 0.65] });
    revealObserver.observe(visualContent);
    reducedMotion.addEventListener('change', () => {
        if (reducedMotion.matches)
            stopReveal();
    });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            clearTimeout(revealTimer);
            cancelAnimationFrame(revealFrame);
        }
    });
}
// Muted films loop only while visible, including clipping by the inner scroller.
const previewVideos = Array.from(document.querySelectorAll('.project-grid video'));
const visiblePreviews = new Set();
function syncPreviews() {
    previewVideos.forEach(video => {
        const card = video.closest('.visual-project-card');
        const details = video.closest('details');
        const shouldPlay = !document.hidden && visiblePreviews.has(video) && !card?.hidden && (!details || details.open);
        if (shouldPlay) {
            video.muted = true;
            if (video.paused)
                void video.play().catch(() => {
                    // Leave the poster visible if automatic playback is blocked.
                });
        }
        else
            video.pause();
    });
}
const previewObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        const video = entry.target;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.08)
            visiblePreviews.add(video);
        else
            visiblePreviews.delete(video);
    });
    syncPreviews();
}, { threshold: [0, 0.08] });
previewVideos.forEach(video => {
    video.muted = true;
    video.defaultMuted = true;
    video.controls = false;
    video.addEventListener('contextmenu', event => event.preventDefault());
    previewObserver.observe(video);
});
document.addEventListener('visibilitychange', syncPreviews);
projectCards.forEach(card => card.querySelector('details')?.addEventListener('toggle', syncPreviews));
syncPreviews();
