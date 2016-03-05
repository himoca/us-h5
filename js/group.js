'use strict';

var apiUrl = location.protocol + '//' + location.host + '/Us/system/getDomainInfo';
var urlProtocol = location.protocol + '//';
var pokoConsole = true;

var urlConfig = {};		//url信息
var memberList = [];	//成员列表
var versionNumber = '1.3.0';	//版本号
var versionIntegerNumber = 2;
var screenWidth = $(window).width();  //屏幕宽度
var screenHeight = $(window).height();  //屏幕高度


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

var galleryData = {
	galleryAvatars: [],
	eventId: null,
	invitationCode: null,
	uid: null,
	gid: null,
	nickname: null,
	avatar: null,
	sessionKey: null,
	momentId: null,
	title: '',
	cover: '',
	date: null,
	e_num: 0,
	p_num: 0
};

//获取查询字符串参数
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

// 获取操作系统
function getOsVersion() {
	var osVersion;
	if (environment.isIos) {
		osVersion = 'ios';
	} else if (environment.isAndroid) {
		osVersion = 'android';
	} else if (environment.isWinPhone) {
		osVersion = 'winphone'
	} else {
		osVersion = 'web';
	}
	return osVersion;
}

var downloadLink = {
	ios: 'https://itunes.apple.com/cn/app/us/id1041870519',
	android: 'http://us.himoca.com/apk/moca_us.apk',
	microdownload: 'http://a.app.qq.com/o/simple.jsp?pkgname=com.hoolai.us&g_f=991653',
	yyb: '' // 应用宝
};

// 展示登陆提示
function showOnloadTip(d, member) {
	if (d.p.group.coverpage == 'default') {
		var width = screenWidth * 2 - 80;
		var height = parseInt(width * 0.5);
		$('.flex-onloadtip-cover-box').find('img').attr('src', '');
		$('.flex-onloadtip-box').css('margin-top', '-' + parseInt(((height / 2) + 102) / 2) + 'px');
	} else {
		var pictureBaseUrl = urlProtocol + urlConfig.download_domain + '/';
		var photoFile = d.p.group.coverpage;
		var photoFileDirAndName = photoFile.match(/(.*)\.(.*$)/)[1];
		var photoFileExt = photoFile.match(/(.*)\.(.*$)/)[2];
		var width = screenWidth * 2 - 80;
		var height = parseInt(width * 0.5);
		var trueImgUrl = pictureBaseUrl + photoFileDirAndName + '_' + width + 'x' + height + '.' + photoFileExt;
		$('.flex-onloadtip-cover-box').find('img').attr('src', trueImgUrl);
		$('.flex-onloadtip-box').css('margin-top', '-' + parseInt(((height / 2) + 102) / 2) + 'px');
	}

	var maxMemberNum = parseInt((width / 2 - 16) / 44) - 2;
	for (var i = 0; i < d.p.member.length; i++) {
		if (i > maxMemberNum) {
			$('.flex-onloadtip-authors-list').append("<span><p>" + d.p.member.length + "</p></span>");
			break;
		}
		var pictureBaseUrl = urlProtocol + urlConfig.download_domain + '/';
		var photoFile = member[i].avatar;
		var photoFileDirAndName = photoFile.match(/(.*)\.(.*$)/)[1];
		var photoFileExt = photoFile.match(/(.*)\.(.*$)/)[2];
		var width = getRetinaImgSize(36);
		var height = width;
		var trueImgUrl = pictureBaseUrl + photoFileDirAndName + '_' + width + 'x' + height + '.' + photoFileExt;
		$('.flex-onloadtip-authors-list').append("<div><img alt src='" + trueImgUrl + "' width='36' height='36'></div>");
	}
	if (d.p.member.length <= maxMemberNum) {
		$('.flex-onloadtip-authors-list').append("<span><p>" + d.p.member.length + "</p></span>");
	}

	if (environment.isWeixin) {
		var $text_i = $('.flex-onloadtip-text1').find('i');
		$text_i.eq(0).html(d.p.group.name);
		$text_i.eq(1).html(d.p.group.e_num);
		$text_i.eq(2).html(d.p.group.p_num);
		$('.flex-onloadtip-text1').css('display', 'block');
	} else {
		var $text_i = $('.flex-onloadtip-text2').find('i');
		$text_i.eq(0).html(d.p.group.name);
		$text_i.eq(1).html(d.p.group.e_num);
		$text_i.eq(2).html(d.p.group.p_num);
		$('.flex-onloadtip-text2').css('display', 'block');
	}

	$('.back-drop').css('background', 'rgba(0, 0, 0, 0.8)').addClass('show');
	$('.flex-onloadtip-box').css('display', 'block');
	$('.back-drop').on('touchstart', function (e) {
		e.preventDefault();
	});
	$('.flex-onloadtip-box').on('touchmove', function (e) {
		e.preventDefault();
	});
	$('.flex-onloadtip-btn').on('click', function () {
		$('.back-drop').removeClass('show');
		$('.flex-onloadtip-box').css('display', 'none');
	});

	$('.flex-onloadtip-cover-box').find('img').load(function () {
		$('#onload-gif').css('opacity', '0');
		setTimeout(function () {
			$('#onload-gif').remove();
		}, 500)
	});

}

//弹出长按邀请码提示
function showInviteCodeCopyTip(d) {
	$('.join-group-code').html('US' + getQueryStringArgs().invitation_code);
	$('.invitecode-box').addClass('show').removeClass('showdisappear');
	$('.back-drop').css('background', 'rgba(0, 0, 0, 0.7)').addClass('show');
	$('.back-drop').on('touchstart', function (e) {
		e.preventDefault();
	});
	$('.invitecode-top-box').on('touchmove', function (e) {
		e.preventDefault();
	});
	$('.invitecode-top-box').find('a').on('touchstart', function (e) {
		e.preventDefault();
		$('.back-drop').removeClass('show');
		$('.invitecode-box').removeClass('show').addClass('showdisappear');
	});
	$('.invitecode-btn').on('click', function (e) {
		e.preventDefault();
		$('.back-drop').removeClass('show');
		$('.invitecode-box').removeClass('show').addClass('showdisappear');
		location.href = downloadLink.microdownload;
	})
}

// 获取真实大小
function getRetinaImgSize(size) {
	if (window.devicePixelRatio >= 2) {
		return size * 2;
	} else {
		return parseInt(size);
	}
}

//显示/隐藏成员列表
function appearAuthorsList() {
	var useWidth = screenWidth;
	useWidth = useWidth >= 768 ? 768 : useWidth;
	var singlelineMemberNum = parseInt((useWidth - 12) / 44);  //单独一行的用户数
	var allMemberNum = $('.group-authors').find('li').length;  //获取总人数
	if ((allMemberNum - singlelineMemberNum) > 0) {
		if ((allMemberNum % singlelineMemberNum) == 0) {
			var lineNumber = parseInt(allMemberNum / singlelineMemberNum);
		}else {
			var lineNumber = parseInt(allMemberNum / singlelineMemberNum) + 1;  //行数
		}
	}
	$('.group-members-amount').html(allMemberNum);		//写入总人数
	$('.group-event').css('opacity', '1');
	if (lineNumber > 1) {
		for (var i = singlelineMemberNum; i < allMemberNum; i++) {
			$('.group-authors').find('li').eq(i).css('opacity', '0');
		}
		$('.group-event').css('transform', 'translateY(-' + 46 * (lineNumber - 1) + 'px)');
		$('.group-event').css('-webkit-transform', 'translateY(-' + 46 * (lineNumber - 1) + 'px)');
		if (screenWidth <= 768) {
			$('.group-event').css({'position':'absolute','left':'0','right':'0'});
		}else {
			$('.group-event').css({'position':'absolute','left':(screenWidth-768)/2 + 'px','right':(screenWidth-768)/2 + 'px'});
		}

		var groupEventMark = 0;
		var groupEventTime = null;
		$('.group-member-title').bind('touchstart mousedown', function (e) {
			e.preventDefault();
			clearTimeout(groupEventTime);
			if (groupEventMark == 0) {
				groupEventMark = 1;
				$('.group-event').css('transform', 'translateY(0px)');
				$('.group-event').css('-webkit-transform', 'translateY(0px)');
				$('.group-member-ins').css('transform', 'rotate(180deg)');
				$('.group-member-ins').css('-webkit-transform', 'rotate(180deg)');
				groupEventTime = setTimeout(function () {
					for (var i = singlelineMemberNum; i < allMemberNum; i++) {
						$('.group-authors').find('li').eq(i).css('opacity', '1');
					}
				}, 500);
			} else if (groupEventMark == 1) {
				groupEventMark = 0;
				for (var i = singlelineMemberNum; i < allMemberNum; i++) {
					$('.group-authors').find('li').eq(i).css('opacity', '0');
				}
				groupEventTime = setTimeout(function () {
					$('.group-event').css('transform', 'translateY(-' + 46 * (lineNumber - 1) + 'px)');
					$('.group-event').css('-webkit-transform', 'translateY(-' + 46 * (lineNumber - 1) + 'px)');
					$('.group-member-ins').css('transform', 'rotate(0deg)');
					$('.group-member-ins').css('-webkit-transform', 'rotate(0deg)');
				}, 500);
			}
		})
	} else {
		$('.group-member-ins').css('display', 'none');
	}
}

// 弹出用户大头像
function showAuthorBigImg(name, uid, src1, src2) {
	if (environment.isWeixin && uid !== galleryData.uid && getQueryStringArgs().target == 'invite') {
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
				if (pokoConsole) {
					console.log(d);
				}
				//alert(JSON.stringify(d));

				if (d.p.user.gender == '0') {
					var authorSex = '女';
				} else if (d.p.user.gender == '1') {
					var authorSex = '男';
				}
				$('.bigimg-nameandsex').find('p').html(name + ' , ' + authorSex).emoji();
				if(!("event" in d.p)) {
					$('.bigimg-commonevent').find('p').html('').emoji();
				}else {
					$('.bigimg-commonevent').find('p').html(d.p.event.content).emoji();
				}
				$('.bigimg-src').append('<img alt src="' + src1 + "30x30" + src2 + '" width="250" height="250">');
				$('.bigimg-src').append('<img class="bigimg-clear" alt src="' + src1 + "250x250" + src2 + '" width="250" height="250">');
				$('.back-drop').css('background', 'rgba(0, 0, 0, 0.4)').addClass('show');
				$('.bigimg-body').addClass('show').removeClass('showdisappear');
				$('.back-drop').on('touchstart', function (e) {
					e.preventDefault();
					$('.back-drop').removeClass('show');
					$('.bigimg-body').removeClass('show').addClass('showdisappear');
					$('.bigimg-src').find('img').remove();
				})
			},
			error: function(e) {
				alert('获取头像信息失败(e:20040)');
				alert(JSON.stringify(e));
			}
		})
	} else {
		$('.bigimg-nameandsex').find('p').html(name).emoji();
		$('.bigimg-commonevent').find('p').html('').emoji();
		$('.bigimg-src').append('<img alt src="' + src1 + "30x30" + src2 + '" width="250" height="250">');
		$('.bigimg-src').append('<img class="bigimg-clear" alt src="' + src1 + "250x250" + src2 + '" width="250" height="250">');
		$('.back-drop').css('background', 'rgba(0, 0, 0, 0.4)').addClass('show');
		$('.bigimg-body').addClass('show').removeClass('showdisappear');
		$('.back-drop').on('touchstart mousedown', function (e) {
			e.preventDefault();
			$('.back-drop').removeClass('show');
			$('.bigimg-body').removeClass('show').addClass('showdisappear');
			$('.bigimg-src').find('img').remove();
		})
	}
}

//跳转活动
function jumpToEvent() {
	$('.group-event-box').on('touchstart', function (e) {
		//e.preventDefault();
		$(this).css('box-shadow', '1px 1px 1px #666');
		$(this).css('left', '1px');
		$(this).css('top', '1px');
	});
	$('.group-event-box').on('touchend', function (e) {
		//e.preventDefault();
		$(this).css('box-shadow', '2px 2px 2px #666');
		$(this).css('left', '0');
		$(this).css('top', '0');
	});
	$('.group-event-box').on('click', function (e) {		//点击跳转
		e.preventDefault();
		var code = $(this).attr('data-code');
		location.href = location.protocol + '//' + location.host + '/share/share.html?invitation_code=' + code + '&target=share';
	});
}

function removeOnloadGif() {
	$('.group-cover-content').find('img').load(function () {
		$('#onload-gif').css('opacity', '0');
		setTimeout(function () {
			$('#onload-gif').remove();
		}, 500)
	});
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
			//pokola
			var coverImgExt = galleryData.cover.match(/(.*)\.(.*$)/)[2], coverImgDirAndName = galleryData.cover.match(/(.*)\.(.*$)/)[1];

			var shareConfig = {
				//title: (galleryData.date.getMonth() + 1) + '月' + galleryData.date.getDate() + '日 ' + galleryData.title,
				 title: galleryData.title, // 分享标题
				desc: '这里记录了我们的' + galleryData.e_num + '个故事' + galleryData.p_num + '个瞬间', // 分享描述
				link: location.host + location.pathname + '?invitation_code=' + galleryData.invitationCode + '&target=share', // 分享链接
				imgUrl: urlProtocol + urlConfig.download_domain + '/' + coverImgDirAndName + '_300x300.' + coverImgExt // 分享图标
			};
			if (pokoConsole) {
				console.log(shareConfig.imgUrl);
			}

			wx.config({
				debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
				appId: appId, // 必填，公众号的唯一标识
				timestamp: d.timestamp, // 必填，生成签名的时间戳
				nonceStr: d.noncestr, // 必填，生成签名的随机串
				signature: d.signature, // 必填，签名，见附录1
				jsApiList: ['showOptionMenu', 'onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo', 'onMenuShareQZone'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
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
						// 用户确认分享后执行的回调函数
					},
					cancel: function () {
						// 用户取消分享后执行的回调函数
					}
				});
			});  // 微信ready结束

			wx.error(function(res){
				alert('内部错误(e:20031)');
				// alert(res);
				// alert(JSON.stringify(res))
			});

		},
		error: function(e) {
			alert('内部错误(e:20030)');
		}
	})
}

//确认时间
function bitlistCreateTime(time){
	var createTimeYear = new Date(parseInt(time)).getFullYear();
	var createTime;
	if (createTimeYear === new Date().getFullYear()) {
		createTime = moment(parseInt(time)).format('MM[-]DD HH:mm');
	} else {
		createTime = moment(parseInt(time)).format('YYYY-MM-DD HH:mm');
	}
	return createTime;
}

//显示点滴
var showBitListCheck = true;
function showBitList() {
	if(showBitListCheck) {
		$.ajax({
			url: urlProtocol + urlConfig.init_domain + '/Us/Moment/eventMomentList',
			dataType: 'json',
			data: {
				login_uid: galleryData.uid,
				gid: galleryData.gid,
				platform: 2
			},
			success: function (d) {
				showBitListCheck = false;
				if (pokoConsole) {
					console.log(d);
				}

				for (var i=0; i< d.p.list.length; i++) {
					var listindex = i;
					var bitlist = d.p.list[i];

					var pictureBaseUrl = urlProtocol + urlConfig.download_domain + '/';
					var photoFile = bitlist.avatar;
					var photoFileDirAndName = photoFile.match(/(.*)\.(.*$)/)[1];
					var photoFileExt = photoFile.match(/(.*)\.(.*$)/)[2];
					var width = getRetinaImgSize(40);
					var height = width;
					var trueImgUrl = pictureBaseUrl + photoFileDirAndName + '_' + width + 'x' + height + '.' + photoFileExt;

					//创建每个点滴
					$('.group-bit-list').append(
						'<li>' +
							'<img class="group-bit-authorsmallimg" src="'+trueImgUrl+'" alt="" width="40" height="40">' +
							'<div class="group-bit-head">' +
								'<p class="group-bit-titletext"><i class="group-bit-authornicname group-bit-willemoji">'+bitlist.nickname+'</i> 在点滴中上传了<i class="group-bit-titletextgreen">'+bitlist.picture.length+'张</i>照片</p>' +
								'<p class="group-bit-time">'+bitlistCreateTime(bitlist.create_time)+'</p>' +
								'<div class="group-bit-contentbox group-bit-willemoji"></div>' +
								'<a class="group-bit-contentbtn" href="javascript:;">更多</a>' +
							'</div>' +
							'<div class="group-bit-imgbox"><div class="group-bit-imgdrawer clearfix"></div></div>' +
							'<div class="group-bit-commentlikebtn"></div>' +
							'<div class="group-bit-likeauthorsbox clearfix"></div>' +
							'<div class="group-bit-commentauthorsbox group-bit-willemoji"></div>' +
							'<span class="group-bit-bottomborderline"></span>' +
						'</li>'
					);

					//添加照片描述
					var bitlistContentall = '';
					for (var j=0; j< bitlist.picture.length; j++) {
						var bitlistContent = bitlist.picture[j].content;
						bitlistContentall = bitlistContentall+bitlistContent;
						if(bitlistContent !== '' && bitlist.picture.length !== 1) {
							$('.group-bit-contentbox').eq(listindex).append('<i class="group-bit-contentnum">'+(j+1)+'.</i><p class="group-bit-content">'+bitlistContent+' </p>');
						}else if(bitlistContent !== '' && bitlist.picture.length == 1) {
							$('.group-bit-contentbox').eq(listindex).append('<p class="group-bit-content">'+bitlistContent+'</p>');
						}
					}
					if(bitlistContentall == ''){
						$('.group-bit-contentbox').eq(listindex).css('display','none');
						$('.group-bit-contentbtn').eq(listindex).css('display','none');
					}

					//添加照片
					var bitlistPictureLength = bitlist.picture.length;
					if(bitlistPictureLength == 1) {			//单张
						var pictureBaseUrl = urlProtocol + urlConfig.download_domain + '/';
						var photoFile = bitlist.picture[0].url;
						var photoFileDirAndName = photoFile.match(/(.*)\.(.*$)/)[1];
						var photoFileExt = photoFile.match(/(.*)\.(.*$)/)[2];
						var sizeInterceptPosition = bitlist.picture[0].size.indexOf('x');
						var wareWidth = parseInt(bitlist.picture[0].size.substring(0,sizeInterceptPosition));  //图片真实宽
						var wareHeight = parseInt(bitlist.picture[0].size.substring(sizeInterceptPosition+1));  //图片真实高
						if(wareHeight > wareWidth) {
							var height = getRetinaImgSize(120);
							var width = parseInt(height*(wareWidth/wareHeight));
						}else {
							var height = getRetinaImgSize(100);
							var width = parseInt(height*(wareWidth/wareHeight));
						}
						var trueImgUrl = pictureBaseUrl + photoFileDirAndName + '_' + width + 'x' + height + '.' + photoFileExt;
							$('.group-bit-imgdrawer').eq(listindex).append('<div class="group-bit-pictureimgback" style="width: '+width+'px; height: '+height+'px;"><img class="group-bit-pictureimg" data-original="' + trueImgUrl + '" alt=""></div>').css('padding', '0 10px 0 60px');
					}else {				//多张
						for (var j=0; j<bitlist.picture.length; j++) {
							var pictureBaseUrl = urlProtocol + urlConfig.download_domain + '/';
							var photoFile = bitlist.picture[j].url;
							var photoFileDirAndName = photoFile.match(/(.*)\.(.*$)/)[1];
							var photoFileExt = photoFile.match(/(.*)\.(.*$)/)[2];
							var sizeInterceptPosition = bitlist.picture[j].size.indexOf('x');
							var wareWidth = parseInt(bitlist.picture[j].size.substring(0,sizeInterceptPosition));  //图片真实宽
							var wareHeight = parseInt(bitlist.picture[j].size.substring(sizeInterceptPosition+1));  //图片真实高
							var height = getRetinaImgSize(120);
							var width = getRetinaImgSize(140);
							var trueImgUrl = pictureBaseUrl + photoFileDirAndName + '_' + width + 'x' + height + '.' + photoFileExt;
							if(window.devicePixelRatio >= 2) {
								var cssHeight = height/2;
								var cssWidth = width/2;
								$('.group-bit-imgdrawer').eq(listindex).addClass('group-bit-imgcandrawer').append('<div class="group-bit-pictureimgback" style="width: '+cssWidth+'px; height: '+cssHeight+'px;"><img class="group-bit-pictureimg" data-original="'+trueImgUrl+'" alt="" width="'+cssWidth+'" height="'+cssHeight+'"><span>'+(j+1)+'</span></div>')
							}else {
								$('.group-bit-imgdrawer').eq(listindex).addClass('group-bit-imgcandrawer').append('<div class="group-bit-pictureimgback" style="width: '+width+'px; height: '+height+'px;"><img class="group-bit-pictureimg" data-original="'+trueImgUrl+'" alt="" width="'+width+'" height="'+height+'"><span>'+(j+1)+'</span></div>')
							}
						}
					}


					//添加点赞头像和数量
					if(bitlist.like_count !== 0) {
						for(var j=0; j< bitlist.like.length; j++) {
							var bitlistlikepropertiesuid = bitlist.like[j].properties.uid;
							var pictureBaseUrl = urlProtocol + urlConfig.download_domain + '/';
							var photoFile = d.p.properties[bitlistlikepropertiesuid].avatar;
							var photoFileDirAndName = photoFile.match(/(.*)\.(.*$)/)[1];
							var photoFileExt = photoFile.match(/(.*)\.(.*$)/)[2];
							var width = getRetinaImgSize(30);
							var height = width;
							var trueImgUrl = pictureBaseUrl + photoFileDirAndName + '_' + width + 'x' + height + '.' + photoFileExt;
							$('.group-bit-likeauthorsbox').eq(listindex).append('<img class="group-bit-likeauthorimg" src="'+trueImgUrl+'" alt="" width="30" height="30">')
						}
						$('.group-bit-likeauthorsbox').eq(listindex).append('<span class="group-bit-likeauthorsnum">'+bitlist.like_count+'</span>');
					}else {
						$('.group-bit-likeauthorsbox').eq(listindex).css('display','none');
					}

					//添加评论
					if(bitlist.comment_count !== 0) {
						for(var j=0; j<bitlist.comment.length; j++) {
							if(!("to" in bitlist.comment[j].properties)){
								var commentpropertiesuid = bitlist.comment[j].properties.uid;
								var commentnickname = d.p.properties[commentpropertiesuid].nickname;
								$('.group-bit-commentauthorsbox').eq(listindex).append('<span class="group-bit-onecomment"><i class="group-bit-respondents">'+commentnickname+'</i><p class="group-bit-commenttext">: '+bitlist.comment[j].properties.content+'</p></span>')
							}else {
								var commentpropertiesuid = bitlist.comment[j].properties.uid;
								var commentedpropertiesuid = bitlist.comment[j].properties.to;
								var commentnickname = d.p.properties[commentpropertiesuid].nickname;
								var commentednickname = d.p.properties[commentedpropertiesuid].nickname;
								$('.group-bit-commentauthorsbox').eq(listindex).append('<span class="group-bit-onecomment"><i class="group-bit-respondents">'+commentnickname+'</i><p class="group-bit-huifu"> 回复 </p><i class="group-bit-selecter">'+commentednickname+'</i><p class="group-bit-commenttext">: '+bitlist.comment[j].properties.content+'</p></span>');
							}
						}
					}else {
						$('.group-bit-commentauthorsbox').eq(listindex).css('display','none');
					}

				}
				//描述多余三行时收起
				$('.group-bit-contentbox').each(function(index){
					if($(this).height() > 60) {
						$(this).css('height','60px');
					}else {
						$('.group-bit-contentbtn').eq(index).css('display','none');
					}
				});
				//描述更多/收起切换
				$('.group-bit-contentbtn').on('click',function(e){
					e.preventDefault();
					if($(this).html() == '更多'){
						$(this).html('收起').prev().css('height','auto');
					}else if($(this).html() == '收起'){
						$(this).html('更多').prev().css('height','60px');
					}
				});
				//转换emoji表情
				$('.group-bit-willemoji').each(function(){
					$(this).emoji();
				});


				$("img").lazyload({
					threshold: 100,
					failurelimit: 9999,
					effect: "fadeIn",
					placeholder: 'data:image/gif;base64,R0lGODlhAQABAJH/AP///wAAAMDAwAAAACH5BAEAAAIALAAAAAABAAEAAAICVAEAOw=='
				});

				var imgcandrawerTime = null;
				$('.group-bit-imgcandrawer').on('touchmove',function(e){
					$(this).find('span').css('opacity','1');

				}).on('touchend',function(e){
					var $that = $(this);
					$that.find("img").lazyload({
						placeholder: 'data:image/gif;base64,R0lGODlhAQABAJH/AP///wAAAMDAwAAAACH5BAEAAAIALAAAAAABAAEAAAICVAEAOw=='
					});
					clearTimeout(imgcandrawerTime);
					imgcandrawerTime = setTimeout(function(){
						$('.group-bit-imgcandrawer').find('span').css('opacity','0');
					},2000);
				})
			},
			error: function(e){
				alert('点滴加载失败，请稍后重试。(e:20060)');
			}
		})
	}
}

// 创建DOM结构
function buildDom() {
	$.ajax({
		url: urlProtocol + urlConfig.init_domain + '/Us/group/share',
		dataType: 'json',
		data: {
			code: getQueryStringArgs().invitation_code,
			login_uid: galleryData.uid,
			version: versionIntegerNumber,
			platform: 2
		},
		success: function (d) {
			if (pokoConsole) {
				console.log(d);
			}

			if (environment.isWeixin) {
				getJsSdkData();
			}

			if (d.c == 400) {
				alert('邀请函已失效(e:20055)');
				$('#onload-gifimg').remove();
				WeixinJSBridge.call('closeWindow');
			} else {

				var $body = $('body');
				document.title = d.p.group.name;
				// hack在微信等webview中无法修改document.title的情况
				if (environment.isWeixin) {
					var $iframe = $('<iframe src="/favicon.ico"></iframe>').on('load', function () {
						setTimeout(function () {
							$iframe.off('load').remove()
						}, 0)
					}).appendTo($body);
				}

				//保存封面图和名称用于分享
				galleryData.cover = d.p.group.coverpage;
				galleryData.title = d.p.group.name;
				galleryData.invitationCode = getQueryStringArgs().invitation_code;
				galleryData.e_num = d.p.group.e_num;
				galleryData.p_num = d.p.group.p_num;
				if(galleryData.uid == null) {
					galleryData.uid = d.p.group.owner;
				}
				galleryData.gid = d.p.group.gid;

				//成员特殊处理
				var ownerMemberUid = d.p.group.owner;
				var memberArray = d.p.member;
				for (var i = 0; i < memberArray.length; i++) {
					var index = i;
					if (memberArray[index].uid == ownerMemberUid) {
						memberList.unshift(memberArray[index]);
					} else {
						memberList.push(memberArray[index]);
					}
				}
				if (pokoConsole) {
					console.log(memberList);
				}

				//弹出登陆提示框
				if (getQueryStringArgs().target == 'invite') {
					if (environment.isWeixin) {
						$('.bottom-banner-box').css('display', 'block').find('a').html('使用Us打开').on('click', function () {
							location.href = downloadLink.microdownload;
						}).on('touchstart', function () {
							$(this).css('background', '#4B4D33');
						}).on('touchend', function () {
							$(this).css('background', '#616346');
						});
					} else {
						if (environment.isIos || environment.isAndroid) {
							$('.bottom-banner-box').css('display', 'block').find('a').html('加入小组').on('click', function () {
								showInviteCodeCopyTip(d);
							}).on('touchstart', function () {
								$(this).css('background', '#4B4D33');
							}).on('touchend', function () {
								$(this).css('background', '#616346');
							});
						} else {
							if (screenWidth < 340) {
								$('.slogan_1').html('Us 可以和亲密的人一起记录');
							}
							$('.toolbar-download-box').css('display', 'block');
							$('.toolbar-download-container').on('click', function () {
								location.href = downloadLink.microdownload;
							});
							removeOnloadGif();
						}
					}
					if (environment.isIos || environment.isAndroid) {
						if (screenWidth < screenHeight && screenWidth <= 768) {
							showOnloadTip(d, memberList);
						} else {
							removeOnloadGif();
						}
					} else {
						removeOnloadGif();
					}
				} else if (getQueryStringArgs().target == 'share') {
					if (screenWidth < 340) {
						$('.slogan_1').html('Us 可以和亲密的人一起记录');
					}
					$('.toolbar-download-box').css('display', 'block');
					$('.toolbar-download-container').on('click', function () {
						location.href = downloadLink.microdownload;
					});
					removeOnloadGif();
				}


				// 封面图
				if (d.p.group.coverpage == 'default') {
					alert('小组加载失败，请稍后重试。(e:20051)');
					$('#onload-gifimg').remove();
					WeixinJSBridge.call('closeWindow');
				} else {
					$('.group-cover-content').find('img').attr('src', function () {
						var pictureBaseUrl = urlProtocol + urlConfig.download_domain + '/';
						var photoFile = d.p.group.coverpage;
						var photoFileDirAndName = photoFile.match(/(.*)\.(.*$)/)[1];
						var photoFileExt = photoFile.match(/(.*)\.(.*$)/)[2];
						var width = getRetinaImgSize(screenWidth);
						var height = parseInt(width * 0.64);
						var trueImgUrl = pictureBaseUrl + photoFileDirAndName + '_' + width + 'x' + height + '.' + photoFileExt;
						return trueImgUrl;
					});
				}

				//封面文字
				if (!environment.isWeixin) {
					$('.group-name').find('p').html(d.p.group.name);
				}
				$('.group-count').find('div').eq(1).html(d.p.group.e_num);
				$('.group-count').find('div').eq(3).html(d.p.group.p_num);


				//成员头像
				for (var i = 0; i < memberList.length; i++) {
					var pictureBaseUrl = urlProtocol + urlConfig.download_domain + '/';
					var photoFile = memberList[i].avatar;
					var photoFileDirAndName = photoFile.match(/(.*)\.(.*$)/)[1];
					var photoFileExt = photoFile.match(/(.*)\.(.*$)/)[2];
					var width = getRetinaImgSize(36);
					var height = width;
					var trueImgUrl = pictureBaseUrl + photoFileDirAndName + '_' + width + 'x' + height + '.' + photoFileExt;
					$('.group-authors-list').append("<li><img alt src='" + trueImgUrl + "' width='36' height='36'></li>");
				}
				appearAuthorsList();
				$('.group-authors').find('li').on('click', function () {
					var authorNum = $(this).index();
					var authorImgA = memberList[authorNum].avatar;
					var authorName = memberList[authorNum].nickname;
					var authorUid = memberList[authorNum].uid;
					//var authorSex = memberList[authorNum].g;
					var p_pictureBaseUrl = urlProtocol + urlConfig.download_domain + '/';
					var p_ext = authorImgA.match(/(.*)\.(.*$)/)[2];
					var p_fileDirAndName = authorImgA.match(/(.*)\.(.*$)/)[1];
					var authorImgSrc_1 = p_pictureBaseUrl + p_fileDirAndName + '_';
					var authorImgSrc_2 = '.' + p_ext;
					showAuthorBigImg(authorName, authorUid, authorImgSrc_1, authorImgSrc_2);
				});

				// 活动图和内容
				for (var i = 0; i < d.p.event.list.length; i++) {
					var pictureBaseUrl = urlProtocol + urlConfig.download_domain + '/';
					var photoFile = d.p.event.list[i].cover_page;
					var photoFileDirAndName = photoFile.match(/(.*)\.(.*$)/)[1];
					var photoFileExt = photoFile.match(/(.*)\.(.*$)/)[2];
					var width = getRetinaImgSize((screenWidth - 30) / 2);
					var height = width;
					var trueImgUrl = pictureBaseUrl + photoFileDirAndName + '_' + width + 'x' + height + '.' + photoFileExt;
					var startDate = new Date(parseInt(d.p.event.list[i].start_time)),
						startDateMonth = startDate.getMonth() + 1,
						startDateYear = startDate.getFullYear(),
						startDateDay = startDate.getDate();
					var eventTime = startDateMonth + '.' + startDateDay + ' ' + startDateYear;
					var eventInvitationCode = d.p.event.list[i].invitation_code;
					$('.group-figure-list').append('<li><div class="group-figure"><div class="group-event-content"><a class="group-event-box" href="javascript:;" data-code="' + eventInvitationCode + '"><img alt data-original="' + trueImgUrl + '" width="100%" height="100%"><div class="group-event-imgmask"></div><div class="group-event-dataname"><p class="group-event-data">' + eventTime + '</p><p class="group-event-name replace-emoji">' + d.p.event.list[i].name + '</p></div></a></div></div></li>');
				}
				jumpToEvent(d);

				$('.replace-emoji').each(function(i, d){
					$(d).emoji();
				});

				var groupListbtnNum = 1;
				$('.group-figure-listbtn').on('touchstart',function(e){
					e.preventDefault();
					if(groupListbtnNum == 0) {
						groupListbtnNum = 1;
						$('.group-bit-listbtn').removeClass('select');
						$('.group-bit-list').css('display','none');
						$('.group-figure-list').css('display','block');
						$(this).addClass('select');
					}
				});
				$('.group-bit-listbtn').on('touchstart',function(e){
					e.preventDefault();
					if(groupListbtnNum == 1) {
						groupListbtnNum = 0;
						$('.group-figure-listbtn').removeClass('select');
						$('.group-figure-list').css('display','none');
						$('.group-bit-list').css('display','block');
						$(this).addClass('select');
						showBitList();
					}
				});


				// 懒加载
				$("img").lazyload({
					threshold: 100,
					failure_limit: 9999,
					effect: "fadeIn",
					placeholder: 'data:image/gif;base64,R0lGODlhAQABAJH/AP///wAAAMDAwAAAACH5BAEAAAIALAAAAAABAAEAAAICVAEAOw=='
				});
			}
		},
		error: function (e) {
			alert('小组加载失败，请稍后重试。(e:20050)');
			$('#onload-gifimg').remove();
			WeixinJSBridge.call('closeWindow');
		}
	})
}



//取消双击bug
function cancelDoubleTapBug() {
	var agent = navigator.userAgent;
	var iLastTouch = null;
	if (agent.indexOf('Mac') > -1 && agent.indexOf('Mobile') > -1) {
		document.body.addEventListener('touchend', function (event) {
			var iNow = new Date().getTime();
			iLastTouch = iLastTouch || iNow + 1;
			var delta = iNow - iLastTouch;
			if (delta < 500 && delta > 0) {
				event.preventDefault();
				return false;
			}
			iLastTouch = iNow;
		}, false);
	}
}

var loginMarkKey = $.cookie('loginMarkCookie');
var hasLoginMarkKey = $.cookie('hasLoginCookie');
var redirectUrl = location.protocol + '//' + location.host + location.pathname + '?invitation_code=' + getQueryStringArgs().invitation_code + '&target=invite';
// 如果是微信环境且查询字符串的target是invite且还没获取code，则跳到授权页
if (environment.isWeixin && getQueryStringArgs().target === 'invite' && !getQueryStringArgs().code) {
	if (loginMarkKey !== 'CheckCheck') {
		//alert('重新授权' + loginMarkKey);
		location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appId + '&redirect_uri=' + encodeURIComponent(redirectUrl) + '&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect';
	} else {
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
			target: 'group',
			type: 3,
			platform: 2,
			device_id: 'web',
			os_version: getOsVersion(),
			client_version: versionNumber,
			phone_model: getOsVersion(),
			distributor: 'web'
		},
		success: function (d) {

			// if (d.c !== 200) {
			// 	alert('活动不存在');
			// }else{
			galleryData.sessionKey = d.session_key;
			galleryData.avatar = d.avatar;
			galleryData.uid = d.uid;
			galleryData.nickname = d.nickname;

			// var loginMarkCookie = getQueryStringArgs().invitation_code;
			$.cookie('loginMarkCookie', 'CheckCheck', {expires: 30});
			if (d.uid) {
				//alert(d.uid);
				buildDom();
			} else {
				alert('邀请函已失效(e:20002)');
				$('#onload-gifimg').remove();
				WeixinJSBridge.call('closeWindow');
			}
			// }
		},
		error: function (e) {
			//alert(JSON.stringify(e));
			alert('小组不存在(e:20001)');
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
			target: 'group',
			type: 3,
			platform: 2,
			device_id: 'web',
			os_version: getOsVersion(),
			client_version: versionNumber,
			phone_model: getOsVersion(),
			distributor: 'web'
		},
		success: function (d) {
			if (d.c == 400) {
				alert('邀请函已失效(e:20011)');
				$('#onload-gifimg').remove();
				WeixinJSBridge.call('closeWindow');
			} else if (d.p.uid && d.p.avatar && d.p.session_key && d.p.nickname && d.p.session_key !== 'false' && d.c == 200) {
				galleryData.sessionKey = d.p.session_key;
				galleryData.avatar = d.p.avatar;
				galleryData.uid = d.p.uid;
				galleryData.nickname = d.p.nickname;
				$.cookie('hasLoginCookie', 'LoginCheck', {expires: 30});
				buildDom();
			} else {
				//alert('静默授权重定向');
				if (hasLoginMarkKey == 'LoginCheck') {
					$.cookie('hasLoginCookie', '', {expires: -1});
					location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appId + '&redirect_uri=' + encodeURIComponent(redirectUrl) + '&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect';
				} else {
					$.cookie('loginMarkCookie', '', {expires: -1});
					location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appId + '&redirect_uri=' + encodeURIComponent(redirectUrl) + '&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect';
				}
			}
		},
		error: function (e) {
			//alert(JSON.stringify(e));
			alert('小组不存在(e:20012)');
			$('#onload-gifimg').remove();
			WeixinJSBridge.call('closeWindow');
		}
	})
}

// 获取url信息
function getUrlConfig() {
	$.ajax({
		url: apiUrl,
		dataType: 'json',
		data: {
			version: 1,
			platform: 2
		},
		success: function (d) {
			if (pokoConsole) {
				console.log(d);
			}

			urlConfig = d.p;

			$.each(d.p, function (key, value) {
				if (typeof value === 'string' && /^https/.test(value)) {
					urlConfig[key] = /^https:\/\/(.*)/.exec(value)[1]
				}
			});

			if (urlConfig.init_domain === 'app.himoca.com:9990') {
				urlConfig.init_domain = 'app.himoca.com';
				urlConfig.upload_domain = 'app.himoca.com';
			}

			cancelDoubleTapBug();

			// 如果在微信中且得到code后，则触发 登录 和 获取微信配置信息
			if (environment.isWeixin && environment.isWeixinLogin && loginMarkKey !== 'CheckCheck') {
				// 注册
				register();
			} else if (environment.isWeixin && environment.isWeixinLogin && loginMarkKey == 'CheckCheck') {
				loginCheck();
			} else if (!environment.isWeixin && getQueryStringArgs().target == 'invite') {
				buildDom();
			} else if (getQueryStringArgs().target == 'share') {
				buildDom();
			}
		},
		error: function (e) {
			alert('小组加载失败，请稍后重试。(e:20020)');
			$('#onload-gifimg').remove();
			WeixinJSBridge.call('closeWindow');
		}
	})
}


//第一步运行
$(function () {

	getUrlConfig();

	$('#onload-gif').on('touchstart', function (e) {
		e.preventDefault();
	})


});

