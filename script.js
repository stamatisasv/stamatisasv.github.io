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
    requestAnimationFrame(() => { updatePosition(); scheduled = false; });
}
gallery?.addEventListener('scroll', scheduleUpdate, { passive: true });
window.addEventListener('scroll', scheduleUpdate, { passive: true });
window.addEventListener('resize', scheduleUpdate);
updatePosition();
