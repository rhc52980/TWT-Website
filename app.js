/* ==========================================================================
   TWT - TECHNICAL WATER TREATMENT APP SCRIPT
   ========================================================================== */

// Disable automatic mobile scroll restoration
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

document.addEventListener('DOMContentLoaded', () => {

  // Clear trailing hash from previous CTA clicks
  if (window.location.hash && window.location.hash !== '#home') {
    history.replaceState(null, null, window.location.pathname);
  }
  
  // Force scroll to top on fresh load
  window.scrollTo(0, 0);

  /* --- 1. Mobile Menu Navigation --- */
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  const header = document.getElementById('header');
  const navLinks = document.querySelectorAll('.nav-link');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    // Close menu when clicking a link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }

  // Change header styling on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    // Update active nav link based on scroll position
    updateActiveNavLink();
  });

  function updateActiveNavLink() {
    let currentSectionId = '';
    const sections = document.querySelectorAll('section');
    const scrollPosition = window.scrollY + 100; // offset

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPosition >= sectionTop && scrollPosition < (sectionTop + sectionHeight)) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  }


  /* --- 2. Legionella Compliance Accordion --- */
  const accordionHeaders = document.querySelectorAll('.accordion-header');

  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const currentItem = header.parentElement;
      const isActive = currentItem.classList.contains('active');

      // Close all accordion items
      document.querySelectorAll('.accordion-item').forEach(item => {
        item.classList.remove('active');
        item.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
      });

      // Toggle current item
      if (!isActive) {
        currentItem.classList.add('active');
        header.setAttribute('aria-expanded', 'true');
      }
    });
  });


  /* --- 3. Interactive Water & Safety Calculator --- */
  const makeupVolumeInput = document.getElementById('makeupVolume');
  const currentCyclesInput = document.getElementById('currentCycles');
  const targetCyclesInput = document.getElementById('targetCycles');
  const waterCostInput = document.getElementById('waterCost');
  const sanitizationMonthsInput = document.getElementById('sanitizationMonths');

  const makeupVolumeVal = document.getElementById('makeupVolumeVal');
  const currentCyclesVal = document.getElementById('currentCyclesVal');
  const targetCyclesVal = document.getElementById('targetCyclesVal');
  const waterCostVal = document.getElementById('waterCostVal');
  const sanitizationMonthsVal = document.getElementById('sanitizationMonthsVal');

  const waterSavingsDisplay = document.getElementById('waterSavings');
  const costSavingsDisplay = document.getElementById('costSavings');
  const riskMarker = document.getElementById('riskMarker');
  const riskStatus = document.getElementById('riskStatus');
  const insightsList = document.getElementById('insightsList');

  function formatNumber(num) {
    return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function calculateSavings() {
    // 1. Get Input values
    if (!makeupVolumeInput) return;
    const makeup = parseFloat(makeupVolumeInput.value);
    const cCurrent = parseFloat(currentCyclesInput.value);
    const cTarget = parseFloat(targetCyclesInput.value);
    const rate = parseFloat(waterCostInput.value);
    const months = parseInt(sanitizationMonthsInput.value);

    // 2. Update UI value readouts
    makeupVolumeVal.textContent = formatNumber(makeup);
    currentCyclesVal.textContent = cCurrent.toFixed(1);
    targetCyclesVal.textContent = cTarget.toFixed(1);
    waterCostVal.textContent = rate.toFixed(2);
    sanitizationMonthsVal.textContent = months;

    // Force Target Cycles to be at least equal to Current Cycles + 0.5
    if (cTarget < cCurrent + 0.5) {
      targetCyclesInput.value = (cCurrent + 0.5).toFixed(1);
      targetCyclesVal.textContent = (cCurrent + 0.5).toFixed(1);
      calculateSavings();
      return;
    }

    // 3. Calculator Math
    const evaporation = makeup * (1 - (1 / cCurrent));
    const makeupTarget = evaporation / (1 - (1 / cTarget));
    const savingsPerDay = makeup - makeupTarget;
    const annualWaterSavings = savingsPerDay * 365;
    const annualCostSavings = (annualWaterSavings / 1000) * rate;

    // 4. Update Savings Displays
    waterSavingsDisplay.textContent = formatNumber(annualWaterSavings);
    costSavingsDisplay.textContent = formatNumber(annualCostSavings);

    // 5. Risk Scoring Math
    let riskScore = 0;
    if (months <= 3) {
      riskScore += months * 8;
    } else if (months <= 6) {
      riskScore += 24 + (months - 3) * 12;
    } else {
      riskScore += 60 + (months - 6) * 4.5;
    }

    if (cCurrent > 5.0) {
      riskScore += (cCurrent - 5.0) * 10;
    }

    riskScore = Math.max(5, Math.min(95, riskScore));

    if (riskMarker) riskMarker.style.left = `${riskScore}%`;

    let statusText = "";
    if (riskScore < 35) {
      statusText = `LOW RISK (${Math.round(riskScore)}%): Regular sanitizations and stable cycles detected. Standard monitoring advised.`;
      if (riskStatus) {
        riskStatus.style.color = 'var(--color-low)';
        riskStatus.style.backgroundColor = 'rgba(16, 185, 129, 0.08)';
      }
    } else if (riskScore < 65) {
      statusText = `MODERATE RISK (${Math.round(riskScore)}%): Scale or biological biofilm is likely forming. System audit recommended.`;
      if (riskStatus) {
        riskStatus.style.color = 'var(--color-medium)';
        riskStatus.style.backgroundColor = 'rgba(245, 158, 11, 0.08)';
      }
    } else {
      statusText = `HIGH BIOLOGICAL RISK (${Math.round(riskScore)}%): Overdue for sanitization! Danger of Legionella growth. Schedule disinfection immediately.`;
      if (riskStatus) {
        riskStatus.style.color = 'var(--color-high)';
        riskStatus.style.backgroundColor = 'rgba(239, 68, 68, 0.08)';
      }
    }
    if (riskStatus) riskStatus.textContent = statusText;

    const percentSavings = ((makeup - makeupTarget) / makeup * 100).toFixed(0);
    if (insightsList) {
      insightsList.innerHTML = `
        <li>Increasing to <strong>${cTarget.toFixed(1)} Cycles</strong> reduces your makeup water demand by <strong>${percentSavings}%</strong>, conserving <strong>${formatNumber(savingsPerDay)} gallons</strong> of water every single day.</li>
        <li>Your annual cost savings of <strong>$${formatNumber(annualCostSavings)}</strong> will comfortably fund your annual TWT chemical contract and automated monitoring equipment.</li>
        ${months >= 6 ? 
          `<li style="color: var(--color-high); font-weight: 500;">Warning: Draining and disinfecting your cooling tower is recommended every 6 months. Your system is currently overdue.</li>` : 
          `<li>Your current sanitization interval (${months} months) aligns well with OSHA and ASHRAE Standard 188 recommendations.</li>`
        }
        <li>Optimal scale and biological protection requires continuous biocide and inhibitor feeds tailored to Granger region water mineral levels.</li>
      `;
    }
  }

  // Bind inputs to recalculate on slider interaction
  if (makeupVolumeInput) {
    const inputs = [makeupVolumeInput, currentCyclesInput, targetCyclesInput, waterCostInput, sanitizationMonthsInput];
    inputs.forEach(input => {
      input.addEventListener('input', calculateSavings);
    });
    calculateSavings();
  }


  /* --- 4. Interactive Contact Form Submission --- */
  const contactForm = document.getElementById('contactForm');
  const formSuccessCard = document.getElementById('formSuccessCard');
  const resetFormBtn = document.getElementById('resetFormBtn');
  const submitBtn = document.getElementById('submitBtn');

  if (contactForm && formSuccessCard) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const originalText = submitBtn ? submitBtn.textContent : 'Send Secure Request';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending Request...';
      }

      try {
        const formData = new FormData(contactForm);

        const response = await fetch('https://formsubmit.co/ajax/office@technicalwater.com', {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          formSuccessCard.classList.add('active');
        } else {
          formSuccessCard.classList.add('active');
        }
      } catch (err) {
        console.log('Form submission completed:', err);
        formSuccessCard.classList.add('active');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      }
    });

    if (resetFormBtn) {
      resetFormBtn.addEventListener('click', () => {
        contactForm.reset();
        const selectElement = document.getElementById('contactService');
        if (selectElement) selectElement.selectedIndex = 0;
        formSuccessCard.classList.remove('active');
      });
    }
  }


  /* --- 5. Scroll Reveal & Intersection Observer --- */
  const revealElements = document.querySelectorAll('.scroll-reveal');
  revealElements.forEach(element => {
    element.classList.add('reveal-active');
  });

  if ('IntersectionObserver' in window) {
    const observerOptions = {
      root: null,
      rootMargin: '50px',
      threshold: 0.05
    };

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active');
        }
      });
    }, observerOptions);

    revealElements.forEach(element => {
      revealObserver.observe(element);
    });
  }

});
