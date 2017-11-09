var app = angular.module('myApp', ['ngSanitize']);
app.service('helper', function($http) {
	this.getData = function(obj){
		return {
    		async: function() {
      			return $http.post("/textdata",
			      obj
		      	)
    		}
  		};
	}

});
app.controller('myCtrl', function($scope, helper ) {

	function processDataFromServer(res){

        console.log('response', res);
        $scope.resArr = res.data.rows;
        var pagingArr = [];
        for(var i=0; i<res.data.numResults; i++){
            pagingArr.push(i+1);
        }
        $scope.pagingArr = pagingArr;
        $scope.pagingNum = res.data.pagingNum;
        $scope.load = false;

	}
	
	$scope.btnClicked = function(){
		console.log('clicked');

		var username = $scope.inputParm['username'];
		var password = $scope.inputParm['password'];
		var searchText = $scope.inputParm['search'];

		helper.getData({username: username, password: password, searchText: searchText}).async().then(function(res){
			processDataFromServer(res);
		});


	}

    $scope.pagingClick = function(num){


        var username = $scope.inputParm['username'];
        var password = $scope.inputParm['password'];
        var searchText = $scope.inputParm['search'];

        helper.getData({username: username, password: password, searchText: searchText, pagingNum: num}).async().then(function(res){
			processDataFromServer(res);



        });
    }

    
});