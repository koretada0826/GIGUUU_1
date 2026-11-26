var ua = navigator.userAgent;

//ua判定
var agent = ua.toLowerCase();
console.log(agent);
if (agent.indexOf("msie") != -1 || agent.indexOf("trident") != -1) {
  $("html").addClass("msie");
} else {
  $("html").addClass("notIE");
}

var SP_SLICK_SPEED = 200;

$(function () {
  // インクルードhtmlを読み込み
  var outerNodes = document.querySelectorAll("[data-inc]");
  var outerArr = Array.prototype.slice.call(outerNodes);
  outerArr.forEach(function (elem) {
    $.ajax({
      url: elem.getAttribute("data-inc"),
      cache: false,
      async: false,
      success: function (html) {
        elem.insertAdjacentHTML("beforeend", html);
      },
    });
  });

  // カートJS読み込み
  $("body")
    .append(
      '<div class="u-modal" id="modal_cart" style="display: none;"></div>'
    )
    .append(
      '<script type="application/json" id="js-config">{"detailPath":"/elixir/sw/c/products/SWFD070020.seam","resourcesPath":"/resources/sw","cdnBaseUrl":"https://imagecdn.shiseido.co.jp/c/a=0,f=webp:jpeg","productDetailApiUrl":"/sw/api/auth/V1/SWFR070220.seam","cartAddApiUrl":"/sw/api/auth/V1/SWFR070060.seam","addCookieUrl":"/sw/auth/SWFG014120.seam?brc=brac004&_kss_next_url=%2Fsw%2Fproducts%2Fauth%2FSWFG040180.seam"}</script>'
    )
    .append('<script src="/elixir/sw/c/ols/js/cart.js"></script>');

  // アコーディオン
  $(".js-acc-btn").on("click", function (evt) {
    evt.preventDefault();
    var thisUnit = $(this).closest(".js-acc");
    console.log(thisUnit);
    var thisCont = thisUnit.children(".js-acc-cont");
    var flagClass = "m-opened";
    var slideTime = 300;
    if (thisUnit.hasClass(flagClass)) {
      //閉じる
      thisCont.slideUp(slideTime);
      thisUnit.removeClass(flagClass);
    } else {
      //開く
      thisCont.slideDown(slideTime);
      thisUnit.addClass(flagClass);
    }
  });

  // スクロール時のヘッダーの処理
  function hideHeader() {
    this.startPos = 0;
    this.winScrollTop = 0;
    this.eventInterval = 300;
    this.timeoutId = null;
    this.window = window;
    this.$window = $(this.window);
    this.$gHeader = $(".g-header");
    this.$categoryNav = $(".category_nav");
    this.className_Hide = "is-hide";
    // this.threshold = this.window.matchMedia('screen and (max-width: 750px)').matches ? 100 : 120;
    this.threshold = 40;
    var self = this;

    this._changeStatus = function () {
      this.winScrollTop = this.$window.scrollTop();
      if (
        this.winScrollTop >= this.threshold &&
        this.winScrollTop >= this.startPos
      ) {
        // this.$gHeader.addClass(this.className_Hide);
        this.$categoryNav.addClass(this.className_Hide);
      } else {
        // this.$gHeader.removeClass(this.className_Hide);
        this.$categoryNav.removeClass(this.className_Hide);
      }
      this.startPos = this.winScrollTop;
    };

    this.$window.on("scroll", function () {
      if (self.timeoutId) return;
      self.timeoutId = setTimeout(function () {
        self.timeoutId = 0;
        self._changeStatus();
      }, self.eventInterval);
    });
  }
  hideHeader();

  // グローバルメニュー
  $(".js-gmenu_open").on("click", function (evt) {
    console.log("aaa");
    evt.preventDefault();
    var menuBox = $(".g-header__menu");
    var $body = $("body");
    var className_noScroll = "is-open-gmenu";

    // ヘッダサーチを非表示
    $(".g-header__search").removeClass("m-opened").hide();
    $body.removeClass("is-open-gsearch");

    menuBox.fadeIn(200);
    $body.addClass(className_noScroll);
    $(".js-menu_close").on("click", function (evnt) {
      evnt.preventDefault();
      menuBox.fadeOut(200);
      $body.removeClass(className_noScroll);
    });
    $(".js-menu_hash").on("click", function (evnt) {
      // evnt.preventDefault();
      let url = location.pathname;
      let linkHref = $(this).attr('href');
      let hash = $(this)[0].hash;
      linkPath = linkHref.replace(hash, '');
      if (linkPath !== url) {
        location.href = linkHref;
      }
      menuBox.fadeOut(200);
      $body.removeClass(className_noScroll);
      setTimeout(() => {
        if (hash && $(hash)) {
          try {
            pageScroll(hash);
          } catch (e) {
            return false;
          }
        }
      }, 200);
    });
  });

  // ヘッダサーチ
  $(".js-gsearch_open").on("click", function (evt) {
    evt.preventDefault();
    var flg = "m-opened";
    var searchBox = $(".g-header__search");
    var $body = $("body");
    var className_noScroll = "is-open-gsearch";
    if (searchBox.hasClass(flg)) {
      searchBox.removeClass(flg).fadeOut(200);
      $body.removeClass(className_noScroll);
    } else {
      $(".g-header__menu").hide();
      searchBox.addClass(flg).fadeIn(200);
      $body.addClass(className_noScroll);
    }
    $(".js-gsearch_close").on("click", function (evnt) {
      evnt.preventDefault();
      searchBox.removeClass(flg).fadeOut(200);
      $body.removeClass(className_noScroll);
    });
  });

  // カテゴリナビ
  $(".js-subnavi").on("click", function (evt) {
    evt.preventDefault();
    var cateNav = $(".category_subnavi");
    var flg = "m-opened";
    var $body = $("body");
    var className_noScroll = "is-open-subnav";
    if ($(this).hasClass(flg)) {
      cateNav.fadeOut(200);
      $(this).removeClass(flg);
      $body.removeClass(className_noScroll);
    } else {
      cateNav.fadeIn(200);
      $(this).addClass(flg);
      $body.addClass(className_noScroll);
    }
    $(".js-subnavi_close").on("click", function (evt) {
      cateNav.fadeOut(200);
      $(".js-subnavi").removeClass(flg);
      $body.removeClass(className_noScroll);
    });
  });

  // カテゴリフッター
  // よく見られているアイテム SPのみカルーセル、カテゴリトップ非表示
  if (!$("body").hasClass("category_top")) {
    var mql = window.matchMedia("screen and (max-width: 750px)");
    function checkBreakPoint(mql) {
      if (mql.matches) {
        // スマホ向け（750px以下のとき）
        $(".js-footer_popular_slider").not(".slick-initialized").slick({
          //スライドさせる
          infinite: false,
          slidesToShow: 2,
          slidesToScroll: 2,
          arrows: true,
          dots: false,
          variableWidth: true,
          swipeToSlide: true,
          speed: SP_SLICK_SPEED,
        });
      } else {
        // PC向け
        $(".js-footer_popular_slider.slick-initialized").slick("unslick");
      }
    }
    // ブレイクポイントの瞬間に発火
    mql.addListener(checkBreakPoint);

    // 初回チェック
    checkBreakPoint(mql);
  } else {
    $(".ei_footer .ei_footer_recommend").remove();
    $(".ei_footer_popular").remove();
  }

  // kvスライダー
  $(".js-kv_slider").slick({
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    dots: true,
    fade: true,
    autoplay: true,
    autoplaySpeed: 4000,
    responsive: [
      {
        breakpoint: 751,
        settings: {
          arrows: false,
          waitForAnimate: false,
          touchThreshold: 30,
        },
      },
    ],
  });

    // 新商品スライダー
    $(".js-newitem-slider").slick({
      infinite: true,
      slidesToShow: 3,
      slidesToScroll: 1,
      arrows: true,
      dots: false,
      variableWidth: true,
      autoplay: false,
      responsive: [
        {
          breakpoint: 751,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: true,
            dots: true,
            swipeToSlide: true,
            infinite :false,
            speed: SP_SLICK_SPEED,
            touchThreshold: 30,
          },
        },
      ],
    });

  // 特集・キャンペーンスライダー
  $(".js-feature-slider").slick({
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    dots: false,
    variableWidth: true,
    autoplay: false,
    responsive: [
      {
        breakpoint: 751,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: true,
          dots: true,
          swipeToSlide: true,
          speed: SP_SLICK_SPEED,
          touchThreshold: 30,
        },
      },
    ],
  });

  // 限定品スライダー
  $(".js-limited-slider").slick({
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    dots: false,
    variableWidth: true,
    autoplay: false,
    responsive: [
      {
        breakpoint: 751,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: true,
          dots: true,
          swipeToSlide: true,
          speed: SP_SLICK_SPEED,
          touchThreshold: 30,
        },
      },
    ],
  });

  //カートモーダル
  function modalSlick(flg, current) {
    if (flg == "on") {
      var slidesToShow = window.matchMedia("screen and (max-width: 750px)")
        .matches
        ? 4
        : 6;
      $(".js-slick-color_display2")
        .slick({
          slidesToShow: 1,
          slidesToScroll: 1,
          asNavFor: ".js-slick-color_select2",
          infinite: false,
          arrows: false,
          dots: false,
          swipe: false,
          fade: true,
        })
        .on("afterChange", function (event, slick, currentSlide) {
          // console.error(currentSlide);
          $(this).attr("current-id", currentSlide);
          if ($(".js-slick-color_select")) {
            $(".js-slick-color_select").slick("slickGoTo", currentSlide);
          }
        });
      $(".js-slick-color_select2").slick({
        slidesToShow: slidesToShow,
        slidesToScroll: 1,
        asNavFor: ".js-slick-color_display2",
        dots: false,
        focusOnSelect: true,
        variableWidth: true,
        infinite: false,
        adaptiveHeight: true,
        responsive: [
          {
            breakpoint: 750,
            settings: {
              slidesToShow: slidesToShow,
              swipeToSlide: true,
              speed: SP_SLICK_SPEED,
            },
          },
        ],
      });
      if (current) {
        $(".js-slick-color_select2").slick("slickGoTo", current);
      }
      if ($("#modal_cart .color_select .color_unit").length <= slidesToShow) {
        $("#modal_cart .color_select").addClass("is-noscroll");
      }
    } else {
      $(".js-slick-color_display2").slick("unslick");
      $(".js-slick-color_select2").slick("unslick");
    }
  }
  function modalType(current) {
    var flg = "m-select";
    var unit = $(".modal_cart_typeselect");
    unit.find(".type_unit").removeClass(flg);
    unit.find(".type_unit:eq(" + current + ")").addClass(flg);
  }

  $("main").on("click", ".js-modal", function (evt) {
    evt.preventDefault();
    if (typeof makeModalCart === "function") {
      makeModalCart($(this).data("id"), $(this).attr("current-id"));
    }
    var modalID = $(this).data("modal-id");
    var target = $("#" + modalID);
    var currentID = $(this).attr("current-id");
    $("body").addClass("m-ovfy_hidden");
    target.fadeIn(200, function () {
      if (modalID === "modal_cart") {
        if (currentID) {
          modalSlick("on", currentID);
          modalType(currentID);
        } else {
          modalSlick("on", 0);
        }
      }
      if (modalID === "modal_color_list") {
        $(".js-modal_colorselect")
          .attr("current-id", currentID)
          .find(".color_unit")
          .removeClass("m-current");
        $(".js-modal_colorselect")
          .find(".color_unit:eq(" + currentID + ")")
          .addClass("m-current");
      }
      target.on("click", ".js-modal_close", function (evt) {
        evt.preventDefault();
        if (modalID === "modal_cart") {
          modalSlick("off");
          $("#modal_cart .color_select").removeClass("is-noscroll");
          setTimeout(function () {
            target.find(".js-modalCartPage1").show();
            target.find(".js-modalCartPage2").hide();
          }, 500);
        }
        $("body").removeClass("m-ovfy_hidden");
        target.fadeOut(200);
      });
    });
  });

  //モーダルカラーリストからのカラー選択
  $(".js-modal_colorselect .color_unit").on("click", function () {
    var flg = "m-current";
    var unit = $(this).parents(".js-modal_colorselect");
    var currentID = $(this).index();
    $(this).siblings(".color_unit").removeClass(flg);
    $(this).addClass(flg);
    unit.attr("current-id", currentID);
    $(".js-slick-color_select").slick("slickGoTo", currentID);
    $("body").removeClass("m-ovfy_hidden");
    $("#modal_color_list").fadeOut(200);
  });

  //モーダルカートからのタイプ選択
  $("#modal_cart").on(
    "click",
    ".modal_cart_typeselect .type_unit",
    function (evt) {
      evt.preventDefault();
      var currentID = $(this).index();
      modalType(currentID);
      if ($(".js-type_select")) {
        var flg = "m-select";
        var unit = $(".js-type_select");
        // var currentID = $(this).index();
        unit.find(".type_unit").removeClass(flg);
        unit.find(".type_unit:eq(" + currentID + ")").addClass(flg);
        unit.attr("current-id", currentID);
        unit
          .parents(".js-cart_typeset")
          .find(".item_main_cartbtn button")
          .attr("current-id", currentID);
      }
    }
  );

  // モーダルカート内ページ遷移
  $("#modal_cart").on("click", ".js-modal_btncart", function (evt) {
    evt.preventDefault();
    if (typeof addCart === "function") {
      addCart(
        $(evt.currentTarget).data("id"),
        $(".modal_cart_area .amount option:selected").val()
      );
    }
    var page1 = $(this).parents(".js-modalCartPage1");
    var page2 = page1.next(".js-modalCartPage2");
    page2.fadeIn(200);
    page1.hide();
  });

  //modal
  $(".js-modal-open").on("click", function (evt) {
    evt.preventDefault();
    var thisModal = "#" + $(this).data("id");
    thisModal = $(thisModal);
    var thisCloser = thisModal.find(".js-modal-close");
    var fadeTime = 300;
    if (thisModal) {
      $("body,html").css("overflow", "hidden");
      thisModal.fadeIn(fadeTime);
    }
    thisCloser.on("click", function (evt) {
      evt.preventDefault();
      thisModal.fadeOut(fadeTime);
      $("body, html").css("overflow", "auto");
    });
  });

  //SPかPCかチェック
  function checkDevice() {
    if (
      !(
        ua.indexOf("iPhone") > 0 ||
        (ua.indexOf("Android") > 0 && ua.indexOf("Mobile") > 0)
      )
    ) {
      return "pc";
    } else {
      return "sp";
    }
  }

  //ページ内スクロール
  function pageScroll(target) {
    var speed = 400;
    $("body,html").animate(
      { scrollTop: contentTopHeader(target) },
      speed,
      "swing"
    );
  }

  // コンテンツ上の位置取得（ヘッダー分込）
  function contentTopHeader(target) {
    if (checkDevice() === "pc") {
      return $(target).offset().top - 120;
    } else {
      return $(target).offset().top - 60;
    }
  }

  $(window).on("load", function () {
    var urlHash = location.hash;
    if (urlHash) {
      try {
        pageScroll(urlHash);
      } catch (e) {
        return false;
      }
    }
  });

  var _$window = $(window);
  var _$body = $("body");
  var _$contents = $("main");

  //
  // ---------- アクション ---------- //
  //

  // アンカーリンク
  var _anchorLink = AnchorLink({
    $targetArr: _$body.find(".anchorLink"),
  });
  _anchorLink.init();

  // 在庫チェック
  var _zaikoCheck = ZaikoCheck({
    $targetArr: _$contents.find(".zaiko"),
  });
  _zaikoCheck.init();
  _zaikoCheck.connect();

  //
  // ---------- モジュール ---------- //
  //

  function AnchorLink(params) {
    var _$targetArr = params["$targetArr"];

    return {
      init: init,
    };

    // ---------- パブリックメソッド ---------- //

    function init() {
      if (!_$targetArr) return;
      _$targetArr.each(function () {
        $(this).click(function (evt) {
          evt.preventDefault();
          //

          var targetId = $(this).attr("href");
          var fixedContH = $("header").height();
          if ($(".category_nav").length != 0) {
            fixedContH = fixedContH + $(".category_nav").height();
          }
          if (targetId) {
            try {
              if ($(window).scrollTop() <= $(targetId).offset().top)
                fixedContH = $("header").height();
              $("html, body")
                .stop()
                .animate(
                  {
                    scrollTop: $(targetId).offset().top - fixedContH,
                  },
                  {
                    duration: 1000,
                    easing: "swing",
                  }
                );
            } catch (e) {
              return false;
            }
          }
        });
      });
    }

    // ---------- プライベートメソッド ---------- //
  }

  /**
   * 在庫チェック
   * @param params
   * @returns {{init: Function, connect: Function}}
   * @constructor
   */
  function ZaikoCheck(params) {
    var _$targetArr = params["$targetArr"];
    var _collection = [];
    var _params = "";

    return {
      init: init,
      connect: connect,
    };

    // ---------- パブリックメソッド ---------- //

    function init() {
      if (!_$targetArr) return;
      // 送信用パラメータと対象オブジェクトの取得
      _collection = [];
      _$targetArr.each(function () {
        var $this = $(this);
        var shohin_kbn = $this.attr("data-shohinkbn");
        var shohin_cd = $this.attr("data-shohincd");
        if (shohin_kbn && shohin_kbn != "") {
          var hasThis = false;
          var x, sum;
          for (x = 0, sum = _collection.length; x < sum; x++) {
            if (_collection[x].shohin_kbn == shohin_kbn) {
              //すでにある区分に追加
              (function ($this) {
                var flg = false;
                var i = 0,
                  max;
                var targetIndex = x;
                var targetCollect = _collection[targetIndex].collect;
                var targetParams = _collection[targetIndex].params;
                if (shohin_cd && shohin_cd != "") {
                  for (i = 0, max = targetCollect.length; i < max; i = i + 1) {
                    if (targetCollect[i].shohin_cd == shohin_cd) {
                      targetCollect[i].$targetArr.push($this);
                      flg = true;
                      break;
                    }
                  }
                }
                if (!flg) {
                  targetCollect.push({
                    shohin_cd: shohin_cd,
                    $targetArr: [$this],
                  });
                  targetParams += "&shohin_cd=" + shohin_cd;
                  _collection[targetIndex].params = targetParams;
                }
              })($this);

              hasThis = true;
              break;
            }
          }
          if (!hasThis) {
            //区分を新規
            _collection.push({
              shohin_kbn: shohin_kbn,
              collect: [],
              params: "",
            });
            if (shohin_cd && shohin_cd != "") {
              (function ($this) {
                var targetIndex = _collection.length - 1;
                var targetCollect = _collection[targetIndex].collect;
                var targetParams = _collection[targetIndex].params;

                targetCollect.push({
                  shohin_cd: shohin_cd,
                  $targetArr: [$this],
                });
                targetParams += "&shohin_cd=" + shohin_cd;
                _collection[targetIndex].params = targetParams;
              })($this);
            }
          }
        }
      });
      //console.log(_collection)
    }

    function connect() {
      if (!_$targetArr) return;
      $.each(_collection, function (index, val) {
        var shohin_kbn = val.shohin_kbn;
        var params = val.params;
        var collect = val.collect;
        var domain = document.domain;
        var apiUrl = "//www.shiseido.co.jp/sw/products/SWFG070740.seam";
        if (
          domain == "www.shiseido.co.jp" ||
          domain == "test.www.shiseido.co.jp" ||
          domain == "test4.www.shiseido.co.jp"
        ) {
          apiUrl = "/sw/products/SWFG070740.seam";
        }
        $.ajax({
          async: false,
          url: apiUrl,
          // url: "https://www.shiseido.co.jp/sw/products/SWFG070740.seam",
          data: "border=10&shohin_kbn=" + shohin_kbn + params,
          dataType: "jsonp",
          success: function (data) {
            if (!data) {
              return;
            }
            var i = 0,
              max;
            for (i = 0, max = data.length; i < max; i = i + 1) {
              var j = 0,
                max2;
              for (j = 0, max2 = collect.length; j < max2; j = j + 1) {
                if (collect[j].shohin_cd == data[i].shohin_cd) {
                  var k = 0,
                    max3;
                  for (
                    k = 0, max3 = collect[j].$targetArr.length;
                    k < max3;
                    k = k + 1
                  ) {
                    if (data[i].zaiko_kbn == 0) {
                      collect[j].$targetArr[k]
                        .find(".zaikokbn0")
                        .each(function () {
                          $(this).css({ display: "block" });
                        });
                    } else if (data[i].zaiko_kbn == 1) {
                      collect[j].$targetArr[k]
                        .find(".zaikokbn1")
                        .each(function () {
                          $(this).css({ display: "block" });
                        });
                    } else if (data[i].zaiko_kbn == 2) {
                      collect[j].$targetArr[k]
                        .find(".zaikokbn2")
                        .each(function () {
                          $(this).css({ display: "block" });
                        });
                    } else if (data[i].zaiko_kbn == 9) {
                      collect[j].$targetArr[k]
                        .find(".zaikokbn9")
                        .each(function () {
                          $(this).css({ display: "block" });
                        });
                    }
                  }
                }
              }
            }
          },
          error: function () {},
        });
      });
    }

    // ---------- プライベートメソッド ---------- //
  }

  // cart number
  function updateCartNumber() {
    var $cartNumber = $(".cart_num");
    if ($cartNumber) {
      $.getJSON("/sw/api/auth/V1/SWFR070050.seam", function (json) {
        if (json.shohin_su) {
          var shohinSu = Number(json.shohin_su);
          setCartNumber(shohinSu);
        } else {
          $cartNumber.hide();
        }
      });
    } else {
      $cartNumber.hide();
    }
  }
  function setCartNumber(shohinSu) {
    var $cartNumber = $(".cart_num");
    if (shohinSu === 0) {
      $cartNumber.hide();
    } else {
      $cartNumber.show();
      $cartNumber.text(shohinSu);
    }
  }
  updateCartNumber();
  document.body.addEventListener("updateHeaderCartNumber", updateCartNumber);
  document.body.addEventListener("setHeaderCartNumber", function (e) {
    setCartNumber(e.detail);
  });

//ブランドTOPのエリアの制御
(function () {
  let lastScroll = window.scrollY;

  window.addEventListener('scroll', function () {
    if (!document.body.classList.contains('info_top')) return;

    const target = document.querySelector('.g-header__info');
    const headerBottom = document.querySelector('.g-header__bottom');
    const kv = document.querySelector('.u-kv');
    if (!target || !headerBottom || !kv) return;

    const targetHeight = target.offsetHeight;
    const currentScroll = window.scrollY;
    const scrollDown = currentScroll > lastScroll;
    const scrollUp = currentScroll < lastScroll;

    const kvTop = kv.getBoundingClientRect().top + window.scrollY;

    if (scrollDown && currentScroll >= targetHeight) {
      headerBottom.style.transform = `translateY(-${targetHeight + 2}px)`;
    }

    if (scrollUp && currentScroll <= kvTop) {
      headerBottom.style.transform = 'translateY(0)';
    }

    lastScroll = currentScroll;
  });
})();


  window.onload = function () {
    // body に info_top クラスがなければ全処理中止
    if (!document.body.classList.contains('info_top')) {
      return;
    }

    const headerInfo = document.querySelector('.g-header__info');
    if (headerInfo) {
      headerInfo.style.display = 'block';
    }

    // =============================
    // スライダー処理
    // =============================

    const slider = document.querySelector('.g-header__slider-list');
    const slides = slider.querySelectorAll('li');
    const prevBtnWrap = document.querySelector('.g-header__slider-btn-prev');
    const nextBtnWrap = document.querySelector('.g-header__slider-btn-next');
    const prevBtn = prevBtnWrap?.querySelector('button');
    const nextBtn = nextBtnWrap?.querySelector('button');

    let current = 0;
    let timer;

    // スライドが1個以下ならボタン非表示、自動再生もしない
    if (slides.length <= 1) {
      if (prevBtnWrap) prevBtnWrap.style.display = 'none';
      if (nextBtnWrap) nextBtnWrap.style.display = 'none';

      if (slides.length === 1) {
        slides[0].classList.add('is-visible');
      }

      return;
    }

    function updateButtons() {
      if (prevBtn) prevBtn.disabled = false;
      if (nextBtn) nextBtn.disabled = false;
    }

    function showSlide(index) {
      slides[current].classList.remove('is-visible');
      current = (index + slides.length) % slides.length; // ←ループ処理
      slides[current].classList.add('is-visible');
      updateButtons();
    }

    function nextSlide() {
      showSlide(current + 1);
    }

    function prevSlide() {
      showSlide(current - 1);
    }

    function startAutoPlay() {
      stopAutoPlay();
      timer = setInterval(nextSlide, 5000);
    }

    function stopAutoPlay() {
      clearInterval(timer);
    }

    nextBtn.addEventListener('click', function () {
      nextSlide();
      startAutoPlay();
    });

    prevBtn.addEventListener('click', function () {
      prevSlide();
      startAutoPlay();
    });

    // スクロール時に先頭スライドに戻す（この処理も info_top があるときのみ有効）
    window.addEventListener('scroll', () => {
      if (window.scrollY !== 0) {
        showSlide(0);
      }
    });

    showSlide(current);
    startAutoPlay();
  };




});

//for Google Tag Manager
var dataLayer = dataLayer || [];
dataLayer.push({ "data-track": true });
if (window.adId) {
  dataLayer.push({ adId: adId });
}

(function (w, d, s, l, i) {
  w[l] = w[l] || [];
  w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
  var f = d.getElementsByTagName(s)[0],
    j = d.createElement(s),
    dl = l != "dataLayer" ? "&l=" + l : "";
  j.async = true;
  j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
  f.parentNode.insertBefore(j, f);
})(window, document, "script", "dataLayer", "GTM-MHL8DBP");

//additional Google Tag Manager
(function (w, d, s, l, i) {
  w[l] = w[l] || [];
  w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
  var f = d.getElementsByTagName(s)[0],
    j = d.createElement(s),
    dl = l != "dataLayer" ? "&l=" + l : "";
  j.async = true;
  j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
  f.parentNode.insertBefore(j, f);
})(window, document, "script", "dataLayer", "GTM-M3QRHBV");

(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KBWLSHC');

//Cross-Brand Google Tag Manager
(function (w, d, s, l, i) {
  w[l] = w[l] || [];
  w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
  var f = d.getElementsByTagName(s)[0],
    j = d.createElement(s),
    dl = l != "dataLayer" ? "&l=" + l : "";
  j.async = true;
  j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
  f.parentNode.insertBefore(j, f);
})(window, document, "script", "dataLayer", "GTM-W9FQVCX");
