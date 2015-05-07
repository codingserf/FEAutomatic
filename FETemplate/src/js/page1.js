(function(win, doc, undefined) {
	var posTask = angular.module('posTask', ['ngRoute', 'ngTouch', 'w5c.validator']);
	posTask.config(['$routeProvider', function($routeProvider) {
		$routeProvider.
		when('/postasks/', {
			templateUrl: 'views/page1/pos.tasks.html',
			controller: 'posTasksCtrler'
		}).
		when('/pos/', {
			templateUrl: 'views/page1/pos.form.html',
			controller: 'posFormCtrler'
		}).
		when('/s1/', {
			templateUrl: 'views/page1/s1.form.html',
			controller: 's1FormCtrler'
		}).
		otherwise({
			redirectTo: '/postasks/'
		});

	}]);

	posTask.config(['w5cValidatorProvider', function(w5cValidatorProvider) {
		// 全局配置
		w5cValidatorProvider.config({
			blurTrig: false,
			showError: true,
			removeError: true
		});

		w5cValidatorProvider.setRules({

			provinceCode: {
				required: "请选择省(市)"
			},
			cityCode: {
				required: "请选择市(县)"
			},
			blockCode: {
				required: "请选择县(区)"
			},
			salesPerMonth: {
				pattern: "请输入正整数"
			},
			phone: {
				pattern: "请输入正确的电话号码"
			},
			idNumber: {
				pattern: "请输入正确的身份证号"
			}
		});
	}]);
	posTask.factory("_loading", function() {
		var $loading = $('.loading-modal'),
			service = {
				show: function() {
					$loading.show();
				},
				hide: function() {
					$loading.hide();
				}
			};

		return service;
	});
	posTask.factory("_pageTitle", function() {
		var service = {
			set: function(title) {
				document.title = title;
			}
		};

		return service;
	});

	posTask.factory("_wxService", ['_loading', '$http', function(_loading, $http) {
		// return a hardcoded profile for this example

		var chooseOneImage = function(success) {

				wx.chooseImage({
					success: function(res) {

						if (res.localIds.length > 1) {
							alert('只能选择1张图片，请重新选择');
							return;
						}
						_loading.show();
						setTimeout(function() {//微信6.1不触发bug
							wx.uploadImage({
								localId: res.localIds[0],
								isShowProgressTips: 0,
								success: function(res) {
									$http.get('test/json/UploadPhoto.json?serverId='+res.serverId).success(function(json) {
										if (json.status === 0) {
											success(json.data.photo);
										} else {
											alert(json.msg);
										}
										_loading.hide();
									}).error(function(data, status, headers, config) {
										alert(APP.err._UploadPhoto+status);
									});
								},
								fail: function(res) {
									if(JSON.stringify(res).indexOf('function not exist')>-1){
										alert('您当前微信版本不支持图片上传功能，请升级微信');
									}
								}
							});
						}, 100);
					},
					fail: function(res){
						alert(JSON.stringify(res));
					}
				});
			},
			downloadImage = function(serverId, getLocalIdCallback) {
				wx.downloadImage({
					serverId: serverId,
					success: function(res) {
						getLocalIdCallback(res.localId);
					}
				});
			},
			isServerId = function(photo) { //判断图片地址是否是微信serverId
				return photo.indexOf('http://') > -1 ? false : true;
			};

		return {
			chooseOneImage: chooseOneImage,
			downloadImage: downloadImage,
			isServerId: isServerId
		};
	}]);

	posTask.controller('posTasksCtrler', ["$scope", "$http", "_loading", "_pageTitle", function($scope, $http, _loading, _pageTitle) {
		_pageTitle.set('POS任务列表');
		_loading.show();
		$http.get('test/json/GetPOSTasks.json').success(function(json) {
			$scope.isDataValidate = json.status === 0 ? true : false;
			if ($scope.isDataValidate) {
				$scope.postasks = json.data;
				$scope.isEmpty = json.data.length === 0 ? true : false;
			} else {
				alert(json.msg);
			}
			_loading.hide();
		}).error(function(data, status, headers, config) {
			alert(APP.err._GetPOSTasks+status);
		});
	}]);

	posTask.controller('posFormCtrler', ['$scope', '$routeParams', '$http', '$location', '_loading', '_pageTitle', '_wxService', function($scope, $routeParams, $http, $location, _loading, _pageTitle, _wxService) {
		_loading.show();
		//POSTYPES PROVINCELIST CITYLIST BLOCKLIST 是静态存储的资源
		getLocalData('local_POSTYPES', 'test/json/GetPOSTypes.json', 'POSTYPES');
		getLocalData('local_PROVINCELIST', 'test/json/GetAreas_province.json?code=0', 'PROVINCELIST');

		$scope.pos = angular.extend({}, {
			operate: $routeParams.id === undefined ? 0 : 1
		});
		if ($scope.pos.operate === 1) { //update
			$scope.pos.status = parseInt($routeParams.status);
			if ($scope.pos.status === 0) {
				_pageTitle.set('查看POS');
			} else {
				_pageTitle.set('编辑POS');
			}

			$http.get('test/json/GetPOS.json?id=' + $routeParams.id).success(function(json) {
				if (json.status === 0) {

					$scope.setAreas(json.data.provinceCode, 'CITYLIST');
					$scope.setAreas(json.data.cityCode, 'BLOCKLIST');

					$scope.pos = angular.extend($scope.pos, json.data, {
						id: $routeParams.id
					});
					if($scope.pos.photo===''){
						$scope.photourl = APP.phImg;
					}else{
						$scope.photourl = $scope.pos.photo;
					}
					if ($scope.pos.status === 0) {
						_pageTitle.set('查看POS');
					}
					_loading.hide();
				} else {
					alert(json.msg);
					$routeParams = null;
					$location.path('/postasks/');
				}
			}).error(function(data, status, headers, config) {
				alert(APP.err._GetPOS+status);
			});
		} else { //create
			_pageTitle.set('创建POS');
			$http.get('test/json/GetD1Area.json').success(function(json) {
				if (json.status === 0) {
					$scope.pos.provinceCode = json.data.provinceCode;
					$scope.setAreas($scope.pos.provinceCode, 'CITYLIST');
				} else {
					alert(json.msg);
				}
			}).error(function(data, status, headers, config) {
				alert(APP.err._GetD1Area+status);
			});
			$scope.pos.openningTime = '09:00';
			$scope.pos.closingTime = '21:00';
			$scope.photourl = APP.phImg;
			//隐藏loading
			_loading.hide();
		}

		APP.initTimePicker();

		$scope.setAreas = function(code, scopekey) {

			if (scopekey === 'CITYLIST') {
				$scope.CITYLIST = $scope.BLOCKLIST = [];
			} else {
				$scope[scopekey] = [];
			}
			if (code === undefined || code === '') {
				return;
			}
			getLocalData('local_' + scopekey + '_' + code, 'test/json/GetAreas_city.json?code=' + code, scopekey);
		};
		$scope.chooseImage = function() {
			_wxService.chooseOneImage(function(photo) {
				$scope.pos.photo = photo;
				$scope.photourl = photo;
				$scope.$apply();
			});
		};
		$scope.submitPosForm = function() {
			_loading.show();
			$http.post('test/json/SubmitPOS.json', $scope.pos).success(function(json) {
				if (json.status === 0) {
					$routeParams = null;
					$location.path('/postasks/');
				} else {
					alert(json.msg);
				}
				_loading.hide();
			}).error(function(data, status, headers, config) {
				alert(APP.err._SubmitPOS+status);
			});
		};


		//获取本地数据
		function getLocalData(localkey, geturl, scopekey) {
			var localvalue = null;
			if (win.localStorage) {
				localvalue = win.localStorage.getItem(localkey);
			}
			if (localvalue !== null) {
				$scope[scopekey] = JSON.parse(localvalue);
			} else {
				$http.get(geturl).success(function(json) {
					if (!(win.localStorage === undefined || win.localStorage === null)) {
						win.localStorage.setItem(localkey, JSON.stringify(json.data));
					}
					$scope[scopekey] = json.data;
				}).error(function(data, status, headers, config) {
					alert(APP.err._GetAreas+status);
				});
			}
		}
	}]);

	posTask.controller('s1FormCtrler', ['$scope', '$routeParams', '$http', '$location', '_loading', '_pageTitle', '_wxService', function($scope, $routeParams, $http, $location, _loading, _pageTitle, _wxService) {
		_loading.show();
		$scope.s1 = angular.extend({}, {
			operate: $routeParams.id === undefined ? 0 : 1
		});
		if ($scope.s1.operate === 1) { //update
			$scope.s1.status = parseInt($routeParams.status);
			if ($scope.s1.status === 0) {
				_pageTitle.set('查看S1');
			} else {
				_pageTitle.set('编辑S1');
			}
			$http.get('test/json/GetS1.json?id='+$routeParams.id).success(function(json) {
				if (json.status === 0) {
					$scope.s1 = angular.extend($scope.s1, json.data, {
						s1Id: $routeParams.id
					});
					console.log($scope.s1);
					if($scope.s1.photo===''){
						$scope.photourl = APP.phImg;
					}else{
						$scope.photourl = $scope.s1.photo;
					}
					if ($scope.s1.status === 0) {
						_pageTitle.set('查看S1');
					}
					_loading.hide();
				} else {
					alert(json.msg);
					$routeParams = null;
					$location.path('/postasks/');
				}
			}).error(function(data, status, headers, config) {
				alert(APP.err._GetS1+status);
			});
		} else { //create
			_pageTitle.set('创建S1');
			$scope.s1.posId = $routeParams.posid;
			$scope.posname = $routeParams.posname;
			$scope.photourl = APP.phImg;
			_loading.hide();
		}

		$scope.chooseImage = function() {
			_wxService.chooseOneImage(function(photo) {
				$scope.s1.photo = photo;
				$scope.photourl = photo;
				$scope.$apply();
			});
		};

		$scope.submitS1Form = function() {
			_loading.show();
			$http.post('test/json/SubmitS1.json', $scope.s1).success(function(json) {
				if (json.status === 0) {
					$routeParams = null;
					$location.path('/postasks/');
				} else {
					alert(json.msg);
				}
				_loading.hide();
			}).error(function(data, status, headers, config) {
				alert(APP.err._SubmitS1+status);
			});
		};
	}]);



	var APP = {
		err:{
			_initWXSDK: '初始化微信SDK出错：',
			_GetPOSTasks: '获取POS任务列表出错：',
			_GetPOS: '获取POS信息出错：',
			_UploadPhoto: '上传图片出错：',
			_GetD1Area: '获取D1默认地区出错：',
			_GetAreas: '获取地区列表出错：',
			_SubmitPOS: '提交POS出错：',
			_GetS1: '获取S1信息出错：',
			_SubmitS1: '提交S1出错：'
		},
		phImg: 'img/placeholder.png',
		initTimePicker: function() {
			var timepicker_opts = {
				minuteStep: 1,
				template: 'modal',
				appendWidgetTo: '.main',
				showSeconds: false,
				showMeridian: false,
				defaultTime: true
			};
			$('.timepicker-start').timepicker(timepicker_opts);
			$('.timepicker-end').timepicker(timepicker_opts);
		},
		initWXSDK: function() {
			$.get('test/json/GetAuth.json', function(json) {
				if(json.status === 0){
					var auth = json.data;
					wx.config({
						debug: false,
						appId: auth.appId,
						timestamp: auth.timestamp,
						nonceStr: auth.nonceStr,
						signature: auth.signature,
						jsApiList: [
							'hideOptionMenu',
							'chooseImage',
							'uploadImage',
							'downloadImage',
							'previewImage'
						]
					});
					wx.ready(function(){
						wx.hideOptionMenu();
						/*wx.hideMenuItems({
						    menuList: [
						    	"menuItem:share:appMessage",
						    	"menuItem:share:timeline",
						    	"menuItem:share:qq",
						    	"menuItem:share:weiboApp",
						    	"menuItem:favorite",
						    	"menuItem:share:facebook",
						    	"menuItem:share:QZone",
						    	"menuItem:copyUrl",
						    	"menuItem:originPage",
						    	"menuItem:openWithQQBrowser",
						    	"menuItem:openWithSafari"
						    ] // 要隐藏的菜单项，只能隐藏“传播类”和“保护类”按钮，所有menu项见附录3
						});*/
					});
				}else{
					alert(json.msg);
				}
				
			}).fail(function(jqXHR, textStatus, errorThrown ) {
				alert(APP.err._initWXSDK+textStatus);
			});
		}
	};


	APP.initWXSDK();

})(window, document, undefined);