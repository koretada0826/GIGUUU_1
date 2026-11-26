$(function () {
    const MODAL_VIEW = 1;
    //Ajaxの完了を待って処理
    let result = requestAjax();
    result.then(
        function (data) {
            if (data == MODAL_VIEW) {
                setCookieAndModalView();
            }
        },
        function () { return false; }
    );

    function requestAjax() {
        //状態を知らせるためにDeferredオブジェクトを生成しそれを返す
        let deferred = new $.Deferred();
        $.ajax({
            url: '/api/v1/checkLanguage',
            type: 'GET',
        })
            .then(
                function (data) {
                    deferred.resolve(data); //解決
                },
                function (data) {
                    alert('通信に失敗しました。 時間を置いて、再度お試しください。');
                    deferred.reject(); //却下
                }
            );
        return deferred;
    }

    function setCookieAndModalView() {
        let date = new Date(),
            nowTime = date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes();
        $('#nowdate').text(nowTime);

        let cookie = $.cookie('savetimes');
        if (!cookie) {
            $('body').append('<div id="oversas_overlay"></div><div id="oversas_modal">' +
                '<a href="javascript:void(0);" id="oversas_close"><img src="/jp/redirection-popup/img/close.svg" alt=""></a>' +
                '<h2><img src="/jp/redirection-popup/img/modal_logo.svg" alt="BALMUDA"></h2>' +
                '<div><p>Are you visiting us from outside of Japan?</p><p>Would you like to :</p></div>' +
                '<ul><li><a href="https://us.balmuda.com/"><figure><img src="/jp/redirection-popup/img/flag_us.svg" alt=""></figure>Go to<br><span>us.balmuda.com</span></a></li><li><a href="javascript:void(0);" id="stay_on"><figure><img src="/jp/redirection-popup/img/flag_jp.svg" alt=""></figure>Stay on<br><span>balmuda.com</span></a></li></ul>');
            $('#oversas_overlay, #oversas_modal').addClass('show');
            //date.setTime(date.getTime() + (3 * 1000)); // 10秒（検証用）
            date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000)); // 365日間
            $.cookie('savetimes', nowTime, { expires: date });
        }

        $('#oversas_close, #stay_on').on('click', function () {
            $('#oversas_overlay, #oversas_modal').removeClass('show');
        });
    }
});
