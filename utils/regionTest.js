import Config from '../config'

export default class RegionTest { 
    // {
    // preferPubOutIp: "222.128.6.137"
    // regionId: "BJ"
    // regionName: "北京"
    // serverIp: "192.168.31.17"
    // serverPort: "10002"
    // }
    // var ws = new WebSocket("wss://cloudlark.pingxingyun.com:8182/websocket/192.168.31.17/10002");
    ws;
    interval;
    checkTime = 0;
    costs = [];
    region;
    callback;
    constructor(region, callback) {
        this.onOpen = this.onOpen.bind(this);
        this.onMessage = this.onMessage.bind(this);
        this.onClose = this.onClose.bind(this);
        this.onError = this.onError.bind(this);
        this.region = region;
        this.callback = callback;
        const url = `${Config.WebSocket}/websocket/${region.serverIp}/${region.serverPort}`;
        this.ws = uni.connectSocket({
            url,
			complete: ()=> {}
        })
        this.ws.onOpen(this.onOpen);
        this.ws.onMessage(this.onMessage);
        this.ws.onClose(this.onClose);
        this.ws.onError(this.onError);
    }
    close() {
        if (this.ws) {
            this.ws.close();
        }
    }
    onOpen() {

    }
    onMessage(e) {
        if (e.data == '200') {
            // connected.
            if (this.ws) {
                var timestamp = "" + Date.now();
                this.ws.send({data: timestamp});
                this.checkTime++;
            }
        } else {
            if (this.checkTime < 3) {
                var cost = Date.now() - parseInt(e.data);
                if (cost && !isNaN(cost)) {
                    this.costs.push(cost);
                }
                setTimeout(() => {
                    if (this.ws) {
                        var timestamp = "" + Date.now();
                        this.ws.send({data: timestamp});
                        this.checkTime++;
                    }
                }, 100);
            } else {
                var total = 0;
                this.costs.forEach(element => {
                    total += element;
                });
                if (this.callback) {
                    console.log("on region test finish ", this.region);
                    this.callback(total / this.costs.length, this.region);
                    this.close();
                }
            }
        }
    }
    onClose() {

    }
    onError() {

    }
}