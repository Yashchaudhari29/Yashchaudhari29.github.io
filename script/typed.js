var options = {
  strings: ["Welcome To My page!",
    "I am a Python Dev🐍",
    "I am a Django Dev😋",
    "I am a ML Dev",
    "I am an enthusiastic Techie!✍🏻",
    "Thanks for visiting my page!🙏🏻"
  ],
  typeSpeed: 15,
  backSpeed: 25,
  backDelay: 1500,
  loop: true
};

var typed = new Typed('.multiple-filed', options);



document.addEventListener("DOMContentLoaded", function () {
  var menuItems = document.querySelectorAll('.menu-item');
  // menuItems
  for (var i = 0; i < menuItems.length; i++) {
    menuItems[i].addEventListener("click", function () {
      var currentActive = document.querySelector('.menu-item.act');
      console.log(menuItems[i])
      if (currentActive) {
        currentActive.classList.remove("act");
      }
      this.classList.add("act");
    });
  }
});


