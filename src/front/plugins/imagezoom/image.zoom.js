(window.OctoBoot_plugins = window.OctoBoot_plugins || {}).imagezoom = function(elm, title, optional_src) {
    if (window.editing) {
        return
    }
    
    var load = function(done, src, optional_src) {
        var im = new Image()
        im.className = "ui fluid image"
        im.onload = function() {
            done(im, im.width / im.height)
        }
        im.src = optional_src || src
    }

    var click = function() {
        $('.imagezoom_overlay').hide()
        var args = $(this).data('args');
        load(function(img, ratio) {
            $('.imagezoom.modal img').replaceWith(img)
            $('.imagezoom.modal .header').html(args.title)
            $('.imagezoom.modal').modal('show')
            $('.imagezoom.modal img').height(($('.imagezoom.modal img').width() / ratio) + 'px')
            $('.imagezoom.modal').modal('refresh')
        }, args.optional_src || args.elm.src)
    }

    var hide = function() {$(this).hide()}
    var rect = elm.getBoundingClientRect()
    var top = rect.top + $(document).scrollTop()
    $('.imagezoom_overlay')
        .css(rect)
        .css('top', top)
        .fadeIn(200)
        .click(click)
        .mouseleave(hide)
        .data('args', {
            elm: elm,
            title: title,
            optional_src: optional_src
        })

    $('.imagezoom_overlay i')
        .css('margin-top', (($('.imagezoom_overlay').height() - $('.imagezoom_overlay i').height()) / 2) + 'px')
}

$(document).ready(function() {
    $('.imagezoom_overlay').fadeOut(0)
    $('.imagezoom.modal').modal()
})
