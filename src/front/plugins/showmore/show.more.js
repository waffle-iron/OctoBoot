(window.OctoBoot_plugins = window.OctoBoot_plugins || {}).showmore = function(el, forceClose) {
    var button = $(el);
    var open = typeof forceClose !== "undefined" ? !forceClose : !button.find('i').hasClass('flipped');
    var mask = button.prev();
    var content = mask.children('.sm_content');
    var height = open ? button.prev().children('.sm_content').height() : parseInt(button.parent().css('min-height'))

    if (open && content.position().top) {
        height += content.position().top
    }
    
    if (open) {
        button.parent().css('height', height + (button.height() * 2));
        button.prev().css('height', height);
        button.find('i').addClass('vertically flipped');
    } else {
        button.parent().css('height', height);
        button.prev().css('height', height - (button.height() * 2));
        button.find('i').removeClass('vertically flipped');
    }
}

$(document).ready(function() {
    $('.showmore.sm_button').each(function() {
        OctoBoot_plugins.showmore(this, true)
    })
})