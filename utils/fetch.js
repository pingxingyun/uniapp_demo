import Config from '../config.js';

const DefaultHeader = {
    "Content-Type": "application/json"
}

const CODE_SUCCESS = 1000;

class Fetch {
    /**
     * get data
     * @api string api base without host.
     * @data object data
     * @header object header
     */
    Get(api, data, header = {}) {
        return new Promise((resolve, reject) => {
            uni.request({
                url: Config.Host + api,
                data: data,
                method: "GET",
                header: addHeader(header),
                success: (res) => {
                    if (res.data.code === CODE_SUCCESS) {
                        resolve(res.data.result);
                    } else {
                        reject(res.data)
                    }
                },
                fail: (err) => {
                    reject(err);
                }
            });
        });
    }
    /**
     * post data
     * @api string api base without host.
     * @data object data
     * @header object header
     */
    Post(api, data, header) {
        const requUrl = Config.Host + api;
        return new Promise((resolve, reject) => {
            uni.request({
                url: requUrl,
                data: data,
                method: "POST",
                header: addHeader(header),
                success: (res) => {
                    if (res.statusCode == 200) {
                        const data = res.data;
                        if (data) {
                            if (data.code == 0) {
                                resolve(data);
                            } else {
                                console.warn("请求" + requUrl + "返回 code 不为 0.", data);
                                reject(data);
                            }
                        } else {
                            reject("返回数据为空" + data);
                        }
                    } else {
                        console.warn("请求" + requUrl + "失败.", res.statusCode);
                    }
                },
                fail: (err) => {
                    console.warn("请求" + requUrl + "失败.", err);
                    reject(err);
                }
            });
        });
    }
    ToWebClientUrl(params) {
        return encodeURIComponent(Config.Host + "webclient?" + joinParam(params));
    }

}

function joinParam(params) {
    var res = '';
    for (const i in params) {
        if (i) {
            res += i + '=' + params[i] + '&';
        }
    }
    return res;
}

function addHeader(header) {
    let res = DefaultHeader;
    for (let i in header) {
        res[i] = header[i]
    }
    return res
}

const FetchInstance = new Fetch();
export default FetchInstance;