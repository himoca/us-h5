$(initApp);
function initApp() {
  var s = skrollr.init({
    // forceHeight: false,
    mobileDeceleration: 0.003
  });


  // $(document).keyup(function(e) {
	// 	if(e.keyCode == 38) {
  //
  //   }
	// })


  // var loadedImgLength = 0;
  // var allImageLength = $('.gallery-header img').length;
  // console.log(allImageLength);
  // $('.gallery-header img').on('load', function () {
  //   loadedImgLength += 1;
  //   if(loadedImgLength == allImageLength) {
  //     setTimeout(afterLoaded, 5000)
  //   }
  //
  // })

  function imgLoaded(elem, callback) {
    var needLoadImgLength = $(elem).length;
    var loadedImgLength = 0;

    $(elem).each(function (i, v) {
      if(this.tagName.toLowerCase() === 'img') { // img load事件
        $(v).on('load', function () {
          loadedImgLength += 1;
          console.log(needLoadImgLength, loadedImgLength);
          if(loadedImgLength == needLoadImgLength) {
            if(callback) callback();
          }
        }).each(function () {
          // 以防绶存的图片不触发load事件
          if(this.complete) $(this).load();
        })
      } else { // background-image load事件
        $('<img>').load(function () {
          loadedImgLength += 1;
          console.log(needLoadImgLength, loadedImgLength);
          if(loadedImgLength == needLoadImgLength) {
            if(callback) callback();
          }
        }).attr('src', function () {
          var imgUrl = $(v).css('background-image');
          imgUrl = imgUrl.slice(4, imgUrl.length - 1);
          return imgUrl;
        }).each(function () {
          // 以防绶存的图片不触发load事件
          if(this.complete) $(this).load();
        })
      }
    })

  }

  imgLoaded('.gallery-cover .photo-item-wrapper, .gallery-header img, .photo-group:nth-child(1) .photo-item-wrapper', afterLoaded);

  setTimeout(afterLoaded, 5000);

  function afterLoaded() {
    $('#loading').addClass('loaded-animation').on('webkitAnimationEnd animationend', function () {
      $('#skrollr-body').addClass('loaded-animation');
      $(this).remove();
    });
    $('#skrollr-body').on('webkitAnimationEnd animationend', function () {
      // $('#skrollr-body').removeClass('loaded-animation');
    });
  }

}
