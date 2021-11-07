<template>
<view class="container">
   <scroll-view refresher-enabled="true" 
        @refresherrefresh="onFresh" 
        :refresher-triggered="triggered"
        @scrolltolower="onNextPage"
        scroll-y="true"
        lower-threshold="100"
        :style="{ height: height + 'px' }"
    >
        <image src="../../static/WX20210807-233343@2x.png" style="width: 100%;height: 320rpx;vertical-align: middle;" />
        <view class="region">
           <view class="region-button selected-region" v-if="region.regionId" @tap="onToggleRegionList">
                <text>当前节点 {{region.regionName}} </text>
                <view class="region-toggle-button">
                    <text>更多节点</text>
                    <image src="../../static/arrow-down.png"></image>
                </view>
            </view>
            <view class="region-button" v-else>未选择区域</view>
			<view :class="regionClass">
				<view class="region-button"
					 v-for="(item,index) in regionList" :key="index"
					 :data-index="index"
					 @tap="onChangeRegion"
				 >
					 {{item.regionName}}
				 </view>	
			</view>
        </view>
        <view>
            <view class="appli-item" v-for="(item,index) in list" :key="index" @tap="onEnterAppli" :data-appid="item.appliId">
				<view class="appli-info">
					<image v-if="item.picUrl"
					    :src="item.picUrl"
					    style="margin-right: 16px;vertical-align: middle; width: 200rpx; height: 112.5rpx;" />
					<image v-else
					    src="https://cloudlark.pingxingyun.com:8180/static//images/default-pic.png"
					    style="margin-right: 16px;vertical-align: middle; width: 200rpx; height: 112.5rpx;">
					</image>
					<view>
						{{item.appliName}}
					</view>
				</view>
				<image src="../../static/arrow-right.png" class='icon-right'>
				</image>
            </view>
        </view>
    </scroll-view>
</view>
</template>

<script>
	import Fetch from '../../utils/fetch'
	import RegionTest from '../../utils/regionTest'
	
	export default {
		data() {
			return {
				triggered: false,
				list: [],
				height: uni.getSystemInfoSync().windowHeight,
				nextPage: 1,
				hasNextPage: false,
				pageNum: 1,
				regionList: [],
				region: {
					delay: 9999,
					regionId: '',
					regionName: '',
				},
				showRegionList: false,
			}
		},
		computed: {
			regionClass() {
				return this.showRegionList ? "region-list show-region-list" : "region-list";
			}
		},
		methods: {
			// 事件处理函数
			bindViewTap() {
				uni.navigateTo({
					url: '../logs/logs'
				})
			},
			async onFresh() {
				if (this._freshing) return;
				this._freshing = true;
				this.triggered = true;
			
				try {
					this.freshList()
					uni.showToast({
						icon: 'none',
						title: '刷新完成～',
					})
				} catch (e) {
					console.warn(e);
				}
				
				this.triggered = false;
				this._freshing = false;
			},
			async onNextPage() {
				if (this._freshing) return;
				if (!this.hasNextPage) {
					uni.showToast({
						icon: 'none',
						title: '已经到最后啦～',
					})
					return;
				}
				this._freshing = true;
				try {
					this.freshList(this.nextPage, false);
				} catch (e) {
					console.warn(e);
				}
				this._freshing = false;
				console.log("on next page");
			},
			freshList(page = 1, clearOld = true) {
				return new Promise((resolve, reject) => {
					Fetch.Get("getAppliList?page=1&pageSize=12", {
						pageSize: 12,
						page,
					}).
					then((res) => {
							console.log("fetch list success ", res);
							let resPageInfo = {
								current: parseInt(res.current),
								pages: parseInt(res.pages)
							}
							let pageInfo = {
								hasNextPage: resPageInfo.current < resPageInfo.pages,
								nextPage: resPageInfo.current < resPageInfo.pages ? resPageInfo.current + 1 : resPageInfo.current,
								pageNum: resPageInfo.current,
							};
							// console.log("page info ", resPageInfo, pageInfo);
							if (clearOld) {
								this.hasNextPage = pageInfo.hasNextPage;
								this.nextPage = pageInfo.nextPage;
								this.pageNum = pageInfo.pageNum;
								this.list = res.records;
							} else {
								this.hasNextPage = pageInfo.hasNextPage;
								this.nextPage = pageInfo.nextPage;
								this.pageNum = pageInfo.pageNum;
								this.list = this.list.concat(res.records);
							}
							resolve();
						})
						.catch((e) => {
							console.warn("fetch list failed ", e);
							reject();
						});
				})
			},
			freshRegionList() {
				// var ws = new WebSocket("wss://cloudlark.pingxingyun.com:8182/websocket/192.168.31.17/10002");
				Fetch.Get("renderServer/regionList")
				.then((res) => {
					console.log("region list ", res, res.length);
					uni.showToast({
					  icon: 'none',
					  title: '选择与您最近的节点体验更佳',
					  duration: 3000,
					})
					this.regionList = res;
					
					for (var region of res) {
						console.log('region res', region, RegionTest);
						var regionTest = new RegionTest(region, (time, testResRegion) => {
							console.log("test region success", time, testResRegion);
							var list = this.regionList;
							for (var i = 0; i < list.length; i++) {
								if (list[i].regionId == testResRegion.regionId) {
									list[i].delay = time;
									testResRegion.delay = time;
									break;
								}
							}
							if (time < this.region.delay) {
								this.region = testResRegion;
								this.regionList = list;
							} else {
								this.regionList = list;
							}
						})
					}
				})
				.catch((e) => {
				});
			},
			onEnterAppli(event) {
				// regionId: BJ
				const appliId = event.currentTarget.dataset.appid;
				console.log("on enter appli", appliId, this.region);
				Fetch.Get("appli/getStartInfo", {
						appliId,
						codeRate: 8000,
						frameRate: 60,
						regionId: this.region.regionId,
					})
					.then((res) => {
						console.log("res ", res);
						uni.navigateTo({
							url: '../webclient/webclient?url=' + Fetch.ToWebClientUrl(res),
						})
					})
					.catch((e) => {
						uni.showToast({
						 icon: 'error',
						  title: JSON.stringify(e),
						})
						console.log("on enter appli failed ", e);
					});
			},
			onToggleRegionList() {
				this.showRegionList = !this.showRegionList;
				console.log('on toggle region list', this.showRegionList, this.regionClass);
			},
			onChangeRegion(event) {
				// regionId: BJ
				const index = event.currentTarget.dataset.index;
				this.region = this.regionList[index];
				this.showRegionList = !this.showRegionList;
			},
		},
		onLoad() {
			this.freshRegionList();
		},
		/// lifecycle
		onShareAppMessage() {
			return {
				title: 'LarkSR',
				path: '/pages/index/index',
			}
		},
		onShareTimeline() {
			return {
				title: 'LarkSR',
				path: '/pages/index/index',
			}
		},
		onShow() {
			console.log('on show');
			this.freshList();
		},
		onHide() {
			console.log("on hide");
			this.list = [];
		},
		onUnload() {
			console.log("on unload");
		}
	}
</script>

<style>
	page {
	  height: 100%;
	}

	.region {
	  padding: 10rpx 35rpx;
	}
	.region-button {
	  padding: 10rpx 0;
	  border-bottom: 1px solid #d3d3d3;
	}
	.region-list {
	  /* display: none; */
	  /* height: 0; */
	  transition: all 0.5s linear 0s;
	  max-height: 0;
	  overflow: hidden;
	}
	.selected-region {
	  display: flex;
	  flex-direction: row;
	  align-items: center;
	  justify-content: space-between;
	}
	.selected-region image {
	  width: 50rpx;
	  height: 50rpx;
	}
	.region-toggle-button {
	  display: flex;
	  flex-direction: row;
	  align-items: center;
	}
	.region-list.region-button {
	  border: none;
	  padding: 0;
	}
	.region-list.show-region-list {
	  /* display:initial; */
	  /* height: auto; */
	  max-height: 120rpx;
	}

	.region-list.show-region-list.region-button {
	  border-bottom: 1rpx solid #ddd;
	  padding: 10rpx;
	}
	
	.appli-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10rpx 35rpx;
		border-bottom: 1rpx solid #c0c0c0;
	}
	.appli-item .appli-info {
		display: flex;
		align-items: center;
	}
	.appli-item .icon-right {
		width: 40rpx;
		height: 50rpx;
	}
</style>
