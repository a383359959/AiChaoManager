mui.plusReady(function(){
	var index = new Vue({
		el : '#main',
		data : {
			user_id : cache('user_id'),
			name : '',
			telephone : '',
			order_list : [],
			count : [0,0],
			index_active : 0,
			picker : null
		},
		mounted : function(){
			this.init();
			this.picker = new mui.PopPicker();
			plus.runtime.getProperty(plus.runtime.appid,function(result){
			    $('.version').text('当前版本：' + result.version);
			});
		},
		methods : {
			init : function(){
				this.getUser();
				var obj = this;
				obj.loadData(obj.index_active);
				plus.push.addEventListener('click',function(result){
					obj.loadData(obj.index_active);
				},false);
				document.addEventListener('reload',function(){
					obj.loadData(obj.index_active);
				});
				plus.push.addEventListener('receive',function(result){
					obj.loadData(obj.index_active);
				},false);
				document.addEventListener('resume',function(){
					obj.loadData(obj.index_active);
				});
			},
			menu : function(type){
				if(type == 'show'){
					$('.menu_bg').show();
					$('.menu_layout').animate({'left' : '0px'},'fast');
				}else{
					$('.menu_bg').hide();
					$('.menu_layout').animate({'left' : '-60%'},'fast');
				}
			},
			login : function(){
				openWindow('login.html');
			},
			getUser : function(){
				var obj = this;
				var option = {
					user_id : this.user_id,
					field : 'name,phone,work_status'
				}
				sendAjax('User/info',option,function(result){
					obj.name = result.name;
					obj.telephone = result.phone;
					obj.loadData(0);
				});
			},
			loadData : function(status){
				this.order_list = [];
				$('.index_item a').removeClass('active');
				$('.index_item a').eq(status).addClass('active');
				var obj = this;
				var option = {
					user_id : this.user_id,
					status : status
				};
				sendAjax('Order/lists',option,function(result){
					obj.order_list = result.list;
					obj.count = result.count;
					obj.index_active = status;
					obj.$nextTick(function(){
						obj.loadTime();
					});
				});
			},
			order_detail : function(order_id){
				openWindow('orderDetail.html',{
					order_id : order_id
				});
			},
			logout : function(){
				var obj = this;
				plus.nativeUI.confirm('确认退出？',function(e){
					if(e.index == 0){
						plus.storage.removeItem('user_id');
						plus.webview.currentWebview().close();
					}
				},'提示',['是','否']);
			},
			setPicker : function(){
				var obj = this;
				var option = {
					user_id : this.user_id,
				};
				sendAjax('User/getPicker',option,function(result){
					obj.picker.setData(result);
				},'json');
			},
			paidan : function(order_id,index){
				var obj = this;
				this.setPicker();
				this.picker.show(function(items){
					var option = {
						user_id : items[0].value,
						order_id : order_id
					}
					sendAjax('Order/paidan',option,function(result){
						if(result.status == 'success'){
							obj.loadData(obj.index_active);
						}else{
							plus.nativeUI.alert(result.msg,null,'提示','是');
						}
					});
				});
			},
			gaipai : function(order_id,index){
				var obj = this;
				plus.nativeUI.confirm('确定改派？',function(e){
					obj.setPicker();
					obj.picker.show(function(items){
						var option = {
							user_id : items[0].value,
							order_id : order_id
						}
						sendAjax('Order/gaipai',option,function(result){
							if(result.status == 'success'){
								obj.loadData(obj.index_active);
							}else{
								plus.nativeUI.alert(result.msg,null,'提示','是');
							}
						});
					});
				},['是','否']);
			},
			loadTime : function(){
				var obj = this;
				$('.add_time').each(function(){
					var _this = $(this);
					var add_timer = setInterval(function(){
						obj.timing(_this);
					},500);
				});
			},
			timing : function(obj){
				var timestamp = Date.parse(new Date()) / 1000 - obj.attr('data_time');
				var days = Math.floor(timestamp / 3600 / 24);
				var hours = Math.floor((timestamp - days * 24 * 3600) / 3600);
				var mins = Math.floor((timestamp - days * 24 * 3600 - hours * 3600) / 60);
				var secs = Math.floor((timestamp - days * 24 * 3600 - hours * 3600 - mins * 60));
				if(hours < 10) hours = '0' + hours;
				if(mins < 10) mins = '0' + mins;
				if(secs < 10) secs = '0' + secs;
				obj.text(hours + ':' + mins + ':' + secs);
			}
		}
	});
});