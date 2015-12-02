
// 请求CODE
function requestCode() {
  $.ajax({
    url: 'https://open.weixin.qq.com/connect/qrconnect',
    dataType: 'json',
    data: {
      appid: 'wx7a03718468e866dd',
      redirect_uri: 'http://himoca.com/us/invite.html',
      response_type: 'code',
      scope: 'snsapi_login'
    },
    success: function (d) {
      alert(JSON.stringify(d))
    }
  })
}
requestCode();

// https://open.weixin.qq.com/connect/qrconnect?appid=wx7a03718468e866dd&redirect_uri=http%3A%2F%2Fhimoca.com%2Fus%2Finvite.html&response_type=code&scope=snsapi_login#wechat_redirect
