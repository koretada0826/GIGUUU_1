//レスポンシブ　共通フッタ用記述
if(ua.indexOf('iPhone') > 0 || ua.indexOf('iPod') > 0 || ua.indexOf('Android') > 0 && ua.indexOf('Mobile') > 0){
document.write((function(){/*

<script src="/sp/shared/cmn_footer/html/footer_nav.js" charset="UTF-8"></script>

*/}).toString().match(/\/\*([\s\S]*)\*\//)[1]);

}else{

document.write((function(){/*

<script src="/shared/cmn_footer/html/footer_nav.js" charset="UTF-8"></script>

*/}).toString().match(/\/\*([\s\S]*)\*\//)[1]);

}

