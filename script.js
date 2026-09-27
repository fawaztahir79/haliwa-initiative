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
      if (window.innerWidth > 940) closeMenu();
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

  /* ---------- Shared visitor counter ---------- */
  const visitorCounterElements = Object.fromEntries(
    Array.from(document.querySelectorAll("[data-visitor-counter]")).map((element) => [
      element.getAttribute("data-visitor-counter"),
      element
    ])
  );
  const counterStatus = document.getElementById("counterStatus");
  const visitorNamespace = "fawaztahir79-github-io-haliwa-initiative";
  const visitorStateKey = "haliyaInitiativeVisitorStateV1";
  const deviceCounterKey = "haliyaInitiativeDeviceCountersV1";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const numberFormatter = new Intl.NumberFormat("ar");

  function formatNumber(value) {
    return numberFormatter.format(Math.max(0, Math.floor(Number(value) || 0)));
  }

  function getInitiativeDayKey() {
    try {
      const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Africa/Khartoum",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }).formatToParts(new Date());
      const part = (type) => parts.find((item) => item.type === type)?.value;
      return `${part("year")}-${part("month")}-${part("day")}`;
    } catch {
      return new Date().toISOString().slice(0, 10);
    }
  }

  function readStoredValue(key, fallback) {
    try {
      const rawValue = window.localStorage.getItem(key);
      if (!rawValue) return fallback;
      return JSON.parse(rawValue);
    } catch {
      return fallback;
    }
  }

  function storeValue(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  function setCounterStatus(message, isFallback = false) {
    if (!counterStatus) return;
    counterStatus.textContent = message;
    counterStatus.classList.toggle("is-fallback", isFallback);
  }

  function animateCounter(element, target) {
    if (!element) return;
    const safeTarget = Math.max(0, Math.floor(Number(target) || 0));
    const initial = Math.max(0, Math.floor(Number(element.dataset.counterValue) || 0));
    element.dataset.counterValue = String(safeTarget);

    if (reducedMotion || initial === safeTarget) {
      element.textContent = formatNumber(safeTarget);
      return;
    }

    const startTime = window.performance.now();
    const duration = 720;
    const renderFrame = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(initial + ((safeTarget - initial) * easedProgress));
      element.textContent = formatNumber(current);
      if (progress < 1 && element.dataset.counterValue === String(safeTarget)) {
        window.requestAnimationFrame(renderFrame);
      }
    };
    window.requestAnimationFrame(renderFrame);
  }

  function renderVisitorCounters(counts) {
    Object.entries(counts).forEach(([name, value]) => animateCounter(visitorCounterElements[name], value));
  }

  async function fetchCounterValue(url) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 6000);
    try {
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`Counter request failed with ${response.status}`);
      const responseData = await response.json();
      const value = Number(responseData?.value);
      if (!Number.isFinite(value) || value < 0) throw new Error("Counter response did not include a value");
      return value;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  const counterProviders = [
    {
      id: "countapi",
      request(action, key) {
        const endpoint = action === "hit" ? "hit" : "get";
        return fetchCounterValue(`https://api.countapi.xyz/${endpoint}/${visitorNamespace}/${encodeURIComponent(key)}`);
      }
    },
    {
      id: "counterapi",
      request(action, key) {
        const incrementSuffix = action === "hit" ? "/up" : "";
        return fetchCounterValue(`https://api.counterapi.dev/v2/${visitorNamespace}/${encodeURIComponent(key)}${incrementSuffix}`);
      }
    }
  ];

  async function updateCounterProvider(provider, state, dayKey) {
    const providerStates = state.providers && typeof state.providers === "object" ? state.providers : {};
    const providerState = providerStates[provider.id] || {};
    const isNewDeviceForProvider = !providerState.uniqueRecorded;
    const isNewDayForProvider = providerState.dailyDate !== dayKey;
    const [visits, unique, today] = await Promise.all([
      provider.request("hit", "total-visits"),
      provider.request(isNewDeviceForProvider ? "hit" : "get", "unique-visitors"),
      provider.request(isNewDayForProvider ? "hit" : "get", `daily-visitors-${dayKey}`)
    ]);

    state.providers = providerStates;
    state.providers[provider.id] = {
      uniqueRecorded: true,
      dailyDate: dayKey
    };
    storeValue(visitorStateKey, state);
    return { visits, unique, today };
  }

  function updateDeviceCounters(state, dayKey) {
    const storedCounters = readStoredValue(deviceCounterKey, {});
    const counters = {
      unique: Math.max(0, Number(storedCounters?.unique) || 0),
      today: Math.max(0, Number(storedCounters?.today) || 0),
      visits: Math.max(0, Number(storedCounters?.visits) || 0),
      dayKey: typeof storedCounters?.dayKey === "string" ? storedCounters.dayKey : ""
    };

    if (!state.fallbackUniqueRecorded) {
      counters.unique += 1;
      state.fallbackUniqueRecorded = true;
    }
    if (state.fallbackDailyDate !== dayKey || counters.dayKey !== dayKey) {
      counters.today = 0;
      counters.dayKey = dayKey;
      state.fallbackDailyDate = dayKey;
    }
    if (counters.today === 0) counters.today = 1;
    counters.visits += 1;

    storeValue(deviceCounterKey, counters);
    storeValue(visitorStateKey, state);
    return counters;
  }

  async function initialiseVisitorCounter() {
    if (!Object.keys(visitorCounterElements).length) return;
    const dayKey = getInitiativeDayKey();
    const visitorState = readStoredValue(visitorStateKey, {});
    const state = visitorState && typeof visitorState === "object" ? visitorState : {};

    for (const provider of counterProviders) {
      try {
        const counts = await updateCounterProvider(provider, state, dayKey);
        renderVisitorCounters(counts);
        setCounterStatus("إحصاءات مشتركة ومحدّثة الآن.");
        return;
      } catch {
        // Try the next provider without interrupting the rest of the page.
      }
    }

    const deviceCounts = updateDeviceCounters(state, dayKey);
    renderVisitorCounters(deviceCounts);
    setCounterStatus("تعذّر الوصول إلى خدمة العدّاد؛ تُعرض أرقام محسوبة على هذا الجهاز فقط.", true);
  }

  initialiseVisitorCounter();

  /* ---------- Visitor feedback (stored on this device only) ---------- */
  const reviewStorageKey = "haliyaInitiativeFeedbackV1";
  const feedbackForm = document.getElementById("feedbackForm");
  const feedbackName = document.getElementById("feedbackName");
  const feedbackMessage = document.getElementById("feedbackMessage");
  const feedbackCharacters = document.getElementById("feedbackCharacters");
  const feedbackError = document.getElementById("feedbackError");
  const feedbackSuccess = document.getElementById("feedbackSuccess");
  const ratingOptions = document.querySelector(".rating-options");
  const reviewsList = document.getElementById("reviewsList");
  const feedbackEmpty = document.getElementById("feedbackEmpty");
  const ratingAverage = document.getElementById("ratingAverage");
  const summaryStars = document.getElementById("summaryStars");
  const reviewCount = document.getElementById("reviewCount");
  const reviewListCount = document.getElementById("reviewListCount");
  const ratingNumberFormatter = new Intl.NumberFormat("ar", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });

  function validReview(review) {
    return review
      && typeof review.id === "string"
      && typeof review.name === "string"
      && typeof review.message === "string"
      && review.message.trim().length > 0
      && review.message.length <= 400
      && Number.isInteger(review.rating)
      && review.rating >= 1
      && review.rating <= 5
      && Number.isFinite(review.createdAt)
      && Math.abs(review.createdAt) <= 8640000000000000;
  }

  function getStoredReviews() {
    const savedReviews = readStoredValue(reviewStorageKey, []);
    return Array.isArray(savedReviews) ? savedReviews.filter(validReview) : [];
  }

  function saveReviews(nextReviews) {
    return storeValue(reviewStorageKey, nextReviews);
  }

  let reviews = getStoredReviews();

  function updateCharacterCount() {
    if (!feedbackMessage || !feedbackCharacters) return;
    feedbackCharacters.textContent = `${formatNumber(feedbackMessage.value.length)} / ${formatNumber(400)}`;
  }

  function updateRatingSelection() {
    if (!ratingOptions) return;
    const selectedRating = Number(ratingOptions.querySelector("input:checked")?.value || 0);
    ratingOptions.querySelectorAll("input").forEach((input) => {
      input.nextElementSibling?.classList.toggle("is-selected", Number(input.value) <= selectedRating);
    });
  }

  function getInitials(name) {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (!words.length) return "ز";
    return words.slice(0, 2).map((word) => Array.from(word)[0]).join("").slice(0, 2);
  }

  function getRelativeDate(timestamp) {
    const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
    if (seconds < 60) return "الآن";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      if (minutes === 1) return "قبل دقيقة";
      if (minutes === 2) return "قبل دقيقتين";
      return `قبل ${formatNumber(minutes)} دقائق`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      if (hours === 1) return "قبل ساعة";
      if (hours === 2) return "قبل ساعتين";
      return `قبل ${formatNumber(hours)} ساعات`;
    }
    const days = Math.floor(hours / 24);
    if (days < 30) {
      if (days === 1) return "قبل يوم";
      if (days === 2) return "قبل يومين";
      return `قبل ${formatNumber(days)} أيام`;
    }
    return new Intl.DateTimeFormat("ar", { day: "numeric", month: "long", year: "numeric" }).format(new Date(timestamp));
  }

  function getFullDate(timestamp) {
    return new Intl.DateTimeFormat("ar", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(new Date(timestamp));
  }

  function createReviewCard(review) {
    const article = document.createElement("article");
    article.className = "review-card";

    const header = document.createElement("div");
    header.className = "review-card-header";

    const avatar = document.createElement("span");
    avatar.className = "review-avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = getInitials(review.name);

    const meta = document.createElement("div");
    meta.className = "review-meta";
    const name = document.createElement("strong");
    name.className = "review-name";
    name.textContent = review.name || "زائر مجهول";
    const date = document.createElement("time");
    date.className = "review-date";
    date.dateTime = new Date(review.createdAt).toISOString();
    date.title = getFullDate(review.createdAt);
    date.textContent = getRelativeDate(review.createdAt);
    meta.append(name, date);

    const stars = document.createElement("span");
    stars.className = "review-stars";
    stars.setAttribute("aria-label", `التقييم ${formatNumber(review.rating)} من 5`);
    stars.textContent = `${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}`;

    const deleteButton = document.createElement("button");
    deleteButton.className = "review-delete";
    deleteButton.type = "button";
    deleteButton.setAttribute("aria-label", "حذف هذا الرأي");
    deleteButton.title = "حذف الرأي";
    deleteButton.dataset.reviewId = review.id;
    const deleteIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    deleteIcon.setAttribute("viewBox", "0 0 24 24");
    deleteIcon.setAttribute("aria-hidden", "true");
    const deletePathOne = document.createElementNS("http://www.w3.org/2000/svg", "path");
    deletePathOne.setAttribute("d", "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 10v6M14 10v6");
    deleteIcon.appendChild(deletePathOne);
    deleteButton.appendChild(deleteIcon);
    deleteButton.addEventListener("click", () => removeReview(review.id));

    header.append(avatar, meta, stars, deleteButton);
    const message = document.createElement("p");
    message.className = "review-message";
    message.textContent = review.message;
    article.append(header, message);
    return article;
  }

  function renderReviews() {
    if (!reviewsList || !feedbackEmpty) return;
    const orderedReviews = [...reviews].sort((first, second) => second.createdAt - first.createdAt);
    reviewsList.replaceChildren(...orderedReviews.map(createReviewCard));
    feedbackEmpty.hidden = orderedReviews.length !== 0;

    const totalRating = orderedReviews.reduce((total, review) => total + review.rating, 0);
    const average = orderedReviews.length ? totalRating / orderedReviews.length : 0;
    if (ratingAverage) ratingAverage.textContent = ratingNumberFormatter.format(average);
    if (summaryStars) {
      const roundedAverage = Math.round(average);
      summaryStars.textContent = `${"★".repeat(roundedAverage)}${"☆".repeat(5 - roundedAverage)}`;
      summaryStars.setAttribute("aria-label", orderedReviews.length ? `متوسط التقييم ${ratingNumberFormatter.format(average)} من 5` : "لا توجد تقييمات بعد");
    }
    if (reviewCount) {
      reviewCount.textContent = orderedReviews.length ? `${formatNumber(orderedReviews.length)} رأي محفوظ على هذا الجهاز` : "لا توجد آراء بعد";
    }
    if (reviewListCount) reviewListCount.textContent = formatNumber(orderedReviews.length);
  }

  function showFeedbackError(message) {
    if (!feedbackError) return;
    feedbackError.textContent = message;
    feedbackError.hidden = false;
    if (feedbackSuccess) feedbackSuccess.hidden = true;
  }

  function clearFeedbackMessages() {
    if (feedbackError) feedbackError.hidden = true;
    if (feedbackSuccess) feedbackSuccess.hidden = true;
  }

  function removeReview(reviewId) {
    const nextReviews = reviews.filter((review) => review.id !== reviewId);
    if (!saveReviews(nextReviews)) {
      showToast("تعذّر حذف الرأي من هذا المتصفح");
      return;
    }
    reviews = nextReviews;
    renderReviews();
    showToast("تم حذف رأيك");
  }

  if (feedbackMessage) {
    feedbackMessage.addEventListener("input", () => {
      updateCharacterCount();
      if (feedbackError && !feedbackError.hidden) feedbackError.hidden = true;
    });
  }
  ratingOptions?.addEventListener("change", () => {
    updateRatingSelection();
    if (feedbackError && !feedbackError.hidden) feedbackError.hidden = true;
  });

  feedbackForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const rating = Number(ratingOptions?.querySelector("input:checked")?.value || 0);
    const message = feedbackMessage?.value.trim() || "";
    const name = (feedbackName?.value || "").trim().slice(0, 80);

    if (!rating) {
      showFeedbackError("يرجى اختيار تقييم بالنجوم.");
      ratingOptions?.querySelector("input")?.focus();
      return;
    }
    if (!message) {
      showFeedbackError("يرجى كتابة رأيك قبل الإرسال.");
      feedbackMessage?.focus();
      return;
    }

    const review = {
      id: window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      name,
      rating,
      message: message.slice(0, 400),
      createdAt: Date.now()
    };
    const nextReviews = [review, ...reviews];
    if (!saveReviews(nextReviews)) {
      showFeedbackError("تعذّر حفظ رأيك في هذا المتصفح. جرّب إيقاف وضع التصفح الخاص ثم أعد المحاولة.");
      return;
    }

    reviews = nextReviews;
    renderReviews();
    feedbackForm.reset();
    updateCharacterCount();
    updateRatingSelection();
    if (feedbackError) feedbackError.hidden = true;
    if (feedbackSuccess) feedbackSuccess.hidden = false;
  });

  renderReviews();
  updateCharacterCount();
  updateRatingSelection();

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
