(() => {
  "use strict";

  document.documentElement.classList.add("js");

  const menuButton = document.querySelector(".menu-button");
  const mobileMenu = document.getElementById("mobileMenu");
  const toast = document.getElementById("toast");
  const toastText = toast?.querySelector("span");
  let toastTimer;

  function showToast(message) {
    if (!toast) return;
    if (message && toastText) toastText.textContent = message;
    window.clearTimeout(toastTimer);
    toast.classList.add("show");
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2400);
  }

  function closeMenu() {
    if (!menuButton || !mobileMenu) return;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "فتح القائمة");
    mobileMenu.hidden = true;
    document.body.classList.remove("menu-open");
  }

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", () => {
      const willOpen = menuButton.getAttribute("aria-expanded") !== "true";
      menuButton.setAttribute("aria-expanded", String(willOpen));
      menuButton.setAttribute("aria-label", willOpen ? "إغلاق القائمة" : "فتح القائمة");
      mobileMenu.hidden = !willOpen;
      document.body.classList.toggle("menu-open", willOpen);
    });

    mobileMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    window.addEventListener("resize", () => {
      if (window.innerWidth > 840) closeMenu();
    });
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const helper = document.createElement("textarea");
    helper.value = text;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    document.body.appendChild(helper);
    helper.select();
    document.execCommand("copy");
    helper.remove();
  }

  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const text = button.getAttribute("data-copy");
      try {
        await copyText(text);
        button.classList.add("copied");
        const label = button.querySelector("span");
        if (label) label.textContent = "تم النسخ";
        showToast("تم نسخ رقم الحساب");
        window.setTimeout(() => {
          button.classList.remove("copied");
          if (label) label.textContent = "نسخ الرقم";
        }, 2200);
      } catch {
        showToast("تعذّر النسخ، الرقم هو 6818134");
      }
    });
  });

  const shareData = {
    title: "مبادرة علاج الخالة حليوة حامد مستور",
    text: "ساهم معنا في دعم علاج الخالة حليوة حامد مستور. كل مساهمة تصنع فرقًا.",
    url: window.location.href
  };

  document.querySelectorAll(".share-button").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        if (navigator.share) {
          await navigator.share(shareData);
        } else {
          await copyText(window.location.href);
          showToast("تم نسخ رابط المبادرة");
        }
      } catch (error) {
        if (error?.name !== "AbortError") showToast("تعذّرت المشاركة الآن");
      }
    });
  });

  document.querySelector(".print-button")?.addEventListener("click", () => window.print());

  const search = document.getElementById("donorSearch");
  const rows = Array.from(document.querySelectorAll("#donorTableBody tr"));
  const noResults = document.getElementById("noResults");

  function normalizeArabic(value) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u064B-\u065F\u0670]/g, "")
      .replace(/[إأآٱ]/g, "ا")
      .replace(/ى/g, "ي")
      .replace(/ة/g, "ه")
      .trim();
  }

  search?.addEventListener("input", () => {
    const term = normalizeArabic(search.value);
    let visibleCount = 0;

    rows.forEach((row) => {
      const donorName = normalizeArabic(row.children[1]?.textContent || "");
      const isMatch = !term || donorName.includes(term);
      row.hidden = !isMatch;
      if (isMatch) visibleCount += 1;
    });

    if (noResults) noResults.hidden = visibleCount !== 0;
  });

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -30px" });

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }
})();
