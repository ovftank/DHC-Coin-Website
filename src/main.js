document.addEventListener("DOMContentLoaded", function () {
  const scrollToTopButton = document.querySelector('.scroll-to-top');
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 100) {
      scrollToTopButton.classList.remove('hidden');
      scrollToTopButton.classList.add('block');
    } else {
      scrollToTopButton.classList.add('hidden');
    }
  });
});
window.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("mobile-menu-button")
    .addEventListener("click", function () {
      document.getElementById("mobile-menu-content").classList.toggle("hidden");
    });
  const ecosystemClass = document.querySelectorAll('.ecosystem');
  window.addEventListener("scroll", function () {
    ecosystemClass.forEach((ecosystem) => {
      if (isIntoView(ecosystem)) {
        ecosystem.classList.remove('opacity-0');
        ecosystem.classList.add('opacity-100');
        ecosystem.classList.add('animate-slideUp');
      }
      else {
      }
    })
  }
  )
});
function isIntoView(el) {
  const rect = el.getBoundingClientRect();
  const elemTop = rect.top;
  const elemBottom = rect.bottom;
  const isVisible = (elemTop >= 0) && (elemBottom <= window.innerHeight);
  return isVisible;
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}