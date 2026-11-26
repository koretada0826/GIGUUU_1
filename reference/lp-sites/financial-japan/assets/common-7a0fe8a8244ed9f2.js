let header_h = 0;

//common
$(function () {
	const $window = $(window);
	const $htmlBody = $("html, body");
	const $topBtn = $(".to-top");
	const $globalHeader = $("#globalHeader");
	const $spMenu = $("#globalHeader .sp-menu");
	const $globalNavi = $("#globalHeader .global-navi");

	const getHeaderHeight = () => {
		return $globalHeader.outerHeight() || 0;
	};

	const getHashTarget = (hash) => {
		if (!hash || hash === "#") return $();

		try {
			const id = decodeURIComponent(hash.replace(/^#/, ""));
			const el = document.getElementById(id);
			return el ? $(el) : $();
		} catch (e) {
			return $();
		}
	};

	const scrollToTarget = ($target, duration = 500) => {
		if (!$target.length) return;

		const position = $target.offset().top - header_h;

		$htmlBody.stop().animate(
			{ scrollTop: position },
			duration
		);
	};

	const toggleTopButton = () => {
		if ($window.scrollTop() > 100) {
			$topBtn.fadeIn();
		} else {
			$topBtn.fadeOut();
		}
	};

	// トップページ：.con-box01 の上端が画面上端に達したらヘッダーに scrolled を付与
	const $scrolledTrigger = $("main#contents.home .con-box01").first();

	const toggleHeaderScrolled = () => {
		if (!$scrolledTrigger.length) return;

		const top = $scrolledTrigger.get(0).getBoundingClientRect().top;

		$globalHeader.toggleClass("scrolled", top <= 0);
	};

	$(".anchor-link").on("click", function (e) {
		const href = $(this).attr("href") || "";
		const hashIndex = href.indexOf("#");

		if (hashIndex === -1) return;

		const hash = href.slice(hashIndex);
		const $target = getHashTarget(hash);

		if (!$target.length) return;

		e.preventDefault();
		scrollToTarget($target, 500);
	});

	const urlHash = location.hash;

	if (urlHash) {
		window.scrollTo(0, 0);

		setTimeout(function () {
			const $target = getHashTarget(urlHash);
			scrollToTarget($target, 400);
		}, 50);
	}

	$topBtn.hide();
	toggleTopButton();
	toggleHeaderScrolled();

	$window.on("scroll", function () {
		toggleTopButton();
		toggleHeaderScrolled();
	});

	$window.on("load resize", toggleHeaderScrolled);

	$topBtn.on("click", function () {
		$htmlBody.animate({ scrollTop: 0 }, 500);
		return false;
	});

	$window.on("load", function () {
		$(".con-mv .mv-img").addClass("active");
	});

	actionPcEveryOnceTime.common = function () {
		header_h = getHeaderHeight();

		$spMenu.addClass("noactive");
		$globalNavi.addClass("noactive");
		$globalNavi.removeClass("active");
		$("html").removeClass("lock");
	};

	actionSpEveryOnceTime.common = function () {
		header_h = getHeaderHeight();

		setTimeout(function () {
			$spMenu.removeClass("noactive");
			$globalNavi.removeClass("noactive");
		}, 500);
	};

	ActionSingle("common");


	$("#globalHeader .sp-menu").on("click", function () {
		$(this).toggleClass("active");
		$(".global-navi").toggleClass("active");
		$("html").toggleClass("lock");
	});

});


//page
$(function () {

	$('.faq-list .item-q').on('click', function () {
		$(this).toggleClass('active');
		$(this).next().slideToggle();
	});

	const areaMapping = {
		'area01': 'hokkaido-tohoku',
		'area02': 'kanto',
		'area03': 'chubu-hokuriku',
		'area04': 'kansai',
		'area05': 'chugoku-shikoku',
		'area06': 'kyushu-okinawa'
	};

	$('.branchlist .area-list li').on('mouseenter', function () {
		const areaId = $(this).data('area');
		const svgAreaName = areaMapping[areaId];
		if (svgAreaName) {
			$('.branchlist .map svg path[data-area="' + svgAreaName + '"]').addClass('is-active');
		}
	}).on('mouseleave', function () {
		const areaId = $(this).data('area');
		const svgAreaName = areaMapping[areaId];
		if (svgAreaName) {
			$('.branchlist .map svg path[data-area="' + svgAreaName + '"]').removeClass('is-active');
		}
	});

	$('.branchlist .map svg path.map-area').on('mouseenter', function () {
		const svgAreaName = $(this).attr('data-area');
		const areaId = Object.keys(areaMapping).find(key => areaMapping[key] === svgAreaName);
		if (areaId) {
			$('.branchlist .area-list li[data-area="' + areaId + '"]').addClass('is-active');
		}
	}).on('mouseleave', function () {
		const svgAreaName = $(this).attr('data-area');
		const areaId = Object.keys(areaMapping).find(key => areaMapping[key] === svgAreaName);
		if (areaId) {
			$('.branchlist .area-list li[data-area="' + areaId + '"]').removeClass('is-active');
		}
	});

	$('.branchlist .area-list li').on('click', function () {
		const areaId = $(this).data('area');
		const svgAreaName = areaMapping[areaId];

		$('.branchlist .area-list li, .branchlist .map svg path.map-area').removeClass('is-selected');

		$(this).addClass('is-selected');

		if (svgAreaName) {
			$('.branchlist .map svg path[data-area="' + svgAreaName + '"]').addClass('is-selected');
		}

		$('.branchlist .branch-list .list-wrap').hide();
		if (areaId) {
			const $selectedWrap = $('.branchlist .branch-list .list-wrap[data-area="' + areaId + '"]');
			$selectedWrap.show();
			if (typeof SimpleBar !== 'undefined' && SimpleBar.instances) {
				const sbInstance = SimpleBar.instances.get($selectedWrap[0]);
				if (sbInstance) {
					sbInstance.recalculate();
				}
			}
			$(window).trigger('resize');
		}

		$('.branchlist .map-box').addClass('open');
	});

	$('.branchlist .map svg path.map-area').on('click', function () {
		const svgAreaName = $(this).attr('data-area');
		const areaId = Object.keys(areaMapping).find(key => areaMapping[key] === svgAreaName);

		$('.branchlist .area-list li, .branchlist .map svg path.map-area').removeClass('is-selected');

		$(this).addClass('is-selected');

		if (areaId) {
			$('.branchlist .area-list li[data-area="' + areaId + '"]').addClass('is-selected');
		}

		$('.branchlist .branch-list .list-wrap').hide();
		if (areaId) {
			const $selectedWrap = $('.branchlist .branch-list .list-wrap[data-area="' + areaId + '"]');
			$selectedWrap.show();
			if (typeof SimpleBar !== 'undefined' && SimpleBar.instances) {
				const sbInstance = SimpleBar.instances.get($selectedWrap[0]);
				if (sbInstance) {
					sbInstance.recalculate();
				}
			}
			$(window).trigger('resize');
		}

		$('.branchlist .map-box').addClass('open');
	});

	$('.branchlist .close, .map-box .close').on('click', function () {
		$('.branchlist .area-list li, .branchlist .map svg path.map-area').removeClass('is-selected');
		$('.branchlist .map-box').removeClass('open');
		$('.branchlist .branch-list .list-wrap').hide();
	});

	$('main#contents.recruit-home .con-box05 .list .list-item .item-title').matchHeight();

	$('main#contents.recruit-interview .con-box01 .interview-list .list-item .item-title').matchHeight();

});

//slider
$(function () {
	if ($('.history-box .swiper').length) {
		const historySwiper = new Swiper('.history-box .swiper', {
			slidesPerView: 'auto',
			spaceBetween: 20,
			freeMode: {
				enabled: true,
				momentum: true,
				sticky: false
			},
			grabCursor: true,
			speed: 600,
			loop: false,
			autoplay: false,


			navigation: {
				nextEl: '.history-box .swiper-next',
				prevEl: '.history-box .swiper-prev'
			},

			pagination: {
				el: '.history-box .swiper-pagination',
				type: 'progressbar',
			},

			mousewheel: {
				forceToAxis: true
			},
		});
	}

	if ($('.c-interview-slider .swiper').length) {
		$('.c-interview-slider .swiper').each(function () {
			const interviewSlider = new Swiper(this, {
				loop: true,
				slidesPerView: 1.5,
				loopAdditionalSlides: 6,
				spaceBetween: 20,
				speed: 6000,
				autoplay: {
					delay: 0,
					disableOnInteraction: false,
				},
				breakpoints: {
					500: {
						slidesPerView: 2.8,
					},
					769: {
						slidesPerView: 3.5,
						spaceBetween: 30,
					},
					1200: {
						slidesPerView: 4.5,
						spaceBetween: 30,
					},
				},
			});

			this.addEventListener('mouseenter', function () {
				const currentTranslate = interviewSlider.getTranslate();
				interviewSlider.autoplay.stop();
				interviewSlider.setTransition(0);
				interviewSlider.setTranslate(currentTranslate);
				interviewSlider.updateProgress(currentTranslate);
				interviewSlider.updateActiveIndex();
				interviewSlider.updateSlidesClasses();
				interviewSlider.animating = false;
			});

			this.addEventListener('mouseleave', function () {
				interviewSlider.setTransition(interviewSlider.params.speed);
				interviewSlider.autoplay.start();
				interviewSlider.slideNext(interviewSlider.params.speed);
			});
		});
	}

	if ($('.jobs-list .swiper').length) {
		$('.jobs-list').each(function () {
			const slider = $(this).find('.swiper')[0];
			const pagination = $(this).find('.swiper-pagination')[0];

			new Swiper(slider, {
				loop: true,
				slidesPerView: 1,
				observer: true,
				observeParents: true,
				pagination: {
					el: pagination,
					type: 'bullets',
					clickable: true,
				},
			});
		});

		$('.jobs-tab .tab-item').on('click', function () {
			const $tab = $(this);
			const tabName = $tab.data('tab');
			const $section = $tab.closest('.box03');
			const $target = $section.find('.jobs-list').filter(function () {
				return $(this).data('tab') === tabName;
			});

			if (!$target.length || $tab.hasClass('active')) return;

			$section.find('.jobs-tab .tab-item').removeClass('active');
			$section.find('.jobs-list').removeClass('active');
			$tab.addClass('active');
			$target.addClass('active');

			const targetSlider = $target.find('.swiper')[0];
			if (targetSlider && targetSlider.swiper) {
				targetSlider.swiper.update();
			}
		});
	}
});


//view
(function () {
	const ATTR_NAME = "data-view";
	const VIEWED_CLASS = "is-viewed";
	const FLAG_ATTR = "data-viewed";

	const getCountValues = (container) => {
		const $container = $(container);

		if ($container.hasClass("count-up-text")) {
			return $container.find(".value");
		}

		return $container.find(".count-up-text .value");
	};

	const prepareValues = (container) => {
		const $values = getCountValues(container);

		$values.each(function () {
			const $this = $(this);
			if ($this.attr("data-count-target")) return;

			const targetString = $this.text().trim();
			const targetWidth = Math.ceil(this.getBoundingClientRect().width);
			const widestString = targetString.replace(/\d/g, "8");
			$this.text(widestString);
			const widestWidth = Math.ceil(this.getBoundingClientRect().width);
			const fontSize = parseFloat(window.getComputedStyle(this).fontSize) || 1;
			const responsiveWidth = Math.max(targetWidth, widestWidth) / fontSize + 0.05;
			$this.attr("data-count-target", targetString);
			$this.css("width", responsiveWidth.toFixed(4) + "em");
			$this.text(targetString.indexOf(".") !== -1 ? "0.0" : "0");
		});

		$values.closest(".count-up-text").addClass("is-count-ready");
	};

	const animateValues = (container) => {
		getCountValues(container).each(function () {
			const $this = $(this);
			const targetString = $this.attr("data-count-target") || $this.text().trim();
			const isDecimal = targetString.indexOf(".") !== -1;
			const targetVal = parseFloat(targetString);
			if (isNaN(targetVal)) return;

			$({ countNum: 0 }).animate({
				countNum: targetVal
			}, {
				duration: 2000,
				easing: 'swing',
				step: function () {
					if (isDecimal) {
						$this.text((Math.floor(this.countNum * 10) / 10).toFixed(1));
					} else {
						$this.text(Math.floor(this.countNum));
					}
				},
				complete: function () {
					$this.text(targetString);
				}
			});
		});
	};

	const markViewed = (el) => {
		if (el.getAttribute(FLAG_ATTR) === "1") return;

		el.classList.add(VIEWED_CLASS);
		el.setAttribute(FLAG_ATTR, "1");

		animateValues(el);
	};

	const isInView = (el) => {
		const rect = el.getBoundingClientRect();
		const vh = window.innerHeight || document.documentElement.clientHeight;
		const vw = window.innerWidth || document.documentElement.clientWidth;

		return (
			rect.bottom >= 0 &&
			rect.right >= 0 &&
			rect.top <= vh &&
			rect.left <= vw
		);
	};

	const initIntersectionObserver = (targets) => {
		const io = new IntersectionObserver(function (entries, observer) {
			entries.forEach(function (entry) {
				if (!entry.isIntersecting && entry.intersectionRatio <= 0) return;

				markViewed(entry.target);
				observer.unobserve(entry.target);
			});
		}, {
			threshold: 0,
			rootMargin: "0px 0px 0px 0px",
		});

		targets.forEach(function (el) {
			io.observe(el);
		});
	};

	const initFallback = (targets) => {
		let remainingTargets = targets;

		const check = () => {
			remainingTargets = remainingTargets.filter(function (el) {
				if (el.getAttribute(FLAG_ATTR) === "1") return false;

				if (isInView(el)) {
					markViewed(el);
					return false;
				}

				return true;
			});

			if (!remainingTargets.length) {
				window.removeEventListener("scroll", check);
				window.removeEventListener("resize", check);
			}
		};

		window.addEventListener("scroll", check);
		window.addEventListener("resize", check);
		check();
	};

	const initViewObserver = () => {
		const nodes = Array.prototype.slice.call(
			document.querySelectorAll("[" + ATTR_NAME + "]")
		);

		if (!nodes.length) return;

		nodes.forEach(function (el) {
			prepareValues(el);

			if (el.getAttribute(FLAG_ATTR) === "1") return;

			if (isInView(el)) {
				markViewed(el);
			}
		});

		const remaining = nodes.filter(function (el) {
			return el.getAttribute(FLAG_ATTR) !== "1";
		});

		if (!remaining.length) return;

		if ("IntersectionObserver" in window) {
			initIntersectionObserver(remaining);
		} else {
			initFallback(remaining);
		}
	};

	if (document.readyState === "complete" || document.readyState === "interactive") {
		setTimeout(initViewObserver, 0);
	} else {
		document.addEventListener("DOMContentLoaded", initViewObserver);
	}
})();


//snowmoney
$(function () {
	const $form = $(".snow-monkey-form");

	if (!$form.length) return;

	const removeInlineStyles = () => {
		$(
			[
				"style#snow-monkey-forms-control-checkboxes-style-inline-css",
				"style#snow-monkey-forms-control-file-style-inline-css",
				"style#snow-monkey-forms-item-style-inline-css",
				"style#snow-monkey-forms-control-radio-buttons-style-inline-css",
				"style#snow-monkey-forms-control-select-style-inline-css",
				"style#snow-monkey-forms-control-text-style-inline-css",
				"style#snow-monkey-forms-control-textarea-style-inline-css",
			].join(",")
		).remove();
	};

	const setPrivacyLink = () => {
		const url = $("body").attr("data-url") || "";

		$('.smf-placeholder[data-name="agree"] .smf-checkbox-control__label')
			.html('<a href="' + url + '/customer/privacy/" target="_blank" rel="noopener">プライバシーポリシー</a>について同意する');
	};

	const ensureEmailChecker = () => {
		const $email = $form.find('input[name="email"]');
		const $emailConfirm = $form.find('input[name="email_confirm"]');

		if (!$email.length || !$emailConfirm.length) return;

		let $err = $emailConfirm.next(".smf-error-messages");

		if (!$err.length) {
			$err = $("<div/>", {
				class: "smf-error-messages",
				text: "メールアドレスが一致しません。",
				"aria-live": "polite",
			}).hide();

			$emailConfirm.after($err);
		}

		const $submit = $form.find('button[type="submit"], input[type="submit"]');
		const email = ($email.val() || "").trim();
		const emailConfirm = ($emailConfirm.val() || "").trim();
		const isMismatch = email && emailConfirm && email !== emailConfirm;

		$err.toggle(!!isMismatch);
		$submit.prop("disabled", !!isMismatch);
	};

	const initDatepicker = () => {
		if (typeof $.fn.datepicker === 'undefined') return;

		if (!$.datepicker.regional['ja']) {
			$.datepicker.regional['ja'] = {
				closeText: '閉じる',
				prevText: '&#x3C;前',
				nextText: '次&#x3E;',
				currentText: '今日',
				monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
				monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
				dayNames: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
				dayNamesShort: ['日', '月', '火', '水', '木', '金', '土'],
				dayNamesMin: ['日', '月', '火', '水', '木', '金', '土'],
				weekHeader: '週',
				dateFormat: 'yy/mm/dd',
				firstDay: 0,
				isRTL: false,
				showMonthAfterYear: true,
				yearSuffix: '年'
			};
			$.datepicker.setDefaults($.datepicker.regional['ja']);
		}

		// 年末年始休業 (12/30〜1/3)
		const isHolidayPeriod = (date) => {
			const m = date.getMonth() + 1;
			const d = date.getDate();

			return (m === 12 && d >= 30) || (m === 1 && d <= 3);
		};

		// 営業日 = 土日・年末年始休業を除いた日
		const isBusinessDay = (date) => {
			const day = date.getDay();

			return day !== 0 && day !== 6 && !isHolidayPeriod(date);
		};

		// 翌日から数えて3営業日先を最短の選択可能日にする
		const getMinDate = () => {
			const date = new Date();
			let count = 0;

			date.setHours(0, 0, 0, 0);

			while (count < 3) {
				date.setDate(date.getDate() + 1);

				if (isBusinessDay(date)) count += 1;
			}

			return date;
		};

		// name属性、もしくはWP管理画面で付与した .js-datepicker クラスでターゲットを絞る
		const $dateInputs = $form.find('input[name="date1_day"], input[name="date2_day"]');

		$dateInputs.each(function () {
			$(this).attr('autocomplete', 'off');
			if (!$(this).hasClass('hasDatepicker')) {
				$(this).datepicker({
					minDate: getMinDate(),
					beforeShowDay: function (date) {
						// 年末年始休業 (12/30〜1/3) は選択不可
						if (isHolidayPeriod(date)) {
							return [false, "ui-state-disabled", "年末年始休業"];
						}
						return [true, ""];
					}
				});
			}
		});
	};

	const rebind = () => {
		setPrivacyLink();
		ensureEmailChecker();
		initDatepicker();
	};

	removeInlineStyles();
	rebind();

	$(document).on(
		"input",
		'input[name="email"], input[name="email_confirm"]',
		ensureEmailChecker
	);

	const formEl = $form.get(0);

	if (formEl) {
		["smf.back", "smf.invalid", "smf.confirm", "smf.render"].forEach(function (eventName) {
			formEl.addEventListener(eventName, rebind);
		});
	}

	$(window).on("load", rebind);
});

//top mv
$(function () {
	const phases = [
		'phase-day',
		'phase-evening1',
		'phase-evening2',
		'phase-night1',
		'phase-night2',
		'phase-night3'
	];
	let currentPhaseIndex = 0;

	const $animation = $('.animation');
	const $box03 = $('.box03');
	const $conMv = $('.con-mv');

	if ($animation.length) {
		const $targets = $animation.add($box03).add($conMv);

		// 5秒ごとの自動切り替え
		setInterval(function () {
			$targets.removeClass(phases[currentPhaseIndex]);
			currentPhaseIndex = (currentPhaseIndex + 1) % phases.length;
			$targets.addClass(phases[currentPhaseIndex]);
		}, 5000);
	}
});
