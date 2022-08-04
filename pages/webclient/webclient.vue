<template>
<view>
  <web-view v-if="!isIOS" :src="url"></web-view>
</view>
</template>

<script>
	import Fetch from '../../utils/fetch';
	import Config from '../../config.js';
	
	export default {
		data() {
			return {
				url: "",
				isIOS: false,
			};
		},
		onLoad(option) {
			console.log("load webclient view ", option.url, decodeURIComponent(option.url));
/* 			const iframeurl = Config.Host+ "larksr-wxmp-iframe/index.html?uri=" + option.url;
			console.log("iframe url ", iframeurl);
			
			// this.url = iframeurl; */
			
			if (uni.getSystemInfoSync().platform == "ios") {
				this.isIOS = true;
				var wv = plus.webview.create("","custom-webview",{
					// plusrequire:"none", //禁止远程网页使用plus的API，有些使用mui制作的网页可能会监听plus.key，造成关闭页面混乱，可以通过这种方式禁止
				   // 'uni-app': 'none', //不加载uni-app渲染层框架，避免样式冲突
					top:uni.getSystemInfoSync().statusBarHeight+44, //放置在titleNView下方。如果还想在webview上方加个地址栏的什么的，可以继续降低TOP值
					kernel: "UIWebview",
				});
				
				wv.loadURL(option.url);
				// wv.loadURL("https://www.baidu.com");
				
				var currentWebview = this.$scope.$getAppWebview(); //此对象相当于html5plus里的plus.webview.currentWebview()。在uni-app里vue页面直接使用plus.webview.currentWebview()无效
				currentWebview.append(wv);//一定要append到当前的页面里！！！才能跟随当前页面一起做动画，一起关闭
				
			} else {
				this.isIOS = false;
				this.url = option.url;
			}	
			
			this._firstLoad = true;
		},
		onShow() {
			if (!this._firstLoad) {
				wx.navigateBack({
					delta: 0,
				})
			}
		},
		onHide() {
			console.log("on hide");
			this.url = "";
			this._firstLoad = false;
		},
		onUnload() {
			console.log("on unload");
		},
		/// lifecycle
		onShareAppMessage() {
			return {
				title: 'LarkSR',
				path: '/pages/index/index',
			}
		},
		onReady() {
			// #ifdef APP-PLUS
			// var currentWebview = this.$scope.$getAppWebview() //获取当前页面的webview对象
			// setTimeout(function() {
			// 	var wv = currentWebview.children()[0];
			// 	// wv.setStyle({scalable:true});
			// 	console.log("wv", wv);
			// }, 1000); //如果是页面初始化调用时，需要延时一下
			// // #endif
		}
	}
</script>

<style lang="scss">

</style>
