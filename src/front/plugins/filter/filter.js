(window.OctoBoot_plugins = window.OctoBoot_plugins || {}).filter = function() {
    var toSearch = $(this).data('search')
    var input = $(this).find('input')
    var icon = $(this).find('i')

    input.on('change', function() {
        var val = input.val()

        $(toSearch).each(function() {
            $(this).css('display', $(this).html().match(val) ? 'block' : 'none')
        })
        
        icon.removeClass('search').addClass('checkmark')
        icon.css('color', 'green')
        setTimeout(function() {
            icon.removeClass('checkmark').addClass('search')
            icon.css('color', '')
        }, 1000)
    })
}

$(document).ready(function() {
    $('.input.filter').each(OctoBoot_plugins.filter)
})