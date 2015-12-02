$(initApp);
function initApp() {
  var swiper = new Swiper('.swiper-container', {
    direction: 'vertical',
    // mousewheelControl: true,
    keyboardControl: true,
    hashnav: true,
    onlyExternal: true
  })


$('.slide-next').on('click', function (e) {
  e.preventDefault();
  swiper.slideNext();
})

$('#slide-2 a:eq(0)').on('click', function (e) {
  e.preventDefault();
  swiper.slideTo(2, 300)
})

$('#slide-2 a:eq(1)').on('click', function (e) {
  e.preventDefault();
  swiper.slideTo(3, 300)
})

$('#slide-2 a:eq(2)').on('click', function (e) {
  e.preventDefault();
  swiper.slideTo(4, 300)
})

$('#slide-2 a:eq(3)').on('click', function (e) {
  e.preventDefault();
  swiper.slideTo(5, 300)
})



}
