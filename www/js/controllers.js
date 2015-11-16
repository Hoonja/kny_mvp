"use strict";

angular.module('KNY.controllers', [])
.controller('baseCtrl', function($scope, $state, $ionicSideMenuDelegate, $ionicSlideBoxDelegate, $ionicModal) {
  // Called to navigate to the main app
  /*$scope.startApp = function() {
   $state.go('main');
   };
   $scope.next = function() {
   $ionicSlideBoxDelegate.next();
   };
   $scope.previous = function() {
   $ionicSlideBoxDelegate.previous();
   };*/

  // Called each time the slide changes
  $scope.slideChanged = function(index) {
    $scope.slideIndex = index;
    $scope.title = $scope.getTitle(index);
  };

  // Search Area
  $ionicModal.fromTemplateUrl('search.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
    console.log("Search box init");
  });

  $scope.openSearch = function() {
    $scope.modal.show();
    console.log("Search box show");
  }

  $scope.closeSearch = function() {
    $scope.modal.hide();
    console.log("Search box hide");
  }

  $scope.$on('$destroy', function() {
    $scope.modal.remove();
    console.log("Search box remove");
  });

  // init data
  $scope.menus = [
    {
      name: "Bookmark Here",
      index: 0,
      icon: "ion-pin"
    },
    {
      name: "Saved Places",
      index: 1,
      icon: "ion-flag"
    },
    {
      name: "Connect",
      index: 2,
      icon: "ion-merge"
    },
    {
      name: "Setting",
      index: 3,
      icon: "ion-gear-a"
    }
  ];

  $scope.getTitle = function(index) {
    if (index < $scope.menus.length) {
      return $scope.menus[index].name;
    } else {
      return "MAUKI studio";
    }
  }

  $scope.jumpToPage = function(index) {
    $ionicSlideBoxDelegate.slide(index);
    $ionicSideMenuDelegate.toggleLeft();
  }

  $scope.slideIndex = 0;
  $scope.title = $scope.getTitle($scope.slideIndex);

});
