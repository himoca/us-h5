'use strict';
// var pictureBaseUrl = 'http://uspic-10006628.file.myqcloud.com/';
// var thumbnailBaseUrl = 'http://119.29.77.36:9990/Us/Thumbimg/pictureFactory?tencentPicName=';
// var baseUrl = 'http://app.himoca.com/Us/event/'; // 集成环境
// var baseUrl = 'http://app.himoca.com:9982/Us/event/'; // 萌萌的机子

var enableDesktopDebug = false;
var enableAlertDebug = false;

var apiUrl = location.protocol + '//' + location.host + '/Us/system/getDomainInfo';
var urlProtocol = location.protocol + '//';

if(location.protocol === 'file:') {
	apiUrl = 'http://app.himoca.com/Us/system/getDomainInfo';
	urlProtocol = 'http://';
}

var urlConfig = {};
var memberList = {};
var versionNumber = '1.1.0';

var appId;
// 正式环境
if (location.host === 'us-api.himoca.com') {
	appId = 'wx016c96595410cf52';
}
// 开发环境
if (location.host === 'app.himoca.com') {
	appId = 'wxea7a5f9ccf96e433';
}
// 审核环境
if (location.host === 'ios.himoca.com') {
	appId = 'wx627e1a2a49cc2810';
}

var galleryConfig = {
	header: false,  //头部
	headerHeight: 93,  //头部高度
	footerWidthDescriptionHeight: 135,  //页脚宽度描述高度135
	footerWidthoutDexcriptionHeight: 75, //页脚外宽度描述高度
	filterType: -1 // -1是原图  0是1977  1是lomoFi  2是Hefe  3是Inkwell
};

var galleryData = {
	galleryAvatars: [],
	eventId: null,
	invitationCode: null,
	// uid: 474,
	uid: enableDesktopDebug ? 474 : null,
	nickname: null,
	avatar: null,
	sessionKey: null,
	momentId: null,
	title: '',
	cover: '',
	date: null,
	fixedTemplateIndex: [] // 最后一组模板特殊处理，
};


var downloadLink = {
	ios: 'https://itunes.apple.com/cn/app/us/id1041870519',
	android: 'http://us.himoca.com/apk/moca_us.apk',
	microdownload: 'http://a.app.qq.com/o/simple.jsp?pkgname=com.hoolai.us&g_f=991653',
	yyb: '' // 应用宝
};

var ua = navigator.userAgent;
var environment = {
	isWeixin: (/MicroMessenger/i).test(ua),
	isWeixinLogin: !!getQueryStringArgs().code,
	isQq: (/QQ/i).test(ua),
	isIos: (ua.indexOf('Mac') > -1 && ua.indexOf('Mobile') > -1),
	isAndroid: (ua.indexOf('Mozilla/5.0') > -1 && ua.indexOf('Android ') > -1 && ua.indexOf('AppleWebKit') > -1),
	isWeibo: (ua.indexOf('Weibo') > -1),
	isWinPhone: (ua.indexOf('Windows Phone') > -1)
};

if (enableAlertDebug) {
	alert(JSON.stringify(environment))
}
console.log(environment);

// 获取操作系统
function getOsVersion() {
	var osVersion;
	if (environment.isIos) {
		osVersion = 'ios';
	}else if (environment.isAndroid) {
		osVersion = 'android';
	}else if (environment.isWinPhone) {
		osVersion = 'winphone'
	}else {
		osVersion = 'web';
	}
	return osVersion;
}

// 获取查询字符串参数
function getQueryStringArgs() {
	var qs = (location.search.length > 0 ? location.search.substring(1) : ""),
		args = {},
		items = qs.length ? qs.split("&") : [],
		item = null,
		name = null,
		value = null,
		i = 0,
		len = items.length;
	for (i = 0; i < len; i++) {
		item = items[i].split('=');
		name = decodeURIComponent(item[0]);
		value = decodeURIComponent(item[1]);
		if (name.length) {
			args[name] = value;
		}
	}
	return args;
}


// 根据需要返回2倍图大小
function getRetinaImgSize(size) {
	if(window.devicePixelRatio >= 2) {
		return size*2;
	} else {
		return size;
	}
}

// function redirectTo(argument) {
//   // body...
// }

// var loginMarkCheckCode = getQueryStringArgs().invitation_code;
//var loginMarkKey = $.cookie('loginMarkCookie');
//var hasLoginMarkKey = $.cookie('hasLoginCookie');
var redirectUrl = location.protocol + '//' + location.host + location.pathname + '?invitation_code=' + getQueryStringArgs().invitation_code + '&target=invite';
// 如果是微信环境且查询字符串的target是invite且还没获取code，则跳到授权页
if (environment.isWeixin && getQueryStringArgs().target === 'invite' && !getQueryStringArgs().code) {
	if (loginMarkKey !== 'CheckCheck') {
		//alert('重新授权' + loginMarkKey);
		location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appId + '&redirect_uri=' + encodeURIComponent(redirectUrl) + '&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect';
	}else {
		location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appId + '&redirect_uri=' + encodeURIComponent(redirectUrl) + '&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect';
	}
}


// 获取微信用户信息
function register() {
	$.ajax({
		// url: 'http://app.himoca.com/Us/User/webRegister',
		url: urlProtocol + urlConfig.init_domain + '/Us/User/webRegister',
		dataType: 'json',
		data: {
			code: getQueryStringArgs().code,
			invitation_code: getQueryStringArgs().invitation_code,
			type: 3,
			platform: 2,
			device_id: 'web',
			os_version: getOsVersion(),
			client_version: versionNumber,
			phone_model: getOsVersion(),
			distributor: 'web'
		},
		success: function (d) {
			// if(enableAlertDebug) {
			//   alert('register返回' + JSON.stringify(d));
			// }

			// 如果该用户没有获取过用户信息，则跳到授权权限为userinfo的授权
			// if(!d.exist) {
			//
			// }
			if (enableAlertDebug) {
				alert('register返回' + JSON.stringify(d));
				alert(getQueryStringArgs().code);
				//alert(getQueryStringArgs().invitation_code);
			}

			// if (d.c !== 200) {
			// 	alert('活动不存在');
			// }else{
				galleryData.sessionKey = d.session_key;
				galleryData.avatar = d.avatar;
				galleryData.uid = d.uid;
				galleryData.nickname = d.nickname;

				// var loginMarkCookie = getQueryStringArgs().invitation_code;
				$.cookie('loginMarkCookie','CheckCheck',{expires:30});
				if(d.uid) getGallery();
			// }
		},
		error: function(e) {
			// $('.onload-gif').hide();
			// clearInterval(onloadGifTime);
			alert('活动不存在');
			$('#onload-gifimg').remove();
			WeixinJSBridge.call('closeWindow');
		}
	})
}

//重复登录跳过授权
function loginCheck() {
	$.ajax({
		url: urlProtocol + urlConfig.init_domain + '/Us/User/webLogin',
		dataType: 'json',
		data: {
			code: getQueryStringArgs().code,
			invitation_code: getQueryStringArgs().invitation_code,
			type: 3,
			platform: 2,
			device_id: 'web',
			os_version: getOsVersion(),
			client_version: versionNumber,
			phone_model: getOsVersion(),
			distributor: 'web'
		},
		success: function (d) {
			//alert(JSON.stringify(d));
			if (d.c !== 200) {
				// $('.onload-gif').hide();
				// clearInterval(onloadGifTime);
				alert('活动不存在');
				$('#onload-gifimg').remove();
				WeixinJSBridge.call('closeWindow');
			}else if (d.p.uid && d.p.avatar && d.p.session_key && d.p.nickname && d.p.session_key !== 'false') {
				galleryData.sessionKey = d.p.session_key;
				galleryData.avatar = d.p.avatar;
				galleryData.uid = d.p.uid;
				galleryData.nickname = d.p.nickname;
				// alert(JSON.stringify(d));
				//alert(getQueryStringArgs().code);
				//alert(getQueryStringArgs().invitation_code);
				//alert(JSON.stringify(d.p));
				$.cookie('hasLoginCookie','LoginCheck',{expires:30});
				getGallery();
			} else {
				//alert('静默授权重定向');
				if (hasLoginMarkKey == 'LoginCheck') {
					$.cookie('hasLoginCookie','',{expires:-1});
					location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appId + '&redirect_uri=' + encodeURIComponent(redirectUrl) + '&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect';
				}else {
				$.cookie('loginMarkCookie','',{expires:-1});
				location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appId + '&redirect_uri=' + encodeURIComponent(redirectUrl) + '&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect';
				}
			}
		},
		error: function(e){
			// $('.onload-gif').hide();
			// clearInterval(onloadGifTime);
			alert('活动不存在');
			$('#onload-gifimg').remove();
			WeixinJSBridge.call('closeWindow');
		}
	})
}

//邀请载入提示
function inviteOnloadTip() {
	var templateInviteOnloadTip = _.template($('#invite-onload-tip').text());
	if (parseInt(window.screen.height) <= 500) {
	    var templateInviteOnloadTips = templateInviteOnloadTip({inviteOnloadTipCoverTop: '100px'});
	  }else {
	    var templateInviteOnloadTips = templateInviteOnloadTip({inviteOnloadTipCoverTop: $('.gallery-cover').offset().top - 20 + 'px'});
	  }
	var $templateInviteOnloadTips = $(templateInviteOnloadTips);
	var $modalBackdrop = $('<div class="modal-backdrop"></div>');
	//alert(inviteOnloadTipCoverTop);
	$templateInviteOnloadTips.addClass('show').appendTo('body');
	$('.onloadtip-btnarea').on('click', function (e) {
		e.preventDefault();
		$('body').unbind('touchmove');
		$(this).closest('.onloadtip').removeClass('show');
		$modalBackdrop.removeClass('show');
		$templateInviteOnloadTips.remove();
		$modalBackdrop.remove();
	});
	$modalBackdrop.addClass('show').appendTo('body');
	$('body').bind('touchmove', function (e) {
		e.preventDefault();
	});
}

//上传锁定提示
function activeLockTip() {
	var templateToolbarLockTip = _.template($('#template-activelocked-tip').text());
	var templateToolbarLockTipNicname = templateToolbarLockTip({locktipnicname: memberList.creaternicname});
	var $templateToolbarLockTipNicname = $(templateToolbarLockTipNicname);
	var $modalBackdrop = $('<div class="modal-backdrop"></div>');
	$templateToolbarLockTipNicname.addClass('show').appendTo('body');
	$('.locktipbtn').on('click', function (e) {
		e.preventDefault();
		$('body').unbind('touchmove');
		$(this).closest('.locktip').removeClass('show');
		$modalBackdrop.removeClass('show');
		$templateToolbarLockTipNicname.remove();
		$modalBackdrop.remove();
	});
	$modalBackdrop.addClass('show').appendTo('body');
	$('body').bind('touchmove', function (e) {
		e.preventDefault();
	});
}

//网页已加载后，上传失败锁定提示，确定后刷新页面
function appearLockTip() {
	var templateToolbarLockTip = _.template($('#template-activelocked-tip').text());
	var templateToolbarLockTipNicname = templateToolbarLockTip({locktipnicname: memberList.creaternicname});
	var $templateToolbarLockTipNicname = $(templateToolbarLockTipNicname);
	var $modalBackdrop = $('<div class="modal-backdrop"></div>');
	$templateToolbarLockTipNicname.addClass('show').appendTo('body');
	$('.locktipbtn').on('click', function (e) {
		e.preventDefault();
		$('body').unbind('touchmove');
		$(this).closest('.locktip').removeClass('show');
		$modalBackdrop.removeClass('show');
		$templateToolbarLockTipNicname.remove();
		$modalBackdrop.remove();
		location.replace(location.protocol + '//' + location.host + location.pathname + '?invitation_code=' + getQueryStringArgs().invitation_code + '&target=invite');
	});
	$modalBackdrop.addClass('show').appendTo('body');
	$('body').bind('touchmove', function (e) {
		e.preventDefault();
	});
}

function createMoment() {
	if (enableAlertDebug) {
		alert('创建动态发送的event_id为' + galleryData.eventId + 'login_uid为' + galleryData.uid)
	}
	$.ajax({
		url: urlProtocol + urlConfig.init_domain + '/Us/Event/CreateMoment',
		dataType: 'json',
		data: {
			event_id: galleryData.eventId,
			login_uid: galleryData.uid,
			session_key: galleryData.sessionKey,
			platform: 2
		},
		success: function (d) {
			//alert(JSON.stringify(d));

			console.log('createMoment', d);
			galleryData.momentId = d.p.moment_id;
			//alert(galleryData.eventId + ';' + galleryData.uid + ';' + galleryData.sessionKey)
			//alert(galleryData.momentId);
			if (d.c == 403) {
				$('.upload-cover').css('display','inline-block').on('click',function(){
					activeLockTip();
				});
			}else {
				uploadFile();
			}
		}
	})
}

var uploadTipCount = 0;
//上传图片
function uploadFile() {
	var pictureIdArray = [];
	var pictureIndex = 0;

	if (uploadTipCount == 0) {
		$('.upload-cover').on('click',function (e) {
			e.preventDefault();
			//alert('1');
			var templateInviteUploadTip = _.template($('#invite-upload-tip').text());
			var templateInviteUploadTips = templateInviteUploadTip();
			var $templateInviteUploadTips = $(templateInviteUploadTips);
			var $modalBackdrop = $('<div class="modal-backdrop"></div>');
			$templateInviteUploadTips.addClass('show').appendTo('body');
			$('.close').on('click', function (e) {
				e.preventDefault();
				$('body').unbind('touchmove');
				$(this).closest('.uploadtip').removeClass('show');
				$modalBackdrop.removeClass('show');
				$templateInviteUploadTips.remove();
				$modalBackdrop.remove();
			});
			$('.uploadtip-continue').on('click', function (e) {
				e.preventDefault();
				$('body').unbind('touchmove');
				$('#input-file').removeAttr("disabled");
				$(this).closest('.uploadtip').removeClass('show');
				$modalBackdrop.removeClass('show');
				$templateInviteUploadTips.remove();
				$modalBackdrop.remove();
				$('.upload-cover').css('display','none');
				uploadTipCount++;
				uploadFile();
			});
			$('.uploadtip-download').on('click', function (e) {
				e.preventDefault();
				$('body').unbind('touchmove');
				$(this).closest('.uploadtip').removeClass('show');
				$modalBackdrop.removeClass('show');
				$templateInviteUploadTips.remove();
				$modalBackdrop.remove();
				location.href = downloadLink.microdownload;
			});
			$modalBackdrop.addClass('show').appendTo('body');
			$('body').bind('touchmove', function (e) {
				e.preventDefault();
			});
		});
	}else {
		setTimeout(function(){
			$('#input-file').click();
		},300);

		$('#input-file').fileupload({
			url: urlProtocol + urlConfig.upload_domain + '/Us/Event/upload',
			dataType: 'json',
			// sequentialUploads: true,
			// limitConcurrentUploads: true,
			// multipart: ,
			autoUpload: enableDesktopDebug ? false : true,
			disableImageResize: /Android(?!.*Chrome)|Opera/.test(window.navigator && navigator.userAgent),  //是否可用调整图片大小
			// imageMaxWidth: 1080,
			// imageMaxHeight: 1080,
			imageOrientation: true, // 采用exif中的方向
			disableImageMetaDataSave: true, // imageOrientation旋转图片并没有更改exif中的方向，这样导致终端渲染图片时如果要依赖于图片的exif中的orientation，会渲染错误，disableImageMetaDataSave直接不保存exif信息
			imageType: 'image/jpeg', // 转换格式
			imageQuality: 0.5, // 图片质量
			loadImageMaxFileSize: 50000000,
			limitMultiFileUploadSize: 50000000
		}).on('fileuploadadd', function (e, data) {
			var formData = {},
				exif,
				options = {};

			console.log(e);
			$('.state').addClass('hide');
			$('.state-upload').removeClass('hide');

			loadImage(
				data.files[0],
				function (img) {

					formData.login_uid = galleryData.uid;
					formData.moment_id = galleryData.momentId;
					formData.event_id = galleryData.eventId;
					formData.session_key = galleryData.sessionKey;
					formData.size = img.width + 'x' + img.height;
					data.formData = formData;
					console.log(data);

					console.log(img);

				}, options);


			loadImage.parseMetaData(
				data.files[0],
				function (exifData) {
					console.log(exifData);
					console.log(exifData.exif);
					if(exifData.exif) {
						exif = exifData.exif;
						console.log(exifData.exif.getAll());

						options.orientation = exif.get('Orientation');
						// exif中保存的源数据类似这样 "2015:10:27 11:05:37"，要转成时间戳
						// console.log(moment("2015:10:27 11:05:37", 'YYYY:MM:DD HH:mm:ss').valueOf());
						if(exifData.exif.get('DateTimeDigitized')) {
							formData.shoot_time = moment(exifData.exif.get('DateTimeDigitized'), 'YYYY:MM:DD HH:mm:ss').valueOf();
						} else if(exifData.exif.get('DateTime')) {
							formData.shoot_time = moment(exifData.exif.get('DateTime'), 'YYYY:MM:DD HH:mm:ss').valueOf();
						} else {
							formData.shoot_time = data.originalFiles[0].lastModifiedDate.getTime();
						}
						console.log(formData.shoot_time);

					} else {
						// 如果没有exif就用文件的lastModifiedDate
						console.log(data.originalFiles[0].lastModifiedDate);
						formData.shoot_time = data.originalFiles[0].lastModifiedDate.getTime();
						console.log(formData.shoot_time);

					}

				}
			);


			// var totalFileNum = data.files.length;
			// var $totalFile = $('.file-total');

			// $totalFile.html(data.originalFiles.length);
			// console.log(data);
			//alert(JSON.stringify(data));
		}).on('fileuploadprogressall', function (e, data) {
			// console.log(data.loaded + '/' + data.total);
			// console.log(data);
			var progress = parseInt(data.loaded / data.total * 100, 10);
			$('.toolbar-bottom .progress-bar').css('width', progress + '%' );
		}).on('fileuploadfail',function(){
			$('.state-progress').hide();
			$('.state-text').css({margin:"0 auto",color:"#f00"}).html("上传失败，请点击重试").on('click',function(){
				location.replace(location.protocol + '//' + location.host + location.pathname + '?invitation_code=' + getQueryStringArgs().invitation_code + '&target=invite');
			});

		}).on('fileuploaddone', function (e, data) {
			// alert(JSON.stringify(data.files[0].preview));
			 $('.state-progress').hide();  //上传完成提示
			var stateText = $('.state-text').text();
			if(stateText !== "上传失败，请点击重试") {
				 $('.state-text').css("margin","0 auto").html("上传结束，刷新中…");
			}
			console.log('上传done', data);
			// alert('上传完成')
			pictureIndex++;
			// $('.toolbar-bottom .file-uploaded').html(pictureIndex);
			pictureIdArray.push(data.result.p.picture_id);
			// alert(JSON.stringify(data.result));

			console.log('picture_ids为' + data.result.p.picture_id, 'moment_id为' + galleryData.momentId, 'event_id' + galleryData.eventId);
			if(pictureIndex === data.originalFiles.length) {
				commitUpload(pictureIdArray.join(','));
			}
		})
	}
}

// 所有图片都上传完了要commit一下
function commitUpload(picture_ids) {
	$.ajax({
		url: urlProtocol + urlConfig.init_domain + '/Us/Event/commit',
		dataType: 'json',
		data: {
			moment_id: galleryData.momentId,
			event_id: galleryData.eventId,
			login_uid: galleryData.uid,
			session_key: galleryData.sessionKey,
			picture_ids: picture_ids,
			platform: 2
		},
		// error: function(){
		//   alert('momentid为' + galleryData.momentId);
		//   alert('eventId为' + galleryData.eventId);
		//   alert('uid为' + galleryData.uid);
		//   alert('picture_ids为' + picture_ids);
		// },
		success: function (d) {
			//alert('完成后返回');
			//判断活动是否锁定，是则不允许上传照片
			if(d.c == 403){
				appearLockTip();
			}else {
				console.log('commit返回',d);
				sessionStorage['just-uploaded'] = "1";
				location.replace(location.protocol + '//' + location.host + location.pathname + '?invitation_code=' + getQueryStringArgs().invitation_code + '&target=invite');
			}
		},
		error: function(e){
			//alert(JSON.stringify(e));
		}
	})
}

// 微信上传commit
function commitWeChatUpload(picture_ids) {
	//alert('即将传值' + 'moment_id:' + galleryData.momentId +',' + 'event_id:' + galleryData.eventId + ',' + 'login_uid:' + galleryData.uid + ',' + 'session_key:' + galleryData.sessionKey + ',' + 'picture_ids:' + picture_ids + ',platform: 2');
	$.ajax({
		type: 'POST',
		url: urlProtocol + urlConfig.init_domain + '/Us/User/commitByWeChat',
		dataType: 'json',
		data: {
			moment_id: galleryData.momentId,
			event_id: galleryData.eventId,
			login_uid: galleryData.uid,
			session_key: galleryData.sessionKey,
			picture_ids: picture_ids,
			platform: 2
		},
		success: function (d) {
			//alert(JSON.stringify(d));
			//var a = 'moment_id:' + galleryData.momentId +',' + 'event_id:' + galleryData.eventId + ',' + 'login_uid:' + galleryData.uid + ',' + 'session_key:' + galleryData.sessionKey + ',' + 'picture_ids:' + picture_ids + ',platform: 2';
			//alert(a);
			//$('.gallery-date').html(a);
			//alert(JSON.stringify(d));
			//alert('完成后返回');
			//判断活动是否锁定，是则不允许上传照片
			if(d.c == 403){
				appearLockTip();
			}else {
				console.log('commit返回',d);
				sessionStorage['just-uploaded'] = "1";
				location.replace(location.protocol + '//' + location.host + location.pathname + '?invitation_code=' + getQueryStringArgs().invitation_code + '&target=invite');
			}
		},
		error: function(e) {
			//alert(JSON.stringify(e));
		}
	})
}


// 获取jssdk需要的配置
function getJsSdkData() {
	$.ajax({
		url: urlProtocol + urlConfig.init_domain + '/Us/User/getJSSDK',
		dataType: 'json',
		data: {
			url: location.href,
			platform: 2
		},
		success: function (d) {
			if (enableAlertDebug) {
				alert(JSON.stringify(d))
			}

			//pokola
			var coverImgExt = galleryData.cover.match(/(.*)\.(.*$)/)[2], coverImgDirAndName = galleryData.cover.match(/(.*)\.(.*$)/)[1];
			// if ( galleryData.invitationCode == getQueryStringArgs().invitation_code) {
			// 	var str = 'invite';
			// }else {
			// 	var str = 'share';
			// }
			var shareConfig = {
				title: (galleryData.date.getMonth() + 1) + '月' + galleryData.date.getDate() + '日 ' + galleryData.title, // 分享标题 TODO 不是今年要加年
				desc: 'Us.非凡的活动记录者', // 分享描述
				link: location.host + location.pathname + '?invitation_code=' + galleryData.invitationCode + '&target=share', // 分享链接
				imgUrl: urlProtocol + urlConfig.download_domain + '/' + coverImgDirAndName + '_300x300.' + coverImgExt, // 分享图标
			};
			console.log(shareConfig.imgUrl);

			wx.config({
				debug: enableAlertDebug ? true : false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
				appId: appId, // 必填，公众号的唯一标识
				timestamp: d.timestamp, // 必填，生成签名的时间戳
				nonceStr: d.noncestr, // 必填，生成签名的随机串
				signature: d.signature, // 必填，签名，见附录1
				jsApiList: ['showOptionMenu', 'onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo', 'onMenuShareQZone', 'chooseImage', 'uploadImage'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
			});


			wx.ready(function(){

				wx.showOptionMenu();
				// 分享给朋友
				wx.onMenuShareAppMessage({
					title: shareConfig.title,
					desc: shareConfig.desc,
					link: shareConfig.link,
					imgUrl: shareConfig.imgUrl,
					success: function () {
						$.ajax({
							url: urlProtocol + urlConfig.init_domain + '/Us/stat/setEventCount',
							dataType: 'json',
							data: {
								invitation_code: getQueryStringArgs().invitation_code,
								login_uid: galleryData.uid ? galleryData.uid : "",
								tag: getQueryStringArgs().target,
								platform: 2
							}
						});
						// 用户确认分享后执行的回调函数
					},
					cancel: function () {
						// 用户取消分享后执行的回调函数
					}
				});

				// 分享到朋友圈
				wx.onMenuShareTimeline({
					title: shareConfig.title,
					link: shareConfig.link,
					imgUrl: shareConfig.imgUrl,
					success: function () {
						$.ajax({
							url: urlProtocol + urlConfig.init_domain + '/Us/stat/setEventCount',
							dataType: 'json',
							data: {
								invitation_code: getQueryStringArgs().invitation_code,
								login_uid: galleryData.uid ? galleryData.uid : "",
								tag: getQueryStringArgs().target,
								platform: 2
							}
						});
						// 用户确认分享后执行的回调函数
					},
					cancel: function () {
						// 用户取消分享后执行的回调函数
					}
				});

				// 分享到QQ
				wx.onMenuShareQQ({
					title: shareConfig.title,
					desc: shareConfig.desc,
					link: shareConfig.link,
					imgUrl: shareConfig.imgUrl,
					success: function () {
						$.ajax({
							url: urlProtocol + urlConfig.init_domain + '/Us/stat/setEventCount',
							dataType: 'json',
							data: {
								invitation_code: getQueryStringArgs().invitation_code,
								login_uid: galleryData.uid ? galleryData.uid : "",
								tag: getQueryStringArgs().target,
								platform: 2
							}
						});
						// 用户确认分享后执行的回调函数
					},
					cancel: function () {
						// 用户取消分享后执行的回调函数
					}
				});

				// 分享到腾讯微博
				wx.onMenuShareWeibo({
					title: shareConfig.title,
					desc: shareConfig.desc,
					link: shareConfig.link,
					imgUrl: shareConfig.imgUrl,
					success: function () {
						$.ajax({
							url: urlProtocol + urlConfig.init_domain + '/Us/stat/setEventCount',
							dataType: 'json',
							data: {
								invitation_code: getQueryStringArgs().invitation_code,
								login_uid: galleryData.uid ? galleryData.uid : "",
								tag: getQueryStringArgs().target,
								platform: 2
							}
						});
						// 用户确认分享后执行的回调函数
					},
					cancel: function () {
						// 用户取消分享后执行的回调函数
					}
				});

				// 分享到Q-zone
				wx.onMenuShareQZone({
					title: shareConfig.title,
					desc: shareConfig.desc,
					link: shareConfig.link,
					imgUrl: shareConfig.imgUrl,
					success: function () {
						$.ajax({
							url: urlProtocol + urlConfig.init_domain + '/Us/stat/setEventCount',
							dataType: 'json',
							data: {
								invitation_code: getQueryStringArgs().invitation_code,
								login_uid: galleryData.uid ? galleryData.uid : "",
								tag: getQueryStringArgs().target,
								platform: 2
							}
						});
						// 用户确认分享后执行的回调函数
					},
					cancel: function () {
						// 用户取消分享后执行的回调函数
					}
				});

				var images = {
					localIds: [],
					serverId: []
				};
				var imagesQueue = [];

				function wxChooseImage() {
					wx.chooseImage({
						success: function (res) {
							images.localIds = res.localIds;
							//alert('已选择 ' + res.localIds.length + ' 张图片');
							//alert('images.localIds' + images.localIds);
							var i = 0;
							var length = images.localIds.length;

							var upload = function () {
								$('.upload-progress').html('第 ' + (i+1) + ' 张 / 共 ' + length + ' 张');
								wx.uploadImage({
									localId: images.localIds[i],
									success: function(res) {
										var imagesDetail = [];
										var imagesUploadTime = Date.parse(new Date());
										images.serverId.push(res.serverId);
										imagesDetail.push(res.serverId);
										imagesDetail.push(imagesUploadTime);
										//alert('单个照片数组' + imagesDetail);
										imagesQueue.push(imagesDetail);

										//alert('所有照片数组' + JSON.stringify(imagesQueue));
										//alert(images.serverId);
										//如果还有照片，继续上传
										i++;
										if (i < length) {
											upload();
										}else {
											$('.upload-progress').css('margin-left','-40px').html('上传结束，刷新中…');
											var imagesQueuejson = JSON.stringify(imagesQueue);
											commitWeChatUpload(imagesQueuejson);
										}
									},
									fail: function (res) {
										//alert(JSON.stringify(res));
									}
								});
							};
							upload();
						},
						cancel: function(){
							// alert('未选择照片');
						},
						fail: function(res){
							//alert(JSON.stringify(res));
						}
					});
				}


				$('.toolbar-upload .wx-chooseImage').unbind('click').click(function (e) {
					e.preventDefault();
					//alert('true');
					if (uploadTipCount == 0) {
						var templateInviteUploadTip = _.template($('#invite-upload-tip').text());
						var templateInviteUploadTips = templateInviteUploadTip();
						var $templateInviteUploadTips = $(templateInviteUploadTips);
						var $modalBackdrop = $('<div class="modal-backdrop"></div>');
						$templateInviteUploadTips.addClass('show').appendTo('body');
						$('.close').on('click', function (e) {
							e.preventDefault();
							$('body').unbind('touchmove');
							$(this).closest('.uploadtip').removeClass('show');
							$modalBackdrop.removeClass('show');
							$templateInviteUploadTips.remove();
							$modalBackdrop.remove();
						});
						$('.uploadtip-continue').on('click', function (e) {
							e.preventDefault();
							$('body').unbind('touchmove');
							$(this).closest('.uploadtip').removeClass('show');
							$modalBackdrop.removeClass('show');
							setTimeout(function(){
								uploadTipCount++;
								$templateInviteUploadTips.remove();
								$modalBackdrop.remove();
								wxChooseImage();
							},300);
						});
						$('.uploadtip-download').on('click', function (e) {
							e.preventDefault();
							$('body').unbind('touchmove');
							$(this).closest('.uploadtip').removeClass('show');
							$modalBackdrop.removeClass('show');
							$templateInviteUploadTips.remove();
							$modalBackdrop.remove();
							location.href = downloadLink.microdownload;
						});
						$modalBackdrop.addClass('show').appendTo('body');
						$('body').bind('touchmove', function (e) {
							e.preventDefault();
						});
					}else {
						wxChooseImage();
					}
				});

			});  // 微信ready结束

			wx.error(function(res){
				// alert(res);
				// alert(JSON.stringify(res))
			});

		}
	})
}

//点击显示大头像
function showAuthorImg(src,name,sex,uid) {
	if (environment.isWeixin && getQueryStringArgs().target == 'invite') {
		//alert(galleryData.uid + ',' + galleryData.sessionKey +',' + uid);
		$.ajax({
			url: urlProtocol + urlConfig.init_domain + '/Us/User/getProfile',
			dataType: 'json',
			data: {
				device_id: 'web',
				login_uid: galleryData.uid,
				session_key: galleryData.sessionKey,
				uid: uid,
				platform: 2
			},
			success: function (d) {
				console.log(d);
				if (d.p.user) {
					if (d.p.user.gender == '0') {
						var authorSex = '女';
					}else if(d.p.user.gender == '1') {
						var authorSex = '男';
					}
					var templateAuthorBigImg = _.template($('#author-big-img').text());
					var templateAuthorBigImgs = templateAuthorBigImg();
					var $templateAuthorBigImgs = $(templateAuthorBigImgs);
					var $modalBackdrop = $('<div class="bigimg-backdrop"></div>');
					$templateAuthorBigImgs.find('.bigimg-src img').attr('src', src);
					//$templateAuthorBigImgs.find('.bigimg-nameandsex p').html(d.p.user.nickname + ' , ' + authorSex);
					$templateAuthorBigImgs.find('.bigimg-nameandsex p').html(d.p.user.nickname);
					$templateAuthorBigImgs.find('.bigimg-commonevent p').html(d.p.event.content);
					$templateAuthorBigImgs.addClass('show').appendTo('body');
					$modalBackdrop.on('touchstart mousedown', function (e) {
						e.preventDefault();
						$('body').unbind('touchmove');
						$('.bigimg-body').addClass('showdisappear');
						$modalBackdrop.removeClass('show');
						setTimeout(function () {
							$templateAuthorBigImgs.remove();
							$modalBackdrop.remove();
						}, 180);
					});
					$modalBackdrop.addClass('show').appendTo('body');
					$('body').bind('touchmove', function (e) {
						e.preventDefault();
					});
				}else {
					if (sex == '0') {
						var authorSex = '女';
					}else if(sex == '1') {
						var authorSex = '男';
					}
					var templateAuthorBigImg = _.template($('#author-big-img').text());
					var templateAuthorBigImgs = templateAuthorBigImg();
					var $templateAuthorBigImgs = $(templateAuthorBigImgs);
					var $modalBackdrop = $('<div class="bigimg-backdrop"></div>');
					$templateAuthorBigImgs.find('.bigimg-src img').attr('src',src);
					//$templateAuthorBigImgs.find('.bigimg-nameandsex p').html(name + ' , ' + authorSex);
					$templateAuthorBigImgs.find('.bigimg-nameandsex p').html(name);
					$templateAuthorBigImgs.addClass('show').appendTo('body');
					$modalBackdrop.on('touchstart mousedown', function (e) {
						e.preventDefault();
						$('body').unbind('touchmove');
						$('.bigimg-body').addClass('showdisappear');
						$modalBackdrop.removeClass('show');
						setTimeout(function(){
							$templateAuthorBigImgs.remove();
							$modalBackdrop.remove();
						},180);
					});
					$modalBackdrop.addClass('show').appendTo('body');
					$('body').bind('touchmove',function (e) {
						e.preventDefault();
					});
				}
			}
		})
	}else {
		if (sex == '0') {
			var authorSex = '女';
		}else if(sex == '1') {
			var authorSex = '男';
		}
		var templateAuthorBigImg = _.template($('#author-big-img').text());
		var templateAuthorBigImgs = templateAuthorBigImg();
		var $templateAuthorBigImgs = $(templateAuthorBigImgs);
		var $modalBackdrop = $('<div class="bigimg-backdrop"></div>');
		$templateAuthorBigImgs.find('.bigimg-src img').attr('src',src);
		//$templateAuthorBigImgs.find('.bigimg-nameandsex p').html(name + ' , ' + authorSex);
		$templateAuthorBigImgs.find('.bigimg-nameandsex p').html(name);
		$templateAuthorBigImgs.addClass('show').appendTo('body');
		$modalBackdrop.on('touchstart mousedown', function (e) {
			e.preventDefault();
			$('body').unbind('touchmove');
			$('.bigimg-body').addClass('showdisappear');
			$modalBackdrop.removeClass('show');
			setTimeout(function(){
				$templateAuthorBigImgs.remove();
				$modalBackdrop.remove();
			},180);
		});
		$modalBackdrop.addClass('show').appendTo('body');
		$('body').bind('touchmove',function (e) {
			e.preventDefault();
		});
	}
}

// 拉杆效果
//function showDrawBar() {
//	//$("html").niceScroll();
//}


// 获取相册渲染数据
function getGallery() {
	$.ajax({
		url: urlProtocol + urlConfig.init_domain + '/Us/event/detail',
		dataType: 'json',
		data: {
			invitation_code: getQueryStringArgs().invitation_code,
			login_uid: galleryData.uid ? galleryData.uid : "",
			tag: getQueryStringArgs().target,
			platform: 2
		},
		success: function (d) {
			console.log(d);
			if (enableAlertDebug) {
				alert(JSON.stringify(d))
			}

			if(d.c == 403) {
				// $('.onload-gif').hide();
				// clearInterval(onloadGifTime);
				alert('活动不存在');
				$('#onload-gifimg').remove();
				WeixinJSBridge.call('closeWindow');
			}else if(d.m === 'success') {

				galleryData.invitationCode = d.p.invitation_code;  //pokola 20151211
				if(environment.isWeixin) {
					//getJsSdkData();
				}

				memberList.creaternicname = d.p.member[0].n;
				//alert(galleryData.invitationCode);
				console.log(urlConfig);


				var templateJSON = d.p.template.band;
				// 提取第一个特定数量的模块的索引
				(function() {
					for(var i = 0, len = templateJSON.length; i < len; i++) {
						var currentRectLen = templateJSON[i].rect.length;
						if(galleryData.fixedTemplateIndex[currentRectLen - 1] === undefined) {
							galleryData.fixedTemplateIndex[currentRectLen - 1] = i;
						} else {
							continue;
						}
					}
				}());
				console.log(galleryData.fixedTemplateIndex);

				var templateMain = _.template($('#template-main').text());
				var templateMainCompiled = templateMain(d.p);
				var $templateMainCompiled = $(templateMain(d.p));
				var $templatePhotoGroupCompiled = $templateMainCompiled.filter('.photo-group-container');
				var mainWidth = d.p.template.width;
				galleryData.eventId = d.p.event_id;
				galleryData.title = d.p.name;
				galleryData.date = new Date(parseInt(d.p.start_time));
				galleryData.cover = d.p.cover_page;
				galleryData.memberlength = d.p.member.length; //poko

				document.title = galleryData.title;


				// console.log($templatePhotoGroupCompiled);

				// 对编译好的模板计算布局
				$templatePhotoGroupCompiled.find('.photo-group').each(function (i, v) {
					var $photoGroup = $(v);
					var photoDescriptionNum = 0;
					var $photoDescriptionContainer = $(v).find('.photo-description');
					var photoGroupHeight = $(v).data('height');
					var $photoGroupFooter = $('.photo-group-footer', v);
					var originalFooterHeight = $photoGroupFooter.data('height');
					var footerWidth = $photoGroupFooter.data('width');
					var authorNames = [];


					$(v).find('.photo-item').each(function (i, v) {
						var descriptionContent = v.dataset.description;
						var authorName = $(v).attr('data-author');
						if(descriptionContent.length > 0) {
							photoDescriptionNum = i + 1;
							$photoDescriptionContainer.append('<p>' + descriptionContent + '</p>');
						}
						if(authorName.length > 0) {
							if(authorNames.indexOf(authorName) === -1) {
								authorNames.push(authorName)
							}
						}
					});

					$(v).attr('data-photo-description-num', photoDescriptionNum);

					if(photoDescriptionNum > 0) {
						var footerHeight = galleryConfig.footerWidthDescriptionHeight; //135
					} else {
						var footerHeight = galleryConfig.footerWidthoutDexcriptionHeight; //75
					}
					photoGroupHeight = photoGroupHeight - galleryConfig.headerHeight - originalFooterHeight + footerHeight;
					$photoGroup.css({'padding-bottom': photoGroupHeight/mainWidth*100 + '%'});
					$photoGroupFooter.css({'padding-bottom': footerHeight/footerWidth*100 + '%'});
					$(v).find('.photo-item').each(function (i, v) {
						$(v).css({'top': ($(v).data('y') - galleryConfig.headerHeight)/photoGroupHeight*100 + '%'});
					});
					// $('.author-label', v).html(authorNames.length > 1 ? 'images by' : 'image by')
					$('.author-name-group', v).html(authorNames.join(', '))

				});

				$('#main-container').append($templateMainCompiled);


				// 模板插入DOM后，取每张缩略图需要的真实尺寸
				$('.photo-item').each(function (i, v) {
					var width = getRetinaImgSize(v.clientWidth);
					var height = getRetinaImgSize(v.clientHeight);
					var replaceText = width + 'x' + height;
					var $img = $('img', v);
					// .on('load', function () {
					//   $(this).addClass('fade-in');
					// });
					// console.log($img.data('original'));
					var trueImgUrl = $img.data('original').replace('replaceWidthxreplaceHeight', replaceText);
					// console.log(trueImgUrl);
					$('img', v).attr('data-original', trueImgUrl);

				});

				// 插入封面图
				$('.gallery-cover').each(function (i, v) {
					var width = getRetinaImgSize(v.clientWidth);
					var height = getRetinaImgSize(v.clientHeight);
					var replaceText = width + 'x' + height;
					var $img = $('img', v);
					var trueImgUrl = $img.data('original').replace('replaceWidthxreplaceHeight', replaceText);
					$('img', v).attr('src', trueImgUrl);
				});

				if (environment.isWeixin && getQueryStringArgs().target === 'invite') {
					inviteOnloadTip();
				}


				//poko

				$('.gallery-authors-tip').html('<p>'+galleryData.memberlength+'</p>');
				var galleryauthorsWidth = galleryData.memberlength*40 + 'px';
				$('.gallery-authors').css('max-width',galleryauthorsWidth);
				// 点击显示大头像
				//$('.gallery-author').unbind('click').on('click',function(){
				//	var authorNum = $(this).index();
				//	var authorImgA = d.p.member[authorNum].a;
				//	var authorName = d.p.member[authorNum].n;
				//	var authorUid = d.p.member[authorNum].u;
				//	var authorSex = d.p.member[authorNum].g;
				//	var p_pictureBaseUrl = urlProtocol + urlConfig.download_domain + '/';
				//	var p_ext = authorImgA.match(/(.*)\.(.*$)/)[2];
				//	var p_fileDirAndName = authorImgA.match(/(.*)\.(.*$)/)[1];
				//	var authorImgSrc = p_pictureBaseUrl + p_fileDirAndName + '_250x250' + '.' + p_ext;
				//	showAuthorImg(authorImgSrc,authorName,authorSex,authorUid);
				//});

				// 执行拉杆
				//showDrawBar();

				//alert(urlProtocol + urlConfig.init_domain + '/Us/stat/setEventCount');
				// 从sessionStorage中查看是否刚上传过的标记，有则给个提示，并删掉标记
				console.log(sessionStorage);
				$(document.body).append('<div class="hint global-hint hint-dismissible"><button type="button" class="close"><span>×</span></button>您上传的图片已按拍照时间顺序发布到相册<br>如果时间存在误差，请使用Us应用进行编辑</div>')
				if(sessionStorage['just-uploaded'] === "1") {
					sessionStorage.removeItem('just-uploaded');
					$('.global-hint').addClass('slide-in');
					$('.hint-dismissible .close').on('click', function () {
						$(this).closest('.hint').removeClass('slide-in');
					})
				}

				// 延迟图片加载
				$("img").lazyload({
					threshold: 0,
					failure_limit : 9999,
					effect: "fadeIn",
					placeholder: 'data:image/gif;base64,R0lGODlhAQABAJH/AP///wAAAMDAwAAAACH5BAEAAAIALAAAAAABAAEAAAICVAEAOw=='
				});

				$('.gallery-cover-inner').find('img').load(function(){
					$('#onload-gif').css('opacity','0');
					setTimeout(function(){
						$('#onload-gif').remove();
					},500)
				})

				// 初始化photoSwipe
				//initPhotoSwipeFromDOM('.photo-group-container');

				// 获取到uid时
				//if(galleryData.uid) createMoment();

			}
		}
	})
}

// 获取url api地址
function getUrlConfig() {
	$.ajax({
		url: apiUrl,
		dataType: 'json',
		data: {
			version: 1,
			platform: 2
		},
		success: function (d) {
			console.log(d);

			urlConfig = d.p;

			$.each(d.p, function (key, value) {
				if(typeof value === 'string' && /^https/.test(value)) {
					urlConfig[key] = /^https:\/\/(.*)/.exec(value)[1]
				}
			});

			if(urlConfig.init_domain === 'app.himoca.com:9990') {
				urlConfig.init_domain = 'app.himoca.com';
				urlConfig.upload_domain = 'app.himoca.com';
			}


			// 如果在微信中且得到code后，则触发 登录 和 获取微信配置信息
			if(environment.isWeixin && environment.isWeixinLogin && loginMarkKey !== 'CheckCheck') {
				$('.toolbar-bottom').removeClass('active');
				$('.toolbar-upload').addClass('active');
				if (environment.isIos) {
					$('.wx-chooseImage').css('display','none');
					$('.upload-cover').css('display','inline-block');
				}else {
					$('.upload-file-container').css('display','none');
				}
				// 注册
				register();
			} else if(environment.isWeixin && environment.isWeixinLogin && loginMarkKey == 'CheckCheck') {
				$('.toolbar-bottom').removeClass('active');
				$('.toolbar-upload').addClass('active');
				if (environment.isIos) {
					$('.wx-chooseImage').css('display','none');
					$('.upload-cover').css('display','inline-block');
				}else {
					$('.upload-file-container').css('display','none');
				}
				loginCheck();
			} else if(!environment.isWeixin && getQueryStringArgs().target === 'invite') {
				$('.toolbar-bottom').removeClass('active');
				$('.toolbar-invitation-code').addClass('active');
				getGallery();

				//if(environment.isQq) {
				//	if(environment.isIos) {
				//		location.href = downloadLink.microdownload
				//	}
				//	if(environment.isAndroid) {
				//		location.href = downloadLink.microdownload
				//	}
				//}

			} else {
				$('.toolbar-bottom').removeClass('active');
				//$('.toolbar-download').addClass('active');
				getGallery();
			}

			// if(enableDesktopDebug) {
			//   $('.toolbar-bottom').removeClass('active');
			//   // $('.toolbar-upload').addClass('active');
			//   $('.toolbar-download').addClass('active');
			// }

		}
	});
}

// DOM 准备好了  授权页后第一步执行
$(function () {

	getUrlConfig();

	 //微信下邀请 的 打开us （已换微下载）
	 $('.toolbar-upload .open-app').on('click', function (e) {
	   e.preventDefault();
	   location.href = downloadLink.microdownload;
	 });

	// 分享页，的下载条 （已换微下载）
	$('.toolbar-download').on('click', function (e) {
		e.preventDefault();
		if(environment.isWeixin) { // 微信下
			// $('.guide-to-open-in-browser').addClass('show').on('click', function () {
			//   $(this).removeClass('show');
			// });
			location.href = downloadLink.microdownload;
		} else if (environment.isWeibo) { // 微博下
			$('.guide-to-open-in-browser').addClass('show').on('click', function () {
				$(this).removeClass('show');
			});
		}else { // 非微信下
			if(environment.isIos) {
				location.href = downloadLink.microdownload;
			}
			if(environment.isAndroid) {
				location.href = downloadLink.microdownload;
			}
		}
	});



	// $(document).on('copy', function (e) {
	//   console.log(e.clipboardData.getData('text/plain'));
	// })

	//邀请码
	$('.toolbar-invitation-code a').on('click', function (e) {
		e.preventDefault();
		var templateToolbarInvitationCode = _.template($('#template-invitation-code').text());
		var templateToolbarInvitationCodeCompiled = templateToolbarInvitationCode({invitationCode: getQueryStringArgs().invitation_code});
		var $templateToolbarInvitationCodeCompiled = $(templateToolbarInvitationCodeCompiled);
		var $modalBackdrop = $('<div class="modal-backdrop"></div>');
		$('.close', $templateToolbarInvitationCodeCompiled).on('click', function (e) {
			e.preventDefault();
			$('body').unbind('touchmove');
			$(this).closest('.modal').removeClass('show');
			$modalBackdrop.removeClass('show');
			$templateToolbarInvitationCodeCompiled.remove();
			$modalBackdrop.remove();
		});
		$templateToolbarInvitationCodeCompiled.addClass('show').appendTo('body').on('click', '.invitationbtn', function (e) {
			e.preventDefault();
			$('body').unbind('touchmove');
			//if(environment.isIos) {
			location.href = downloadLink.microdownload;
			//}
			//if(environment.isAndroid) {
			//	location.href = downloadLink.microdownload;
			//}
		});
		$modalBackdrop.addClass('show').appendTo('body');
		$('body').bind('touchmove', function (e) {
			e.preventDefault();
		});
	});
});