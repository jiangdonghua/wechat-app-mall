/**
 * 小程序配置文件
 */
let host = "https://api.it120.cc/";
let subDomain="jiangdonghua";
const debug = wx.getStorageSync('debug')
if (debug) {
    host = "https://api.it120.cc/"
}
const baseUrl=host+subDomain
module.exports = {
    host,
    subDomain,
    baseUrl
// qqmapKey: 'FPOBZ-UT2K2-ZFYUC-CX67E-IOOYS-7XFQ6'
};