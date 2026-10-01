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
    if (mobile.matches) {
        panel.scrollIntoView({ behavior, block: 'start' });
    }
    else {
        const inset = parseFloat(getComputedStyle(gallery).scrollPaddingLeft) || 0;
        gallery.scrollTo({ left: gallery.scrollLeft + panel.getBoundingClientRect().left - gallery.getBoundingClientRect().left - inset, behavior });
    }
}
function updatePosition() {
    if (!gallery)
        return;
    const inset = mobile.matches ? 20 : (parseFloat(getComputedStyle(gallery).scrollPaddingLeft) || 0);
    let closest = Infinity;
    panels.forEach((panel, index) => {
        const rect = panel.getBoundingClientRect();
        const distance = Math.abs((mobile.matches ? rect.top : rect.left) - inset);
        if (distance < closest) {
            closest = distance;
            current = index;
        }
    });
    markers.forEach((marker, index) => {
        if (index === current)
            marker.setAttribute('aria-current', 'true');
        else
            marker.removeAttribute('aria-current');
    });
    document.documentElement.style.setProperty('--gallery-progress', String((current + 1) / panels.length));
    document.querySelectorAll('.site-header nav a').forEach(link => {
        const section = panels[current]?.id;
        const destination = link.getAttribute('href');
        const active = destination === `#${section}` || (destination === '#heal-in' && ['heal-in', 'orderit', 'kabeirion', 'employee'].includes(section));
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
    if (mobile.matches || event.target !== gallery)
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
    requestAnimationFrame(() => { updatePosition(); updateScrollMotion(); scheduled = false; });
}
gallery?.addEventListener('scroll', scheduleUpdate, { passive: true });
window.addEventListener('scroll', scheduleUpdate, { passive: true });
window.addEventListener('resize', scheduleUpdate);
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
}, { threshold: 0.2 });
panels.forEach(panel => panelObserver.observe(panel));
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
    const travel = Math.max(window.scrollY, mobile.matches ? 0 : (gallery?.scrollLeft || 0));
    const progress = reducedMotion.matches ? 1 : Math.min(1, Math.max(0, travel / Math.min(window.innerHeight * 0.4, 240)));
    intro.style.setProperty('--intro-scale', String(0.94 + progress * 0.06));
    intro.style.setProperty('--intro-radius', `${(1 - progress) * 24}px`);
    intro.style.setProperty('--orb-scale', String(1 + progress * 0.22));
    panels.forEach(panel => {
        const rect = panel.getBoundingClientRect();
        const distance = mobile.matches
            ? (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight
            : (rect.left + rect.width / 2 - window.innerWidth / 2) / window.innerWidth;
        const shift = reducedMotion.matches ? 0 : Math.max(-24, Math.min(24, distance * 32));
        panel.style.setProperty('--art-shift', `${shift}px`);
    });
}
reducedMotion.addEventListener('change', scheduleUpdate);
mobile.addEventListener('change', scheduleUpdate);
updateScrollMotion();
