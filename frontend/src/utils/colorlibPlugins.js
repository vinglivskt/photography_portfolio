/** Переинициализация поведения theme/static/js/main.js после SPA-навигации */

/** Закрывает off-canvas меню из исходной темы Colorlib. */
export function closeColorlibMenu() {
  const $ = window.jQuery;
  if (!$) return;
  $("body").removeClass("offcanvas");
  $(".js-colorlib-nav-toggle").removeClass("active");
}

/** Пересчитывает высоту блоков с классом .js-fullheight. */
export function refreshFullHeight() {
  const $ = window.jQuery;
  if (!$) return;
  $(".js-fullheight").css("height", $(window).height());
}

/** Обновляет плагин параллакса, если он подключен. */
export function refreshStellar() {
  const $ = window.jQuery;
  if ($?.fn?.stellar) {
    $(window).stellar("refresh");
  }
}

/** Как в main.js contentWayPoint — после смены маршрута новые .ftco-animate не были привязаны */
export function initFtcoWaypoints() {
  const $ = window.jQuery;
  const Wp = window.Waypoint;
  if (!$?.fn?.waypoint) return;

  try {
    if (Wp && typeof Wp.destroyAll === "function") {
      Wp.destroyAll();
    }
  } catch {
    /* ignore */
  }

  $(".ftco-animate").waypoint(
    function (direction) {
      const $el = $(this.element);
      if (direction === "down" && !$el.hasClass("ftco-animated")) {
        $el.addClass("item-animate");
        setTimeout(() => {
          $("body .ftco-animate.item-animate").each(function (k) {
            const node = $(this);
            setTimeout(() => {
              const effect = node.data("animate-effect");
              if (effect === "fadeIn") {
                node.addClass("fadeIn ftco-animated");
              } else if (effect === "fadeInLeft") {
                node.addClass("fadeInLeft ftco-animated");
              } else if (effect === "fadeInRight") {
                node.addClass("fadeInRight ftco-animated");
              } else {
                node.addClass("fadeInUp ftco-animated");
              }
              node.removeClass("item-animate");
            }, k * 50);
          });
        }, 100);
      }
    },
    { offset: "95%" }
  );
}

/** Счётчики на #section-counter (страница «Обо мне») */
export function initCounterSection() {
  const $ = window.jQuery;
  if (!$?.fn?.waypoint || !$?.fn?.animateNumber) return;

  const $section = $("#section-counter");
  if (!$section.length) return;

  $section.waypoint(
    function (direction) {
      if (direction === "down" && !$(this.element).hasClass("ftco-animated")) {
        $(this.element).addClass("ftco-animated");
        const comma = $.animateNumber.numberStepFactories.separator(",");
        $(".number").each(function () {
          const $n = $(this);
          const num = $n.data("number");
          if (num == null || Number.isNaN(Number(num))) return;
          $n.animateNumber({ number: num, numberStep: comma }, 2000);
        });
      }
    },
    { offset: "95%" }
  );
}

/** Переинициализирует owlCarousel на главном слайдере. */
export function initHomeSlider() {
  const $ = window.jQuery;
  if (!$?.fn?.owlCarousel) return () => {};
  const $el = $(".home-slider");
  if (!$el.length) return () => {};
  if ($el.hasClass("owl-loaded")) {
    $el.trigger("destroy.owl.carousel");
    $el.removeClass("owl-loaded owl-drag");
  }
  $el.owlCarousel({
    loop: true,
    autoplay: true,
    margin: 0,
    animateOut: "fadeOut",
    animateIn: "fadeIn",
    nav: false,
    autoplayHoverPause: false,
    items: 1,
    responsive: { 0: { items: 1 }, 600: { items: 1 }, 1000: { items: 1 } },
  });
  return () => {
    if ($el?.data?.("owl.carousel")) {
      $el.trigger("destroy.owl.carousel");
    }
  };
}

/** Подключает MagnificPopup к ссылкам галереи .image-popup. */
export function initImagePopups() {
  const $ = window.jQuery;
  if (!$?.fn?.magnificPopup) return () => {};
  const sel = ".image-popup";
  $(sel).each(function () {
    const $t = $(this);
    if ($t.data("magnificPopup")) {
      $t.magnificPopup("destroy");
    }
  });
  $(sel).magnificPopup({
    type: "image",
    closeOnContentClick: true,
    closeBtnInside: false,
    fixedContentPos: true,
    gallery: { enabled: true, navigateByImgClick: true, preload: [0, 1] },
    image: { verticalFit: true },
    zoom: { enabled: true, duration: 300 },
  });
  return () => {
    $(sel).each(function () {
      const $t = $(this);
      if ($t.data("magnificPopup")) {
        $t.magnificPopup("destroy");
      }
    });
  };
}

/** После смены страницы: высота, параллакс, анимации по скроллу, AOS */
export function reinitThemeAfterRoute() {
  refreshFullHeight();
  refreshStellar();
  initFtcoWaypoints();
  initCounterSection();
  if (window.AOS && typeof window.AOS.refresh === "function") {
    window.AOS.refresh();
  }
}
