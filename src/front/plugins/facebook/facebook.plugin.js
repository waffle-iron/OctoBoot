(window.OctoBoot_plugins = window.OctoBoot_plugins || {}).facebook_plugin = function(pid, container, nbr) {
    if (!pid || !container) {
        console.error('Facebook Plugin error - page id / container missing')
    }

    nbr = nbr || 1;

    var ids, post_url;
    var appendPost = function(url) {
        var dom = document.createElement('div');
        dom.className = 'fb-post';
        dom.setAttribute('data-href', url);
        container.appendChild(dom); 
    };

    FB.api(
        '/' + pid + '/feed',
        function (response) {
          if (response && !response.error) {
            console.log(response);
            response.data.forEach(function(post) {
                if (nbr) {
                    console.log(post);
                    ids = post.id.split('_');
                    post_url = 'https://www.facebook.com/' + ids[0] + '/posts/' + ids[1];
                    appendPost(post_url);
                }
            })
          } else {
            console.error('Facebook Plugin error on page feed call', '/' + pid + '/feed', response.error)
          }
        }
    );
}