(function () {
    var POPUP_SELECTOR = '[data-newsletter-popup]';
    var STORAGE_KEY = 'balmuda_newsletter_popup_closed_at';
    var SUBSCRIBED_STORAGE_KEY = 'balmuda_newsletter_popup_subscribed';
    var SHOW_DELAY = 6000;
    var HIDE_DURATION = 5 * 24 * 60 * 60 * 1000;

    function getStorageItem(key) {
        try {
            return window.localStorage.getItem(key);
        } catch (e) {
            return null;
        }
    }

    function setStorageItem(key, value) {
        try {
            window.localStorage.setItem(key, value);
        } catch (e) { }
    }

    function isRecentlyClosed() {
        var closedAt = parseInt(getStorageItem(STORAGE_KEY), 10);

        if (!closedAt) {
            return false;
        }

        return Date.now() - closedAt < HIDE_DURATION;
    }

    function isSubscribed() {
        return getStorageItem(SUBSCRIBED_STORAGE_KEY) === '1';
    }

    function showPopup(popup) {
        popup.classList.add('__visible');
        popup.setAttribute('aria-hidden', 'false');
    }

    function hidePopup(popup) {
        popup.classList.remove('__visible');
        popup.setAttribute('aria-hidden', 'true');
    }

    document.addEventListener('DOMContentLoaded', function () {
        var popup = document.querySelector(POPUP_SELECTOR);
        if (!popup || isSubscribed() || isRecentlyClosed()) {
            return;
        }

        var closeButton = popup.querySelector('[data-newsletter-popup-close]');
        var form = popup.querySelector('[data-newsletter-popup-form]');
        var input = popup.querySelector('input[name="email"]');
        var subscribeBase = popup.getAttribute('data-subscribe-base');

        window.setTimeout(function () {
            showPopup(popup);
        }, SHOW_DELAY);

        if (closeButton) {
            closeButton.addEventListener('click', function () {
                setStorageItem(STORAGE_KEY, String(Date.now()));
                hidePopup(popup);
            });
        }

        if (form && input && subscribeBase) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var email = input.value.replace(/^\s+|\s+$/g, '');

                if (!email) {
                    alert('メールアドレスをご確認ください');
                    return;
                }

                setStorageItem(SUBSCRIBED_STORAGE_KEY, '1');
                window.location.href = subscribeBase + encodeURIComponent(email);
            });
        }
    });
})();
