'use strict';


(function hideShare(){
  $.ajax({
    url: location.protocol + '//' + location.host + '/Us/User/getJSSDK',
    dataType: 'json',
    data: {
      url: location.href,
      platform: 2
    },
    success: function (d) {
      wx.config({
        debug: enableAlertDebug ? true : false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
        appId: appId, // 必填，公众号的唯一标识
        timestamp: d.timestamp, // 必填，生成签名的时间戳
        nonceStr: d.noncestr, // 必填，生成签名的随机串
        signature: d.signature, // 必填，签名，见附录1
        jsApiList: ['hideOptionMenu'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
      });

		 wx.hideOptionMenu();
    }
  })
})()