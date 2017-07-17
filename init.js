var Lock = {
	//bug1 : 直线绘画时会将扫过的地方覆盖。
	//bug2 : 每次打开网页都会重置localStorage.defaultPoint
	CW:0, //九格的宽
	CH:0, //九格的高
	R:0,  //点半径
	Row:3,
	Col:3,
	pointLocation:[],//保存初始点位置
	defaultPoint:[], //默认密码
	linePoint:[], //临时数组
	linePoint1:[],  //临时数组
	type:0, //判断set or get 
	S:0, //设置密码时，取两次密码对比的重要变量
	initData:function(){
		//console.log(JSON.parse(localStorage.defaultPoint));
		this.defaultPoint = JSON.parse(localStorage.defaultPoint);
		var c = document.getElementById("canvas");
		this.CW = document.body.offsetWidth > 360?360:document.body.offsetWidth;
		this.CH = this.CW;
		//alert(this.CW);
		c.width = this.CW;
		c.height = this.CH;
		this.R = this.CW/10.0;
		//alert(this.R);
		var cxt = c.getContext("2d");
		pointLocation = this.initLocation();
		// console.log(pointLocation.length);
		// for (var i = 0; i < pointLocation.length; i++) {
		// 	console.log(pointLocation[i]);
		// }
		this.draw(cxt, this.pointLocation, [], null);

		var select = document.getElementsByName("select");
		if(select[0].checked == true){//设置
			this.type = 1;
		}
		else if(select[1].checked == true){//验证
			this.type = 0;
		}
		this.init(c,cxt,this.linePoint,this.type);
	},

	initLocation:function(){
		var r = this.R;
		//console.log(this.Row+"  "+this.Col);
		for (var i = 0; i < this.Row; i++) {
			for (var j = 0; j < this.Col; j++) {
				var point = {
					X : (r+(j*2+1)*r+j*r),
					Y : (r+(i*2+1)*r+i*r)
				};
				this.pointLocation.push(point);
			}
		}
		return this.pointLocation;
	},

	init:function(c,cxt,linePoint,type){
		var tips = document.getElementById("tips");
		c.addEventListener("touchstart",function(e){
			Lock.isPointSelect(e.touches[0],linePoint);
			// var pagey = e.touches[0].pageY-80;
			// console.log(pagey);
		},false);
		c.addEventListener("touchmove",function(e){
			e.preventDefault(); //取消默认 
			Lock.isPointSelect(e.touches[0],linePoint);
			//cxt.clearRect(0,0,this.CW,this.CH);
			Lock.draw(cxt,pointLocation,linePoint,{X:e.touches[0].pageX,Y:e.touches[0].pageY})
			//console.log(e.touches[0].pageY);
			//console.log(e.touches[0].pageX);
		},false);
		c.addEventListener("touchend",function(e){
			cxt.clearRect(0,0,this.CW,this.CH);
			Lock.draw(cxt,pointLocation,linePoint,null);
			if(linePoint.length<5){  
                    //console.log('至少需要4个链接点！');
                    tips.innerHTML = "密码太短，至少需要5个点";      
                    setTimeout(function(){
                    	tips.innerHTML = "请输入手势密码"; 
                        Lock.refreshRect(cxt);  //延迟1秒清空
                    },500);  
            }else{
            	// console.log(linePoint.length);
			 //    for (var i = 0; i < linePoint.length; i++) {
				// 	console.log(linePoint[i]);
				// }
                //console.log(linePoint.join("->")); 
                if(type == 0){ //验证密码
                	// console.log(linePoint);
                	// console.log(Lock.defaultPoint);
                	var k = 0;
	                if (linePoint.length == Lock.defaultPoint.length) {
	                	for(var i=0;i<Lock.defaultPoint.length;i++){
	                		if(Lock.defaultPoint[i] == linePoint[i]){
	                			k++;
	                			continue;
	                		}
	                		tips.innerHTML = "输入的密码不正确" ;
	                		break;
	                	}
	                	if (k==Lock.defaultPoint.length) {
	                		tips.innerHTML = "密码正确" ;
	                	}
	                }
	                else{
	                	tips.innerHTML = "输入的密码不正确" ;
	                }                	
                }
                else{//设置密码 
                	
                	//console.log(linePoint);
                	if(Lock.S==0){
                		linePoint1 = linePoint;
                		tips.innerHTML = "请再次输入手势密码";
                		Lock.S = 1;             		
                	}
                	else{
                		var k = 0;
                		//console.log(linePoint1);
                		//console.log(linePoint);
		                if (linePoint.length == linePoint1.length) {
		                	for(var i=0;i<linePoint1.length;i++){
		                		if(linePoint1[i] == linePoint[i]){
		                			k++;
		                			continue;
		                		}
		                		tips.innerHTML = "两次密码输入不一致";
		                		break;
		                	}
		                	if (k==linePoint1.length) {
		                		//console.log(Lock.defaultPoint);
		                		tips.innerHTML = "密码设置成功";
		                		var updatePoint = linePoint;
		                		var str = JSON.stringify(updatePoint);
		                		localStorage.defaultPoint = str;
		                		//Lock.defaultPoint = linePoint;
		                		//console.log(Lock.defaultPoint);
		                	}
		                }
		                else{
		                	tips.innerHTML = "两次密码输入不一致";
		                }                 		
                		Lock.S = 0;
                	}
                	

                }

                Lock.refreshRect(cxt);  
            }  
            linePoint = [];	
		},false);
	},

	isPointSelect:function(touches,linePoint){//判断触摸点是否在点内
		for (var i = 0; i < pointLocation.length; i++) {
			var currPoint = pointLocation[i];
			var x = Math.abs(currPoint.X - touches.pageX);
			// console.log(currPoint.Y);
			// console.log(currPoint.X);
			// console.log(touches.pageX);
			// console.log(touches.pageY);
			var y = Math.abs(currPoint.Y - (touches.pageY-80));
			var d = Math.sqrt(x*x+y*y);
			if( d <= this.R){//将编号存入结果数组 触摸点在哪个圆内存放对应编号
				if (linePoint.indexOf(i)<0) {linePoint.push(i);}
				break;
			}
		}
	},

	draw:function(cxt,pointLocation,linePoint,touchPoint){
		for (var i = 0; i < pointLocation.length; i++) {  
            var Point = pointLocation[i];  
            cxt.fillStyle = "#c0bbb5";  
            cxt.beginPath();  
            cxt.arc(Point.X, Point.Y, this.R, 0, Math.PI * 2, true);  //外层圆
            cxt.closePath();  
            cxt.fill();  
            cxt.fillStyle = "#ffffff";  
            cxt.beginPath();  
            cxt.arc(Point.X, Point.Y, this.R-4 , 0, Math.PI * 2, true);  //内层空心圆，数值相当于边框
            cxt.closePath();  
            cxt.fill();  
            if(linePoint.indexOf(i)>=0)  //如果该点被选中则变色
            {  
                cxt.fillStyle = "#ffa104";  
                cxt.beginPath();  
                cxt.arc(Point.X, Point.Y, this.R, 0, Math.PI * 2, true);  
                cxt.closePath();  
                cxt.fill();  
            }  
        }  
		if(linePoint.length>0){
			cxt.beginPath();
			for (var i = 0; i < linePoint.length; i++) {
				var pointIndex = linePoint[i]; //对应圆的编号位置
				cxt.lineTo(pointLocation[pointIndex].X,pointLocation[pointIndex].Y);
			}
			cxt.lineWidth = 2;
			cxt.strokeStyle = "#f80000";
			cxt.stroke();
			cxt.closePath();
			if(touchPoint!=null){//移动过程中 
				var lastPointIndex = linePoint[linePoint.length-1];
				var lastPoint = pointLocation[lastPointIndex];
				cxt.beginPath();
				cxt.moveTo(lastPoint.X,lastPoint.Y);
				cxt.lineTo(touchPoint.X,touchPoint.Y-80);
				//console.log(touchPoint.X);
				cxt.stroke();
				cxt.closePath();
			}
		}

	},

	refreshRect:function(cxt){//清空
		cxt.clearRect(0,0,this.CW,this.CH);
		Lock.draw(cxt,pointLocation,[],{});
	},
}

window.onload = function(){
	var defaultPoint = [4,3,2,6,8];
	var str = JSON.stringify(defaultPoint);
	//console.log(defaultPoint);
	localStorage.defaultPoint = str;
	//console.log(localStorage.getItem("defaultPoint"));
	Lock.initData();
	//console.log(Lock.defaultPoint);
	// for (var i = 0; i < pointLocation.length; i++) {
	// 	console.log(Lock.pointLocation[i]);
	// }

}
