document.addEventListener("DOMContentLoaded", () => {
  // Saare testimonial cards ko select kiya
  const testimonialCards = document.querySelectorAll('.dochaki-t-card');

  // Har ek card ke liye alag se slider logic chalega
  testimonialCards.forEach((card) => {
    const prevBtn = card.querySelector('.dochaki-btn-prev');
    const nextBtn = card.querySelector('.dochaki-btn-next');
    const dots = card.querySelectorAll('.dochaki-dot');
    const img = card.querySelector('.dochaki-t-img');

    // 1. Pehli image vahi jo HTML ke `src` me hai
    const firstImg = img.src; 
    
    // 2. Dusri image hum dynamic tarike se HTML data-attribute se uthayenge (agar di ho),
    // nahi toh fallback ke liye ek dynamic logic laga diya hai taaki mix-up na ho.
    const secondImg = img.getAttribute('data-secondary') || firstImg;

    // Har card ki apni khud ki do images ka array
    const images = [firstImg, secondImg];
    let currentIndex = 0;

    // Function: UI update karne ke liye (Image + Dots)
    function updateCarousel(index) {
      // Index bound check
      if (index >= images.length) currentIndex = 0;
      else if (index < 0) currentIndex = images.length - 1;
      else currentIndex = index;

      // Image source update
      img.src = images[currentIndex];

      // Active dot state update
      dots.forEach((dot, i) => {
        if (i === currentIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }

    // Next Button Click
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        updateCarousel(currentIndex + 1);
      });
    }

    // Prev Button Click
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        updateCarousel(currentIndex - 1);
      });
    }

    // Dots Click functionality
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        updateCarousel(index);
      });
    });
  });
});

// REFINED DMOTECH LIGHTBOX CONTROLLER
function motoLaunchVideo(id) {
    const box = document.getElementById("motoVideoModal");
    const frame = document.getElementById("motoModalIframe");
    
    if (box && frame) {
        frame.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
        box.classList.add("active-view");
        document.body.style.overflow = "hidden"; // Multi-scroll freeze
    }
}

function motoDismissVideo() {
    const box = document.getElementById("motoVideoModal");
    const frame = document.getElementById("motoModalIframe");
    
    if (box && frame) {
        box.classList.remove("active-view");
        frame.src = ""; 
        document.body.style.overflow = "auto"; // Restore window flow
    }
}

// Piyush@1235223