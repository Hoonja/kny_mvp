"use strict";

angular.module('KNY.services', [])
  .value('SERVER_ADDR', {
    pp: 'http://104.199.132.84/myapp/list/'
  })

  .factory('PrivatePolicy', function(){
    var policies = [{
      id: 0,
      name: '전체 공개',
      selected: ''
    }, {
      id: 1,
      name: '친구 공유',
      selected: ''
    }, {
      id: 2,
      name: '나만 보기',
      selected: 'selected'
    }];

    return {
      all : function() {
        return policies;
      },
      select: function(id) {
        for (var idx = 0; idx < policies.length; idx += 1) {
          if (idx == id) {
            policies[idx].selected = 'selected';
          } else {
            policies[idx].selected = '';
          }
        }
        console.log('Selected policy is ' + policies[id].name + '.');
      },
      getSelected: function() {
        for (var idx = 0; idx < policies.length; idx += 1) {
          if (policies[idx].selected === 'selected') {
            return policies[idx];
          }
        }
        return null;
      }
    };
  })

  .factory('PlaceDB', function() {
    var $db = '';
    return {
      getDB: function() {
        // console.log('The value of db : ' + $db);
        if ($db === '') {
          if (ionic.Platform.isIOS() || ionic.Platform.isAndroid()) {
            $db = window.sqlitePlugin.openDatabase({name: 'KNY.db'});
            //$db = $cordovaSQLite.openDB({name: 'KNY.db'});
            console.log('SQLite DB is created.');
          } else {
            $db = window.openDatabase('KNY.db', '1.0', 'KNY Place DB', 1024 * 1024 * 5);
            console.log('WebSQL DB is created.');
          }
        }
        return $db;
      },
      close: function() {
        if (ionic.Platform.isIOS() || ionic.Platform.isAndroid()) {
          if ($db !== '') {
            $db.close(function () {
              console.log('Database is closed ok.');
            });
          }
        }
      },
      SQL_PLACES_DROP:
        "DROP TABLE IF EXISTS Places",
      SQL_PLACES_CREATE:
        "CREATE TABLE IF NOT EXISTS Places (" +
        "id INTEGER PRIMARY KEY ASC AUTOINCREMENT, " +
        "name TEXT, " +
        "address TEXT, " +
        "tel TEXT, " +
        "create_dt NUMERIC, " +
        "memo TEXT, " +
        "policy NUMERIC, " +
        "lat REAL, " +
        "lng REAL)",
      SQL_PLACES_INSERT:
        "INSERT INTO Places (name, address, tel, create_dt, memo, policy, lat, lng)" +
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      SQL_PLACES_SELECT_RECENT:
        "SELECT id FROM Places ORDER BY id DESC LIMIT 1",
      SQL_PLACES_SELECT_CNT:
        "SELECT COUNT(id) AS cnt FROM Places",
      SQL_PLACES_SELECT:
        "SELECT p.id AS id, p.name AS name, p.address AS address, p.memo AS memo, i.imageURI AS imageURI, p.lat AS lat, p.lng AS lng " +
        "FROM Places p INNER JOIN Images i ON p.id = i.place_id " +
        "ORDER BY p.id DESC LIMIT ?, ?",
      SQL_PLACES_SELECT_ONE:
        "SELECT " +
        "p.id AS id, " +
        "p.name AS name, " +
        "p.address AS address, " +
        "i.imageURI AS imageURI, " +
        "p.memo AS memo, " +
        "p.lat AS lat, " +
        "p.lng AS lng " +
        "FROM Places p INNER JOIN Images i ON p.id = i.place_id " +
        "WHERE p.id = ?",
      SQL_PLACES_DELETE_ALL:
        "DELETE FROM Places",
      SQL_IMAGES_DROP:
        "DROP TABLE IF EXISTS Images",
      SQL_IMAGES_CREATE:
      "CREATE TABLE IF NOT EXISTS Images (" +
      "id INTEGER PRIMARY KEY ASC AUTOINCREMENT, " +
      "place_id INTEGER, " +
      "imageURI TEXT, " +
      "create_dt NUMERIC)",
      SQL_IMAGES_INSERT:
        "INSERT INTO Images (place_id, imageURI, create_dt) VALUES (?, ?, ?)",
      SQL_IMAGES_SELECT_CNT:
        "SELECT COUNT(id) AS cnt FROM Images",
      SQL_IMAGES_DELETE_ALL:
        "DELETE FROM Images",
      SQL_IMAGES_SELECT_PATH:
        "SELECT imageURI FROM Images ORDER BY id DESC"
    };
  })

  .factory('CacheService', function() {
    var images = [];

    function getImages() {
      return images;
    }

    function addImage(img) {
      images.push(img);
    }

    function resetImage() {
      images = [];
    }

    return {
      storeImage: addImage,
      images: getImages,
      resetImage: resetImage
    };
  })

  .factory('StorageService', function() {
    function getData(key) {
      var datum = window.localStorage.getItem(key);
      if (datum) {
        return JSON.parse(datum);
      }
      return null;
    }

    function addData(key, value) {
      window.localStorage.setItem(key, JSON.stringify(value));
    }

    return {
      getData: getData,
      addData: addData
    };
  })

  .factory('ImageService', function($cordovaCamera, CacheService, $q, $cordovaFile, DaumMapService){
    var MapService = DaumMapService;

    function makeid() {
      var text = '';
      var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

      for (var i = 0; i < 5; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }

      return text;
    }

    function optionsForType(type) {
      var source;
      switch(type) {
        case '0':
          source = Camera.PictureSourceType.CAMERA;
          break;
        case '1':
          source = Camera.PictureSourceType.PHOTOLIBRARY;
          break;
      }

      return {
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: source,
        allowEdit: false,
        encodingType: Camera.EncodingType.JPEG,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false
      };
    }

    function saveMedia(type) {
      return $q(function(resolve, reject) {
        if (type!='2'){
          var options = optionsForType(type);

          $cordovaCamera.getPicture(options)
            .then(function (imageUrl) {
              console.log("imageUrl: " + imageUrl);
              if (imageUrl.indexOf('content:') >= 0 && ionic.Platform.isAndroid()) {
                window.FilePath.resolveNativePath(imageUrl, function(resolved) {
                  console.log('resolveNativePath is success : ' + JSON.stringify(resolved));
                  var resolvedUrl = 'file://' + resolved;

                  var name = resolvedUrl.substr(resolvedUrl.lastIndexOf('/') + 1);
                  var namePath = resolvedUrl.substr(0, resolvedUrl.lastIndexOf('/') + 1);
                  var newName = makeid() + name;
                  console.log('Resolved FileName : ' + name);
                  console.log('Resolved Path : ' + namePath);

                  $cordovaFile.copyFile(namePath, name, cordova.file.dataDirectory, newName)
                    .then(function (info) {
                      console.log('FilePath : ' + cordova.file.dataDirectory + newName);
                      CacheService.storeImage(cordova.file.dataDirectory + newName);
                      resolve();
                    }, function (e) {
                      reject();
                    });

                }, function(error) {
                  console.error('resolveNativePath Error : ' + JSON.stringify(error));
                });
              } else {
                var name = imageUrl.substr(imageUrl.lastIndexOf('/') + 1);
                var namePath = imageUrl.substr(0, imageUrl.lastIndexOf('/') + 1);
                var newName = makeid() + name;
                $cordovaFile.copyFile(namePath, name, cordova.file.dataDirectory, newName)
                  .then(function (info) {
                    console.log('FilePath : ' + cordova.file.dataDirectory + newName);
                    CacheService.storeImage(cordova.file.dataDirectory + newName);
                    resolve();
                  }, function (e) {
                    reject();
                  });
              }
            });
        }else {
          //CacheService.storeImage(TestPlacesSet[Math.floor(Math.random()*TestPlacesSet.length)].imageURI);
              CacheService.storeImage(MapService.getMapImage());
              resolve();
          }
      });
    }

    return {
      handleMediaDialog: saveMedia
    }
  })

  .factory('GoogleMapService', function($ionicLoading, $q) {
    var curRealPos = {lat:0, lng:0};
    var orgRealPos = {lat:0, lng:0};
    var map = {};
    var address;

    function init(map_id, useBookmarkPin, showBookmarkEntryUI) {
      return $q(function(resolve, reject) {
        // 현재 위치 구하기
        if (navigator.geolocation) {
          $ionicLoading.show({
            content: 'Getting current location...',
            noBackdrop: true
          });
          navigator.geolocation.getCurrentPosition(function(position) {
            curRealPos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            orgRealPos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            console.info('Original position is (' + orgRealPos.lat + ', ' + orgRealPos.lng + ').');
            initMapSetting(map_id, useBookmarkPin, showBookmarkEntryUI);
            resolve();
          }, function() {
            handleLocationError(true);
            $ionicLoading.hide();

            // 우리 사무실 좌표로 설정 -_-
            curRealPos = {
              lat: 37.403425,
              lng: 127.105783
            };
            orgRealPos = {
              lat: 37.403425,
              lng: 127.105783
            };
            initMapSetting(map_id, useBookmarkPin, showBookmarkEntryUI);
            resolve();
          });
        } else {
          handleLocationError(false);  // Browser doesn't support Geolocation
          reject();
        }
      });
    }

    function initMapSetting(map_id, useBookmarkPin, showBookmarkEntryUI) {
      var mapOptions = {
        center: curRealPos,
        zoom: 18,
        mapTypeControlOptions: {
          mapTypeIds: [
            google.maps.MapTypeId.ROADMAP,
            google.maps.MapTypeId.SATELLITE
          ],
          position: google.maps.ControlPosition.BOTTOM_LEFT
        }
      };
      map[map_id] = new google.maps.Map(document.getElementById(map_id), mapOptions);
      getAddress();
      $ionicLoading.hide();

      if (useBookmarkPin == true) {
        var marker = new google.maps.Marker({
          position: curRealPos,
          map: map[map_id],
          animation: google.maps.Animation.DROP,
          clickable: true,
          draggable: true
        });

        // marker의 드래그 이벤트가 끝나면 센터를 재조정하고 위치 정보를 남긴다
        google.maps.event.addListener(marker, 'dragend', function() {
          var marker_pos = marker.getPosition();
          map[map_id].setCenter(marker_pos);
          setCurPosition(marker_pos);
        });

        // 마커를 터치하면 저장을 위한 액션시트 창이 열린다
        google.maps.event.addListener(marker, 'click', showBookmarkEntryUI);

        // 지도를 panning 할 때 그에 따라 마커의 위치를 바꾸어 센터에 자리하게 한다
        google.maps.event.addListener(map[map_id], 'dragend', function () {
          var center = map[map_id].getCenter();
          console.log('[Event(map:dragend] The changed coordinate of map_center is ' + center + '.');
          marker.setPosition(center);
          setCurPosition(center);
        });
        google.maps.event.addListener(map[map_id], 'center_changed', function() {
          var center = map[map_id].getCenter();
          console.log('[Event(map:center_changed] The changed coordinate of map_center is ' + center + '.');
          marker.setPosition(center);
          setCurPosition(center);
        });
      }
    }

    function handleLocationError(browserHasGeolocation) {
      alert(browserHasGeolocation ? 'Error: The Geolocation service failed.' : 'Error: Your browser doesn\'t support geolocation.');
    }

    function setCurPosition(pos) {
      curRealPos.lat = pos.lat();
      curRealPos.lng = pos.lng();
      getAddress();
      console.log('[Function] Current position is changed(' + pos + ').');
    }

    function getAddress() {
      var geocoder = new google.maps.Geocoder;
      console.log('curRealPos : ' + JSON.stringify(curRealPos));
      geocoder.geocode({'location' : curRealPos},
        function(results, status) {
          console.log('results is');
          console.dir(results);
          if (status === google.maps.GeocoderStatus.OK) {
            if (results[1]) {
              address = results[1].formatted_address;
              console.info('Current Address is ' + address + '.');
            } else {
              console.warn('Geocoder results are not found.');
              address = status;
            }
          } else {
            console.error('Geocoder failed due to: ' + status);
            address = status;
          }
        });
    }

    function getMapImage() {
      return "http://maps.google.com/maps/api/staticmap?sensor=false&center=" +
        curRealPos.lat + "," + curRealPos.lng +
        "&zoom="+map.getZoom()+"&size=512x512&scale=2&markers=color:green|label:X|" +
        curRealPos.lat + ',' + curRealPos.lng + '&key=AIzaSyDkuFga8fr1c4PjzSAiHaBWo26zvQbtxB8';
    }

    function addMarker(map_id, lat, lng, title, address, id) {
      var image= {
        url: 'img/marker.png',
        size: new google.maps.Size(128, 128),
        scaledSize: new google.maps.Size(32, 32),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(16, 32)
      };
      var shape = {
        coords: [1, 1, 1, 31, 31, 31, 31, 1],
        type: 'poly'
      };

      var markerPosition = {lat: lat, lng: lng};

      var marker = new google.maps.Marker({
        position: markerPosition,
        map: map[map_id],
        clickable: true,
        draggable: false,
        animation: google.maps.Animation.DROP,
        icon: image,
        shape: shape,
        title: title
      });

      // info window 등록
      var iwContent = '<div style="padding:5px;">'
        + '<h3>' + title + '</h3><h5>' + address + '</h5>'
        + '<a href="#/tab/place/' + id + '">상세보기</a> </div>';
      var iw = new google.maps.InfoWindow({
        //removable: true,   // !!!
        content: iwContent
      });
      daum.maps.event.addListener(marker, 'click', function() {
        iw.open(map[map_id], marker);
      });


      return marker;
    }

    function deleteMarker(marker) {
      marker.setMap(null);
    }

    function relayout(map_id) {
      console.debug('map.relayout is called. But, google maps does not support this method.');
    }

    function setCenter(map_id) {
      console.log('setCenter map_id: ' + map_id);
      console.log('setCenter : ' + map[map_id]);
      map[map_id].setCenter(new daum.maps.LatLng(orgRealPos.lat, orgRealPos.lng));
    }

    return {
      init: init,
      getCurPosition: function() {return curRealPos;},
      getAddress: function() {return address;},
      getMapImage: getMapImage,
      addMarker: addMarker,
      deleteMarker: deleteMarker,
      relayout: relayout,
      setCenterToCurPosition: setCenter
    };
  })

  .factory('DaumMapService', function($ionicLoading, $q) {
    var curRealPos = {lat:0, lng:0};
    var orgRealPos = {lat:0, lng:0};
    var map = {};
    var address;

    function init(map_id, useBookmarkPin, showBookmarkEntryUI) {
      return $q(function(resolve, reject) {
        // 현재 위치 구하기
        if (navigator.geolocation) {
          $ionicLoading.show({
            content: 'Getting current location...',
            noBackdrop: true
          });
          navigator.geolocation.getCurrentPosition(function(position) {
            curRealPos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            orgRealPos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            console.info('Original position is (' + orgRealPos.lat + ', ' + orgRealPos.lng + ').');
            initMapSetting(map_id, useBookmarkPin, showBookmarkEntryUI);
            resolve();
          }, function() {
            handleLocationError(true);
            $ionicLoading.hide();

            // 우리 사무실 좌표로 설정 -_-
            curRealPos = {
              lat: 37.403425,
              lng: 127.105783
            };
            orgRealPos = {
              lat: 37.403425,
              lng: 127.105783
            };
            initMapSetting(map_id, useBookmarkPin, showBookmarkEntryUI);
            resolve();
          });
        } else {
          handleLocationError(false);  // Browser doesn't support Geolocation
          reject();
        }
      });
    }

    function initMapSetting(map_id, useBookmarkPin, showBookmarkEntryUI) {
      var mapOptions = {
        center: new daum.maps.LatLng(curRealPos.lat, curRealPos.lng),
        level: 3
      };
      map[map_id] = new daum.maps.Map(document.getElementById(map_id), mapOptions);
      getAddress();
      $ionicLoading.hide();

      if (useBookmarkPin == true) {
        var marker = new daum.maps.Marker({
          position: new daum.maps.LatLng(curRealPos.lat, curRealPos.lng),
          map: map[map_id],
          clickable: true,
          draggable: true
        });

        // marker의 드래그 이벤트가 끝나면 센터를 재조정하고 위치 정보를 남긴다
        daum.maps.event.addListener(marker, 'dragend', function () {
          var marker_pos = marker.getPosition();
          map[map_id].setCenter(marker_pos);
          setCurPosition(marker_pos);
        });

        // 마커를 터치하면 저장을 위한 액션시트 창이 열린다
        daum.maps.event.addListener(marker, 'click', showBookmarkEntryUI);

        // 지도를 panning 할 때 그에 따라 마커의 위치를 바꾸어 센터에 자리하게 한다
        //daum.maps.event.addListener(map, 'center_changed', function () {
        daum.maps.event.addListener(map[map_id], 'dragend', function () {
          var center = map[map_id].getCenter();
          console.log('[Event(map:dragend] The changed coordinate of map_center is ' + center + '.');
          marker.setPosition(center);
          setCurPosition(center);
        });
        daum.maps.event.addListener(map[map_id], 'center_changed', function () {
          var center = map[map_id].getCenter();
          console.log('[Event(map:center_changed] The changed coordinate of map_center is ' + center + '.');
          marker.setPosition(center);
          setCurPosition(center);
        });
      }
    }

    function handleLocationError(browserHasGeolocation) {
      alert(browserHasGeolocation ? 'Error: The Geolocation service failed.' : 'Error: Your browser doesn\'t support geolocation.');
    }

    function setCurPosition(pos) {
      curRealPos.lat = pos.getLat();
      curRealPos.lng = pos.getLng();
      getAddress();
      console.log('[Function] Current position is changed(' + pos + ').');
    }

    function getAddress() {
      var geocoder = new daum.maps.services.Geocoder();
      geocoder.coord2detailaddr(
        new daum.maps.LatLng(curRealPos.lat, curRealPos.lng),
        function(status, result) {
          if (status === daum.maps.services.Status.OK) {
            if (result[0]) {
              address = result[0].jibunAddress.name;
              console.info('Current Address is ' + address + '.');
              console.dir(result);
            } else {
              console.warn('Geocoder results are not found.');
              address = status;
            }
          } else {
            console.error('Geocoder failed due to: ' + status);
            address = status;
          }
        });
    }

    function getMapImage() {
      return "http://maps.google.com/maps/api/staticmap?sensor=false&center=" +
        curRealPos.lat + "," + curRealPos.lng +
        "&zoom=16&size=512x512&scale=2&markers=color:green|label:X|" +
        curRealPos.lat + ',' + curRealPos.lng + '&key=AIzaSyDkuFga8fr1c4PjzSAiHaBWo26zvQbtxB8';
    }

    function addMarker(map_id, lat, lng, title, address, id) {
      var imageSrc = "http://i1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png";
      var imageSize = new daum.maps.Size(24, 35);
      var markerImage = new daum.maps.MarkerImage(imageSrc, imageSize);

      var markerPosition = new daum.maps.LatLng(lat, lng);

      var marker = new daum.maps.Marker({
        position: markerPosition,
        map: map[map_id],
        draggable: false,
        image: markerImage,
        title: title
      });

      // info window 등록
      var iwContent = '<div style="padding:5px;">'
        + '<h3>' + title + '</h3><h5>' + address + '</h5>'
        + '<a href="#/tab/place/' + id + '">상세보기</a> </div>';
      var iw = new daum.maps.InfoWindow({
        content: iwContent,
        removable: true
      });
      daum.maps.event.addListener(marker, 'click', function() {
        iw.open(map[map_id], marker);
      });


      return marker;
    }

    function deleteMarker(marker) {
      marker.setMap(null);
    }

    function relayout(map_id) {
      if (map[map_id] !== undefined) {
        console.debug('map.relayout is called.');
        map[map_id].relayout();
      } else {
        console.debug('map.relayout is called, but map object is undefined.');
      }
    }

    function setCenter(map_id) {
      console.log('setCenter map_id: ' + map_id);
      console.log('setCenter : ' + map[map_id]);
      map[map_id].setCenter(new daum.maps.LatLng(orgRealPos.lat, orgRealPos.lng));
    }

    return {
      init: init,
      getCurPosition: function() {return curRealPos;},
      getAddress: function() {return address;},
      getMapImage: getMapImage,
      addMarker: addMarker,
      deleteMarker: deleteMarker,
      relayout: relayout,
      setCenterToCurPosition: setCenter
    };
  })

  .factory('MapService', function(GoogleMapService, DaumMapService, StorageService) {
    var GOOGLE_MAP = 0;
    var DAUM_MAP = 1;
    var serviceType = null;
    var storageKey = 'map_type';

    function setMapService(type) {
      serviceType = type;
      StorageService.addData(storageKey, type);
      console.debug('Map type [' + serviceType + '] is set.');
    }

    function getMapService() {
      serviceType = StorageService.getData(storageKey);
      if (serviceType == null) {
        serviceType = getMapServiceType();
      }

      if (serviceType != GOOGLE_MAP) {
        return DaumMapService;
      } else {
        return GoogleMapService;
      }
    }

    function getMapServiceType() {
      serviceType = StorageService.getData(storageKey);
      if (serviceType == null) {
        console.warn('The saved map info is null, so default type will be returned.');
        serviceType = DAUM_MAP;
        StorageService.addData(storageKey, serviceType);
      }
      console.debug('The gotten map type is ' + serviceType + '.');
      return serviceType;
    }

    return {
      setMapService: setMapService,
      getMapService: getMapService,
      getMapServiceType: getMapServiceType
    }
  })
  .factory('FileUploader', function($cordovaFileTransfer) {
    function uploadImage(url, file, options) {
      /*
        [options]
        fileKey     string	The name of the form element
        fileName	  string	The name to use when saving the file on the server
        httpMethod	string	The HTTP method to use
        mimeType	  string	The mime type of the data to upload
        params	    object	The set of key pairs to pass in the request
        headers     object  The map of header name values
       */
      return $cordovaFileTransfer.upload(url, file, options);
    }

    return {
      estimatePlaces : uploadImage
    };
  });
