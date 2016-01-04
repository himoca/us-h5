var initPhotoSwipeFromDOM = function(gallerySelector) {

  // 从DOM上解析slide需要的数据
  var parseThumbnailElements = function(el) {
    var items = [];
    $('.photo-item', el).each(function (index, photoItem) {
      var $photoItem = $(photoItem),
        $linkEl = $('a', photoItem),
        size = $linkEl.attr('data-size').split('x'),
        item = {
          src: $linkEl.attr('href'),
          msrc: $('img', $linkEl).attr('data-original'),
          w: parseInt(size[0], 10),
          h: parseInt(size[1], 10),
          el: photoItem,
          author: $photoItem.attr('data-author'),
		  likecount: $photoItem.attr('data-likecount'),
		  commentcount: $photoItem.attr('data-commentcount')
        };
      if($photoItem.attr('data-description').length > 0) {
        item.title = $photoItem.attr('data-description');
      }
      if($photoItem.attr('data-shoot-time').length > 0) {
        item.shootTime = $photoItem.attr('data-shoot-time');
      }
      if($photoItem.attr('data-avatar').length > 0) {
        item.avatar = $photoItem.attr('data-avatar');
      }

      items.push(item);
    })
    // console.log(items);
    return items;
  };


  // 当用户点击缩略图时的事件处理程序
  var onThumbnailsClick = function(e) {
    e.preventDefault();
    var index = $('.photo-item').index($(e.target).closest('.photo-item'));
    var clickedGallery = $(e.target).closest('.photo-group-container')[0];
    openPhotoSwipe(index, clickedGallery);
  };

  // parse picture index and gallery index from URL (#&pid=1&gid=2)
  var photoswipeParseHash = function() {
    var hash = window.location.hash.substring(1),
      params = {};

    if (hash.length < 5) {
      return params;
    }

    var vars = hash.split('&');
    for (var i = 0; i < vars.length; i++) {
      if (!vars[i]) {
        continue;
      }
      var pair = vars[i].split('=');
      if (pair.length < 2) {
        continue;
      }
      params[pair[0]] = pair[1];
    }

    if (params.gid) {
      params.gid = parseInt(params.gid, 10);
    }

    return params;
  };

  var openPhotoSwipe = function(index, galleryElement, disableAnimation, fromURL) {
    var pswpElement = document.querySelectorAll('.pswp')[0],
      gallery,
      options,
      items;

    items = parseThumbnailElements(galleryElement);

    // 定义 options
    options = {

      // define gallery index (for URL)
      galleryUID: galleryElement.getAttribute('data-pswp-uid'),
      loop: false,
      showHideOpacity: true,
      loadingIndicatorDelay: 500,
      pinchToClose: false,
      closeOnVerticalDrag: false,
		//allowUserZoom: false,
      // getThumbBoundsFn: false,
      // focus: false,
      // tapToClose: true ,
    };

    // PhotoSwipe opened from URL
    if (fromURL) {
      if (options.galleryPIDs) {
        // parse real index when custom PIDs are used
        // http://photoswipe.com/documentation/faq.html#custom-pid-in-url
        for (var j = 0; j < items.length; j++) {
          if (items[j].pid == index) {
            options.index = j;
            break;
          }
        }
      } else {
        // in URL indexes start from 1
        options.index = parseInt(index, 10) - 1;
      }
    } else {
      options.index = parseInt(index, 10);
    }

    // exit if index not found
    if (isNaN(options.index)) {
      return;
    }

    if (disableAnimation) {
      options.showAnimationDuration = 0;
    }

    // Pass data to PhotoSwipe and initialize it
    gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);

    gallery.listen('updateScrollOffset', function(_offset) {

      var r = gallery.template.getBoundingClientRect();
      // console.log(r);
      _offset.x = 0;
      _offset.y = 0;
      // console.log(_offset);
      //console.log(gallery);

    });

    // gallery.listen('afterchange', function () {
    //   console.log('改变后');
    //
    //   var currentPhotoIndex = this.getCurrentIndex();
    //   $('.photo-item').eq(currentPhotoIndex)[0].scrollIntoView();
    //
    // });

    gallery.listen('afterChange', function () {
      // 打开后插入 拍摄时间， 作者名字， 作者头像
      // console.log(moment(parseInt(gallery.currItem.shootTime)));
      // moment.locale('zh-cn')
      var shootTimeYear = new Date(parseInt(gallery.currItem.shootTime)).getFullYear();
      var shootTime;
      if(shootTimeYear === new Date().getFullYear()) {
        shootTime = moment(parseInt(gallery.currItem.shootTime)).format('MM[月]DD[日] HH:mm');
      } else {
        shootTime = moment(parseInt(gallery.currItem.shootTime)).format('YYYY[年]MM[月]DD[日] HH:mm')
      }

      // var shootTime = moment(parseInt(gallery.currItem.shootTime)).format('YYYY[年]MM[月]DD[日] HH:mm');
      // TODO: 如果是今年不显示年份

      $(gallery.template).find('.pswp__shoot-time').html(shootTime);
      $(gallery.template).find('.pswp__author__name').html(gallery.currItem.author);
		$(gallery.template).find('.pswp__bubblenum').html(gallery.currItem.commentcount);
		$(gallery.template).find('.pswp__heartnum').html(gallery.currItem.likecount);
      $(gallery.template).find('.pswp__author__avatar img').attr('src', gallery.currItem.avatar);
	});

    gallery.init();


    // console.log(gallery.currItem.shootTime);
    //
  };

  // loop through all gallery elements and bind events
  var galleryElements = document.querySelectorAll(gallerySelector);

  $(gallerySelector).each(function (i, v) {
    $(v).attr('data-pswp-uid', i + 1);
    $(v).on('click', '.photo-item', onThumbnailsClick);
  })


  // Parse URL and open gallery if it contains #&pid=3&gid=1
  var hashData = photoswipeParseHash();
  if (hashData.pid && hashData.gid) {
    openPhotoSwipe(hashData.pid, galleryElements[hashData.gid - 1], true, true);
  }
};
