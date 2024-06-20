var options = {
  strings: [
    '<span class="typed-python">Python</span>', 
    '<span class="typed-ml">ML</span>',
    '<span class="typed-ds">Data Science</span>',
    '<span class="typed-django">Django</span>', 
    '<span class="typed-laravel">Laravel</span>',
    '<span class="typed-html">HTML</span>,<span class="typed-css">CSS</span>,<span class="typed-js">JS</span>',
    '<span class="typed-mongo">MongoDB</span>',
    '<span class="typed-sql">MySQL</span>',
    '<span class="typed-pbi">PowerBI</span>',
    
  ],
  typeSpeed: 50,
  backSpeed: 10,
  backDelay: 2000,
  loop: true
};


var typed = new Typed('.multiple-filed', options);

window.onscroll = function() {
  var winScroll = document.body.scrollTop || document.documentElement.scrollTop;
  var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  var scrolled = (winScroll / height) * 100;
  document.getElementById("progressBar").style.width = scrolled + "%";
};


document.addEventListener("DOMContentLoaded", function() {
  var menuItems = document.querySelectorAll('.menu-item');
  var sections = document.querySelectorAll('section');
  var firstSection = document.getElementById('home');

  window.addEventListener('load', function() {
    scrollToSection(firstSection);
  });
  
  window.addEventListener('scroll', function() {
    var currentSection = getCurrentSection();
    updateActiveMenuItem(currentSection);
  });

  for (var i = 0; i < menuItems.length; i++) {
    menuItems[i].addEventListener("click", function(event) {
      event.preventDefault();
      updateActiveMenuItem(this.querySelector('a').getAttribute('href').substring(1));
      scrollToSection(document.getElementById(this.querySelector('a').getAttribute('href').substring(1)));
    });
  }

  function getCurrentSection() {
    var currentPosition = window.pageYOffset + window.innerHeight / 2;
    for (var i = sections.length - 1; i >= 0; i--) {
      var section = sections[i];
      var sectionTop = section.offsetTop;
      var sectionHeight = section.offsetHeight;
      if (currentPosition >= sectionTop && currentPosition < sectionTop + sectionHeight) {
        return section.id;
      }
    }
    return null;
  }

  function updateActiveMenuItem(sectionId) {
    var activeLinkItem = document.querySelector(`.menu-item a[href="#${sectionId}"]`);
    var currentActive = document.querySelector('.menu-item.act');
    if (currentActive && activeLinkItem && currentActive !== activeLinkItem.parentNode) {
      currentActive.classList.remove("act");
      activeLinkItem.parentNode.classList.add("act");
    }
  }

  function scrollToSection(section) {
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }
});