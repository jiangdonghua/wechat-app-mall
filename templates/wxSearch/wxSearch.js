// 定义数据格式

/***
 *
 * "wxSearchData":{
 *  configconfig:{
 *    style: "wxSearchNormal"
 *  },
 *  view:{
 *    hidden: true,
 *    searchbarHeght: 20
 *  }
 *  keys:[],//自定义热门搜索
 *  his:[]//历史搜索关键字
 *  value
 * }
 *
 *
 */


let __keysColor = [];

let __mindKeys = [];

//初始化颜色
function initColors(colors) {
    __keysColor = colors;
}

//关键词
function initMindKeys(keys) {
    __mindKeys = keys;
}
//初始化搜索展示
function init(that, barHeight, keys, isShowKey, isShowHis, callBack) {
    let temData = {};
    let view = {
        barHeight: barHeight,//搜索栏高度
        isShow: false//是否显示
    }
//显示关键词
    if (typeof (isShowKey) === 'undefined') {
        view.isShowSearchKey = true;
    } else {
        view.isShowSearchKey = isShowKey;
    }
//显示历史搜索
    if (typeof (isShowHis) === 'undefined') {
        view.isShowSearchHistory = true;
    } else {
        view.isShowSearchHistory = isShowHis;
    }
    temData.keys = keys;
    wx.getSystemInfo({//获取系统信息
        success: function (res) {
            // SDKVersion:"2.1.0"
            // batteryLevel:96
            // benchmarkLevel:1
            // brand:"devtools"
            // errMsg:"getSystemInfo:ok"
            // fontSizeSetting:16
            // language:"zh_CN"
            // model:"iPhone 6"
            // pixelRatio:2
            // platform:"devtools"
            // screenHeight:667
            // screenWidth:375
            // statusBarHeight:20
            // system:"iOS 10.0.1"
            // version:"6.6.3"
            // windowHeight:555
            // windowWidth:375
            let wHeight = res.windowHeight;//可使用窗口宽度
            view.searchHeight = wHeight - barHeight;
            temData.view = view;
            that.setData({
                wxSearchData: temData
            });
        }
    })

    if (typeof (callBack) === "function") {
        callBack();
    }
//获取历史记录
    getHisKeys(that);
}

//搜索触发事件
function wxSearchInput(e, that, callBack) {
    let temData = that.data.wxSearchData;
    let text = e.detail.value;
    let mindKeys = [];//所有商品的名称集合
    if (typeof (text) === "undefined" || text.length === 0||text==="") {
        temData.value = text;
        temData.mindKeys =[];
        that.setData({
            wxSearchData: temData
        });
         return;
    }
    else {
        for (let i = 0; i < __mindKeys.length; i++) {
            let mindKey = __mindKeys[i];
            if (mindKey.indexOf(text) > -1) {
                mindKeys.push(mindKey);
            }
        }

        if (mindKeys.length === 0) {
            for (let i = 0; i < __mindKeys.length; i++) {
                let mindKey = __mindKeys[i];
                let anyIn = 0
                for (let j = 0; j < text.length; j++) {
                    if (text[j] === " ") {
                        temData.value = '';
                    }
                    else if (mindKey.indexOf(text[j]) > -1) {
                        anyIn = 1;
                        mindKeys.push(mindKey);
                        break;
                    }
                }
            }
        }
        temData.value = text;
        temData.mindKeys = mindKeys;
        that.setData({
            wxSearchData: temData
        });
    }
}
//获得焦点触发事件
function wxSearchFocus(e, that, callBack) {
    let temData = that.data.wxSearchData;
    temData.view.isShow = true;
    that.setData({
        wxSearchData: temData
    });
    //回调
    if (typeof (callBack) === "function") {
        callBack();
    }
    // if(typeof(temData) != "undefined"){
    //   temData.view.hidden= false;
    //   that.setData({
    //     wxSearchData:temData
    //   });
    // }else{

    // }
}
//失去焦点触发事件
function wxSearchBlur(e, that, callBack) {
    let temData = that.data.wxSearchData;
    temData.value = e.detail.value;
    that.setData({
        wxSearchData: temData
    });
    if (typeof (callBack) === "function") {
        callBack();
    }
}
//隐藏搜索面板
function wxSearchHiddenPancel(that) {
    let temData = that.data.wxSearchData;
    temData.view.isShow = false;
    that.setData({
        wxSearchData: temData
    });
}
//点击联想词填充进input
function wxSearchKeyTap(e, that, callBack) {
    //回调
    let temData = that.data.wxSearchData;
    temData.value = e.target.dataset.key;
    that.setData({
        wxSearchData: temData
    });
    if (typeof (callBack) === "function") {
        callBack();
    }
}

//获取历史记录
function getHisKeys(that) {
    let value = [];
    try {
        value = wx.getStorageSync('wxSearchHisKeys');

        if (value) {
            // Do something with return value
            let temData = that.data.wxSearchData;
            temData.his = value;
            that.setData({
                wxSearchData: temData
            });
        }
    } catch (e) {
        // Do something when catch error
    }

}

//加入搜索历史
function wxSearchAddHisKey(that) {
    wxSearchHiddenPancel(that);
    let text = that.data.wxSearchData.value;
    if (typeof (text) === "undefined" || text.length === 0) {
        return;
    }
    let value = wx.getStorageSync('wxSearchHisKeys');
    if (value) {
        if (value.indexOf(text) < 0) {
            value.unshift(text);
        }
        wx.setStorage({
            key: "wxSearchHisKeys",
            data: value,
            success: function () {
                getHisKeys(that);
            }
        })
    } else {
        value = [];
        value.push(text);
        wx.setStorage({
            key: "wxSearchHisKeys",
            data: value,
            success: function () {
                getHisKeys(that);
            }
        })
    }


}

//删除指定搜索
function wxSearchDeleteKey(e, that) {
    let text = e.target.dataset.key;
    let value = wx.getStorageSync('wxSearchHisKeys');
    value.splice(value.indexOf(text), 1);
    wx.setStorage({
        key: "wxSearchHisKeys",
        data: value,
        success: function () {
            getHisKeys(that);
        }
    })
}

//删除全部搜索
function wxSearchDeleteAll(that) {
    wx.removeStorage({
        key: 'wxSearchHisKeys',
        success: function (res) {
            let value = [];
            let temData = that.data.wxSearchData;
            temData.his = value;
            that.setData({
                wxSearchData: temData
            });
        }
    })
}


module.exports = {
    init: init,
    initColor: initColors,
    initMindKeys: initMindKeys,
    wxSearchInput: wxSearchInput,
    wxSearchFocus: wxSearchFocus,
    wxSearchBlur: wxSearchBlur,
    wxSearchKeyTap: wxSearchKeyTap,
    wxSearchAddHisKey: wxSearchAddHisKey,
    wxSearchDeleteKey: wxSearchDeleteKey,
    wxSearchDeleteAll: wxSearchDeleteAll,
    wxSearchHiddenPancel: wxSearchHiddenPancel
}