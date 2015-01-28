
$.whenall = function(arr) { return $.when.apply($, arr); };

function getNextPageOfSets(setIds, pageNumber, pageSize){
    return $(setIds).map(function() {
      var setId = this;
      var actualPageSize = pageSize / setIds.length;

      var url = 'https://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=11e74a6baf095edb16a69e2d7ce731bf&photoset_id=' + setId + '&page=' + pageNumber + '&per_page=' + actualPageSize + '& extras=url_o&format=json&nojsoncallback=1';

      return $.getJSON(url);
    });
}

function buildPhotoUrl(photo){
    return 'http://farm'+photo.farm+'.staticflickr.com/'+photo.server+'/'+photo.id+'_'+photo.secret+'.jpg'
}

function buildHtmlFromPhoto(photo){
    var url = buildPhotoUrl(photo);
    return '<a><img src="'+url+'" alt="'+photo.title+'" /></a>'
}

function appendPhotosToElement(element, photos){
      var allHtml = $(photos).map(function(){
        return buildHtmlFromPhoto(this);
     });    
     $(element).append($.makeArray(allHtml).join(''));
}

function flattenSets(sets){
    console.log(sets);
    var sets = $(sets).map(function (index, value) {
        var response = value[0];
        if(response.photoset){
            return response.photoset.photo
        }else{
            return [];
        }
    });

    sets.sort(function(a, b) {
        a = Date.parse(a.datetaken), b = Date.parse(b.datetaken);
        return (b > a) ? 1 : -1; 
    });

    return sets;
}

$(document).ready(function(){

    var pageNumber = 1;
    var pageSize = 20;
    var setIds = ['72157649078694690', '72157649493429655'];

    var photoSetsReturned = getNextPageOfSets(setIds,pageNumber, pageSize);

    var photos = $.when.apply($, photoSetsReturned).done(function(){

        var allPhotos = flattenSets(arguments);
        appendPhotosToElement('#flickr-gallery', allPhotos);

        $('#flickr-gallery').justifiedGallery({captions:true, rel : 'gallery2'})
            .on('jg.complete', function () {
                $('#flickr-gallery').swipebox();
            });

         $(window).scroll(function() {

             if($(window).scrollTop() + $(window).height() == $(document).height()) {
               pageNumber++;
               var nextPhotos = getNextPageOfSets(setIds ,pageNumber, pageSize);
               $.when.apply($, nextPhotos).done(function(){
                    var next = flattenSets(arguments);
                    if(next.length > 0 ){
                        appendPhotosToElement('#flickr-gallery', next);
                    }
                    $('#flickr-gallery').justifiedGallery('norewind');
                });
             }

        });

    });

   

});
