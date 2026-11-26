//レスポンシブ　共通フッタ用記述
if(ua.indexOf('iPhone') > 0 || ua.indexOf('iPod') > 0 || ua.indexOf('Android') > 0 && ua.indexOf('Mobile') > 0){
document.write((function(){/*

<script>footerNavi("products1","black","/sw/onlinestore/","/navi/index.html",""); </script>

*/}).toString().match(/\/\*([\s\S]*)\*\//)[1]);

}else{
document.write((function(){/*

<script>footerNavi("products1", "black", "980px", "/beautykey/catalog/ei/index.html", "/sw/onlinestore/", "/navi/index.html");</script>

*/}).toString().match(/\/\*([\s\S]*)\*\//)[1]);

}
