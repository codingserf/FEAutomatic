(function(win,doc,unde){
	win.Util = function(){};
	Util.getUrlParam = function( name ) {
		var key = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]"),
		regexS = "[\\?&]"+key+"=([^&#]*)",
		regex = new RegExp( regexS ),
		results = regex.exec( window.location.href );
		if( results === null ){
			return "";
		}
		else{
			return results[1];
		}
	};
	Util.toAppDateString = function(date){
		var Y = date.getFullYear(),
			M = Util.toFill0String(date.getMonth()+1),
			D = Util.toFill0String(date.getDate()),
			h = Util.toFill0String(date.getHours()),
			m = Util.toFill0String(date.getMinutes()),
			s = Util.toFill0String(date.getSeconds());


		return Y+'.'+M+'.'+D+' '+h+':'+m+':'+s;
	};
	Util.toFill0String = function(number,count){
		var zeroes = '',
			counter = count || 2;
		for(var i = 0;i<counter;i++){
			zeroes += '0';
		}
		return (zeroes+number).substr(-counter);
	};
	Util.DateOperate = function(interval,number,date){
		switch (interval) {
		    case "Y": {
		        date.setFullYear(date.getFullYear() + number);
		        break;
		    }
		    case "Q": {
		        date.setMonth(date.getMonth() + number * 3);
		        break;
		    }
		    case "M": {
		        date.setMonth(date.getMonth() + number);
		        break;
		    }
		    case "W": {
		        date.setDate(date.getDate() + number * 7);
		        break;
		    }
		    case "D": {
		        date.setDate(date.getDate() + number);
		        break;
		    }
		    case "h": {
		        date.setHours(date.getHours() + number);
		        break;
		    }
		    case "m": {
		        date.setMinutes(date.getMinutes() + number);
		        break;
		    }
		    case "s": {
		        date.setSeconds(date.getSeconds() + number);
		        break;
		    }
		    default: {
		        date.setDate(date.getDate() + number);
		        break;
		    }
		}
		return date;
	};
})(window,document,undefined);