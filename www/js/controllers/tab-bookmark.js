/**
 * Created by hoonja on 2015. 11. 19..
 */
"use strict";

angular.module('KNY.controllers')
.controller('BookmarkCtrl', function($scope, $ionicLoading, $ionicActionSheet, $state) {
  function initialize() {
    // 현재 위치 구하기
    if (navigator.geolocation) {
      $ionicLoading.show({
        content: 'Getting current location...',
        noBackdrop: true
      });
      navigator.geolocation.getCurrentPosition(function(position) {
        $scope.curRealPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        $scope.initMapSetting();

      }, function() {
        $scope.handleLocationError(true);
        $ionicLoading.hide();

        // 우리 집 좌표로 설정 -_-
        $scope.curRealPos = {
          lat: 37.389282,
          lng: 127.094940
        };
        $scope.initMapSetting();
      });

    } else {
      // Browser doesn't support Geolocation
      $scope.handleLocationError(false);
    }
  }

  $scope.initMapSetting = function() {
    var mapOptions = {
      center: $scope.curRealPos,
      zoom: 18,
      mapTypeControlOptions: {
        mapTypeIds: [
          google.maps.MapTypeId.ROADMAP,
          google.maps.MapTypeId.SATELLITE
        ],
        position: google.maps.ControlPosition.BOTTOM_LEFT
      }
    };
    $scope.map = new google.maps.Map(document.getElementById("myMap"), mapOptions);

    $scope.map.setCenter(new google.maps.LatLng($scope.curRealPos.lat, $scope.curRealPos.lng));
    console.debug('[SUCCESS] Real position is (' + $scope.curRealPos.lat + ', ' + $scope.curRealPos.lng + ').');
    $ionicLoading.hide();

    google.maps.event.addListenerOnce($scope.map, 'idle', function() {
      $scope.marker = new google.maps.Marker({
        position: $scope.curRealPos,
        map: $scope.map,
        animation: google.maps.Animation.DROP,
        draggable: true
      });

      // marker의 드래그 이벤트가 끝나면 센터를 재조정하고 위치 정보를 남긴다
      google.maps.event.addListener($scope.marker, 'dragend', function() {
        var marker_pos = $scope.marker.getPosition();
        console.debug('[Event(marker:dragend)]: last position is ' + marker_pos + '.');
        $scope.map.setCenter(marker_pos);
        $scope.setCurPosition(marker_pos);
      });

      // 마커를 터치하면 저장을 위한 액션시트 창이 열린다
      google.maps.event.addListener($scope.marker, 'click', function() {
        $scope.showBookmarkEntryUI();
      });

      // 지도를 panning 할 때 그에 따라 마커의 위치를 바꾸어 센터에 자리하게 한다
      google.maps.event.addListener($scope.map, 'center_changed', function() {
        var center = $scope.map.getCenter();
        console.debug('[Event(map:center_changed] The changed coordinate of map_center is ' + center + '.');
        $scope.marker.setPosition(center);
        $scope.setCurPosition(center);
      });
    });
  };

  $scope.handleLocationError = function(browserHasGeolocation) {
    alert(browserHasGeolocation ? 'Error: The Geolocation service failed.' : 'Error: Your browser doesn\'t support geolocation.');
  };

  $scope.setCurPosition = function(pos) {
    $scope.curRealPos.lat = pos.lat();
    $scope.curRealPos.lng = pos.lng();
    console.debug('[Function] Current position is changed(' + pos + ').');
  };

  $scope.showBookmarkEntryUI = function() {
    // Show the action sheet
    $ionicActionSheet.show({
      buttons: [
        { text: '사진찍고 저장' },
        { text: '바로 저장' }
      ],
      titleText: '현재의 위치를 저장합니다.',
      cancelText: 'Cancel',
      cancel: function() {
        // add cancel code..
      },
      buttonClicked: function(index) {
        console.debug('[Event(ActionSheet:click)]Button['+ index + '] is clicked.');
        if (index == 0) {
          /*
          var options = {
            quality: 50,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.CAMERA,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 100,
            targetHeight: 100,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: true,
            correctOrientation:true
          };

          $cordovaCamera.getPicture(options).then(function(imageData) {
            var image = document.getElementById('myImage');
            image.src = "data:image/jpeg;base64," + imageData;
          }, function(err) {
            // error
          });
          */
          console.info('사진 찍어 이미지를 저장할 거임.');
          $state.go('tab.bookmark_insert', {mode: 'camera', lat: $scope.curRealPos.lat, lng: $scope.curRealPos.lng} );
        } else if (index == 1) {
          console.info('그냥 저장할 때는 스태틱 지도 이미지를 저장할 거임.');
          $state.go('tab.bookmark_insert', {mode: 'direct', lat: $scope.curRealPos.lat, lng: $scope.curRealPos.lng} );
        }

        return true;
      }
    });
  };

  google.maps.event.addDomListener(window, 'load', initialize);
});
