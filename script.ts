const gallery = document.querySelector<HTMLElement>('.gallery');
const panels = Array.from(document.querySelectorAll<HTMLElement>('.panel'));
const markers = Array.from(document.querySelectorAll<HTMLAnchorElement>('.index a'));
const previous = document.querySelector<HTMLButtonElement>('#previous');
const next = document.querySelector<HTMLButtonElement>('#next');
const position = document.querySelector<HTMLElement>('#position');
const mobile = window.matchMedia('(max-width: 600px)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let current = 0;

function goToPanel(index: number) {
  const panel = panels[index];
  if (!panel || !gallery) return;
  const behavior = reducedMotion.matches ? 'instant' : 'smooth';
  if (mobile.matches) {
    panel.scrollIntoView({ behavior, block: 'start' });
  } else {
    const inset = parseFloat(getComputedStyle(gallery).scrollPaddingLeft) || 0;
    gallery.scrollTo({ left: gallery.scrollLeft + panel.getBoundingClientRect().left - gallery.getBoundingClientRect().left - inset, behavior });
  }
}

function updatePosition() {
  if (!gallery) return;
  const inset = mobile.matches ? 20 : (parseFloat(getComputedStyle(gallery).scrollPaddingLeft) || 0);
  let closest = Infinity;
  panels.forEach((panel, index) => {
    const rect = panel.getBoundingClientRect();
    const distance = Math.abs((mobile.matches ? rect.top : rect.left) - inset);
    if (distance < closest) { closest = distance; current = index; }
  });
  markers.forEach((marker, index) => {
    if (index === current) marker.setAttribute('aria-current', 'true');
    else marker.removeAttribute('aria-current');
  });
  if (previous) previous.disabled = current === 0;
  if (next) next.disabled = current === panels.length - 1;
  if (position) position.textContent = `${String(current + 1).padStart(2, '0')} / ${String(panels.length).padStart(2, '0')}`;
}

document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(link => {
  link.addEventListener('click', event => {
    const index = panels.findIndex(panel => `#${panel.id}` === link.getAttribute('href'));
    if (index < 0) return;
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
  if (mobile.matches || event.target !== gallery) return;
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault();
    goToPanel(current + (event.key === 'ArrowRight' ? 1 : -1));
  }
});
let scheduled = false;
function scheduleUpdate() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => { updatePosition(); scheduled = false; });
}
gallery?.addEventListener('scroll', scheduleUpdate, { passive: true });
window.addEventListener('scroll', scheduleUpdate, { passive: true });
window.addEventListener('resize', scheduleUpdate);
updatePosition();

// Place your PDF at assets/stamatis-asvestas-cv.pdf to enable the CV download.
const contactLinks: Record<string, string> = {
  instagram: 'https://www.instagram.com/stamatis.asv/',
  linkedin: 'https://www.linkedin.com/in/stamatis-asvestas-7791b1438/',
  cv: 'assets/stamatis-asvestas-cv.pdf',
};
document.querySelectorAll<HTMLAnchorElement>('[data-contact]').forEach(link => {
  const url = contactLinks[link.dataset.contact || ''];
  if (!url) return;
  link.href = url;
  link.removeAttribute('aria-disabled');
  if (link.dataset.contact !== 'cv') {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }
});

const emailButton = document.querySelector<HTMLButtonElement>('.contact-email');
const emailAddress = document.querySelector<HTMLElement>('.email-address');
const copyStatus = document.querySelector<HTMLElement>('#copy-status');
const email = emailButton?.dataset.email?.trim();
let copyTimer: ReturnType<typeof setTimeout> | undefined;
let copying = false;
if (emailButton && emailAddress && email) {
  emailAddress.textContent = email;
  emailButton.disabled = false;
  emailButton.setAttribute('aria-label', `Copy email address: ${email}`);
  emailButton.addEventListener('click', async () => {
    if (copying) return;
    copying = true;
    clearTimeout(copyTimer);
    try {
      await navigator.clipboard.writeText(email);
      emailButton.classList.add('is-copied');
      if (copyStatus) copyStatus.textContent = 'Email address copied to clipboard.';
      copyTimer = setTimeout(() => {
        emailButton.classList.remove('is-copied');
        if (copyStatus) copyStatus.textContent = '';
      }, 1800);
    } catch {
      emailButton.classList.remove('is-copied');
      if (copyStatus) copyStatus.textContent = `Could not copy automatically. Email: ${email}`;
      // Keep the address available for manual copying if clipboard access is denied.
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(emailAddress);
      selection?.removeAllRanges();
      selection?.addRange(range);
    } finally {
      copying = false;
    }
  });
}
