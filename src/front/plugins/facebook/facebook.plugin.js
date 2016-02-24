(window.OctoBoot_plugins = window.OctoBoot_plugins || {}).facebook_plugin = function(pid, container, nbr) {
    if (!pid || !container) {
        console.error('Facebook Plugin error - page id / container missing')
    }

    nbr = nbr || 1;

    var ids, post_url;
    var appendPost = function(url) {
        var width = $(container).width() > 750 ? 750 : $(container).width();
        var dom = document.createElement('div');
        dom.className = 'fb-post';
        dom.setAttribute('data-href', url);
        dom.setAttribute('data-width', width)
        
        if (width > 750) {
            container.style.width = width + 'px';
        }
        
        container.appendChild(dom); 
    };

    $.get('http://octoboot.soizen.ovh/facebook/' + pid + '/feed', function(feeds) {
        feeds.forEach(function(post_id) {
            if (nbr) {
                ids = post_id.split('_');
                post_url = 'https://www.facebook.com/' + ids[0] + '/posts/' + ids[1];
                appendPost(post_url);
                nbr--
            }
        })
        if (FB) {
            FB.XFBML.parse()
        }
    });
}

window.fbAsyncInit = function() {
  FB.init({
    xfbml      : true,
    version    : 'v2.5'
  });
};

(function(d, s, id){
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) {return;}
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));