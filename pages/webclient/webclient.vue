<template>
<view class="container">
  <web-view :src="url"></web-view>
</view>
</template>

<script>
	import Fetch from '../../utils/fetch';
	import Config from '../../config.js';
	export default {
		data() {
			return {
				url: "",
			};
		},
		onLoad(option) {
			console.log("load webclient view ", option.url, decodeURIComponent(option.url));
/* 			const iframeurl = Config.Host+ "larksr-wxmp-iframe/index.html?uri=" + option.url;
			console.log("iframe url ", iframeurl);
			
			// this.url = iframeurl; */
			this.url = option.url;
			
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
	}
</script>

<style lang="scss">

</style>
