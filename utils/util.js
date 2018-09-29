// function formatTime(date) {
//   var year = date.getFullYear()
//   var month = date.getMonth() + 1
//   var day = date.getDate()
//
//   var hour = date.getHours()
//   var minute = date.getMinutes()
//   var second = date.getSeconds()
//
//
//   return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
// }
//
// function formatNumber(n) {
//   n = n.toString()
//   return n[1] ? n : '0' + n
// }
// module.exports = {
//     formatTime: formatTime
// }
import {baseUrl} from '../config'

//获取数据
export function fetch(options) {
    let data=options.data||{};
    wx.request({
        url: `${baseUrl}/${options.url}`,
        method: options.method || 'POST',
        data:Object.assign(data,{
            token: wx.getStorageSync('token')
        }),
        header: {
            'content-type': 'application/x-www-form-urlencoded'
        },
        success: res => {
            const data = res.data
            if (res.statusCode === 200) {
                options.success && options.success(data)
            } else {
                options.error && options.error(data.info)
            }
            options.complete && options.complete()
        },
        fail:res=>{
            options.success && options.success(res.data)
        }
    })
}

//无需token
export function fetchNoToken(options) {
    let data=options.data||{};
    wx.request({
        url: `${baseUrl}/${options.url}`,
        method: options.method || 'POST',
        data:data,
        header: {
            'content-type': 'application/x-www-form-urlencoded'
        },
        success: res => {
            const data = res.data
            if (res.statusCode === 200) {
                options.success && options.success(data)
            } else {
                options.error && options.error(data.info)
            }
            options.complete && options.complete()
        },
        fail:res=>{
            options.fail && options.fail(res.data)
        }
    })
}

//提示框 ​显示模态弹窗
export function alert(title, content, callback) {
    wx.showModal({
        title: title || '提示',
        content: content,
        showCancel: false,
        success: callback
    })
}

//确认框
export function confirm(options) {
    let {
        content, confirmText, cancelText, ok,
    } = options
    confirmText = confirmText || "确定"
    cancelText = cancelText || "关闭"
    wx.showModal({
        content,
        confirmText,
        cancelText,
        success(res){
            if (res.confirm) {
                ok && ok()
            }
        }
    })
}

//加载提示
export function showLoading() {
    wx.showToast({
        title: '加载中...',
        icon: 'loading',
        mask: true,
        duration: 10000

    })
}
//隐藏提示
export function hideLoading() {
    wx.hideToast()
}
//显示消息提示框
// success	显示成功图标，此时 title 文本最多显示 7 个汉字长度。默认值
// loading	显示加载图标，此时 title 文本最多显示 7 个汉字长度。
// none	不显示图标，此时 title 文本最多可显示两行
export function showToast(title,icon,duration,callback,mask,image ) {
    wx.showToast({
        title: title ||'成功',
        icon: icon||'success',
        mask:mask||false,
        image:image||'',
        duration:duration|| 2000,
        success: callback
    })
}
export function hideToast(){
    wx.hideToast()
}
//拨打电话
export function makePhoneCall(phoneNum) {
    confirm({
        content: `是否拨打电话${phoneNum}`,
        confirmText: "拨打",
        ok(){
            wx.makePhoneCall({
                phoneNumber: phoneNum //仅为示例，并非真实的电话号码
            })
        }
    })
}
//获取前一页
export function getPrevPage() {
    const pages = getCurrentPages()
    return pages[pages.length - 2]
}

//获取当前页
export function getCurrentPage() {
    const pages = getCurrentPages()
    return pages[pages.length - 1]
}

//字符串关键词分组
export function splitByKeyword(text, keyword) {
    if (!text) {
        return []
    }
    var arr = text.split(keyword)
    var res = []
    res.push({
        text: arr[0],
        isKeyword: false
    })
    for (let i = 1, len = arr.length; i < len; i++) {
        res.push({
            text: keyword,
            isKeyword: true
        }, {
            text: arr[i],
            isKeyword: false
        })
    }
    return res
}

//分享
export function share(options) {
    if(!wxshowSharemeun){
        return alert('当前微信版本过低, 无法使用该功能, 请升级到最新微信版本后重试.')
    }else{
        wx.showShareMenu(options)
    }
}