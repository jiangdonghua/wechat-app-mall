const app = getApp()
import {fetch,alert} from '../../utils/util'
let countTooGetLocation = 0;
let total_micro_second = 0;
let starRun =0;
let totalSecond  = 0;
let oriMeters = 0.0;
/* 毫秒级倒计时 */
function count_down(that) {
    if (starRun === 0) {
        return;
    }
    if (countTooGetLocation >= 100) {
        let time = date_format(total_micro_second);
        that.updateTime(time);
    }
    if (countTooGetLocation >= 5000) { //1000为1s
        that.getLocation();
        countTooGetLocation = 0;
    }
    setTimeout(function(){
            countTooGetLocation += 10;
            total_micro_second += 10;
            count_down(that);
        },10)
}

// 时间格式化输出，如03:25:19 86。每10ms都会调用一次
function date_format(micro_second) {
    // 秒数
    let second = Math.floor(micro_second / 1000);
    // 小时位
    let hr = Math.floor(second / 3600);
    // 分钟位
    let min = fill_zero_prefix(Math.floor((second - hr * 3600) / 60));
    // 秒位
    let sec = fill_zero_prefix((second - hr * 3600 - min * 60));// equal to => let sec = second % 60;
    return hr + ":" + min + ":" + sec + " ";
}

//计算两坐标点之间的距离
function getDistance(lat1, lng1, lat2, lng2) {
    let radLat1 = toRadians(lat1);
    let radLat2 = toRadians(lat2);
    let deltaLat = radLat1 - radLat2;
    let deltaLng = toRadians(lng1) - toRadians(lng2);
    let dis = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(deltaLat / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(deltaLng / 2), 2)));
    return dis * 6378137;

    function toRadians(d) {  return d * Math.PI / 180;}
}

function fill_zero_prefix(num) {
    return num < 10 ? "0" + num : num
}

//****************************************************************************************

Page({
    data: {
        clock: '',
        isLocation:false,
        tgLatitude: 31.241900,
        tgLongitude: 121.446490,
        latitude: 0,
        longitude: 0,
        markers: [],
        meters: 0.00,
        time: "0:00:00"
    },

//****************************
    onLoad:function(options){
        // 页面初始化 options为页面跳转所带来的参数
        this.getTgLocation();
        count_down(this);
    },
    //****************************
    //打开当前位置
    openLocation:function (){
            wx.getLocation({
                type: 'gcj02', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
                success: function(res){
                    wx.openLocation({
                        latitude: res.latitude,
                        longitude: res.longitude,
                        scale: 18, // 缩放比例
                    })
                },
            })
    },
    //打开设定的位置
    openTgLocation: function () {
        let that = this
            wx.openLocation({
                latitude: that.data.tgLatitude,
                longitude: that.data.tgLongitude,
                scale: 18, // 缩放比例
            })
    },


//****************************
    starRun :function () {
        if (starRun === 1) {
            return;
        }
        starRun = 1;
        count_down(this);
        this.getLocation();
    },


    //****************************
    stopRun:function () {
        starRun = 0;
        count_down(this);
    },


//****************************
    updateTime:function (time) {
console.log(time)
        let data = this.data;
        data.time = time;
        this.data = data;
        this.setData ({
            time : time,
        })

    },


//****************************
    //获取并更新当前的地理位置、速度
    getLocation:function () {
        let that=this
        wx.getLocation({
            type: 'gcj02', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
            success: function(res){
                //make datas
                let newMarkers = {
                    latitude: res.latitude,
                    longitude: res.longitude,
                };
                let oriCovers = that.data.markers;

                let len = oriCovers.length;

                if (len ===0) {
                    oriCovers.push(newMarkers);
                }
                len = oriCovers.length;
                let lastCover = oriCovers[len-1];

                let newMeters = getDistance(lastCover.latitude,lastCover.longitude,res.latitude,res.longitude)/1000;

                if (newMeters < 0.0015){
                    newMeters = 0.0;
                }
                    //已走过的+未走的
                let oriMeters = oriMeters + newMeters;

                let meters =Number(newMeters);
                let showMeters = meters.toFixed(2);

                oriCovers.push(newMarkers);

                that.setData({
                    latitude: res.latitude,
                    longitude: res.longitude,
                    markers: oriCovers,
                    meters:showMeters,
                });
            },
        })
    },
//****************************
//     页面加载请求地址
    getTgLocation: function () {
        let that = this
        wx.getLocation({
            //获取当前的地理位置、速度
            type: 'gcj02', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
            success: function (res) {
                console.log("res----------")
                console.log(res)
                //make data  自己设置的坐标 标记点用于在地图上显示标记的位置
                let newMarkers = {
                    latitude: that.data.tgLatitude,
                    longitude: that.data.tgLongitude,
                    iconPath: "/images/location_red_blue.png",
                    title:"平高国际广场",
                    width:18,
                    height:25,
                    callout:{
                        content:"平高国际广场",
                        padding:10,
                        display:'BYCLICK',
                        textAlign:"center",
                        borderRadius:6,
                    },
                };
            //计算距离
                let newMeters = getDistance(newMarkers.latitude, newMarkers.longitude, res.latitude, res.longitude) / 1000;

                if (newMeters < 0.0015) {
                    newMeters = 0.0;
                }
                let showMeters = Number(newMeters).toFixed(2);

                let oriCovers = that.data.markers;
                oriCovers.push(newMarkers);
                
                that.setData({
                    latitude: that.data.tgLatitude,//res.latitude,
                    longitude: that.data.tgLongitude,//res.longitude,
                    markers: oriCovers,
                    meters: showMeters,
                });
            },
        })
    },
    openUpdate:function () {
        this.starRun()
    },
    closeUpdate:function () {
        this.stopRun()
    }

})



