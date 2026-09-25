// Sweet Miles Club — zajednička skripta za cijeli web.
// Godina u footeru + otvaranje i zatvaranje mobilne navigacije.

document.getElementById('year').textContent = new Date().getFullYear();

const navToggle = document.getElementById('navToggle');
const navCloseInner = document.getElementById('navCloseInner');
const mobileNav = document.getElementById('mobileNav');

function closeMobileNav(){
  document.body.classList.remove('mobile-nav-open');
  navToggle.setAttribute('aria-expanded', 'false');
}
function openMobileNav(){
  document.body.classList.add('mobile-nav-open');
  navToggle.setAttribute('aria-expanded', 'true');
}
navToggle.addEventListener('click', () => {
  document.body.classList.contains('mobile-nav-open') ? closeMobileNav() : openMobileNav();
});
navCloseInner.addEventListener('click', closeMobileNav);
mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileNav));
