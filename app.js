//app.js
import {fetch, fetchNoToken} from './utils/util'
let starScore = require("./templates/starscore/starscore.js");
App({
    onLaunch: function () {
        let that = this;

        //  获取商城名称
        wx.request({
            url: 'https://api.it120.cc/' + that.globalData.subDomain + '/config/get-value',
            data: {
                key: 'mallName'
            },
            success: function (res) {

                if (res.data.code == 0) {
                    wx.setStorageSync('mallName', res.data.data.value);
                }
            }
        })
        wx.request({
            url: 'https://api.it120.cc/' + that.globalData.subDomain + '/score/send/rule',
            data: {
                code: 'goodReputation'
            },
            success: function (res) {
                if (res.data.code == 0) {
                    that.globalData.order_reputation_score = res.data.data[0].score;
                }
            }
        })
        wx.request({
            url: 'https://api.it120.cc/' + that.globalData.subDomain + '/config/get-value',
            data: {
                key: 'recharge_amount_min'
            },
            success: function (res) {
                // console.log(res)
                if (res.data.code == 0) {
                    that.globalData.recharge_amount_min = res.data.data.value;
                }
            }
        })
        // 获取砍价设置  这个只针对vip用户开放
        // wx.request({
        //     url: 'https://api.it120.cc/' + that.globalData.subDomain + '/shop/goods/kanjia/list',
        //     data: {},
        //     success: function (res) {
        //          console.log(res)
        //         if (res.data.code === 0) {
        //             that.globalData.kanjiaList = res.data.data.result;
        //         }
        //     }
        // })
        // 判断是否登录
        let token = wx.getStorageSync('token');
        if (!token) {
            that.goLoginPageTimeOut()
            return
        }
        wx.request({
            url: 'https://api.it120.cc/' + that.globalData.subDomain + '/user/check-token',
            data: {
                token: token
            },
            success: function (res) {
                if (res.data.code != 0) {
                    wx.removeStorageSync('token')
                    that.goLoginPageTimeOut()
                }
            }
        })

        this.getCategoryAll()
    },
    // onLoad:function () {
    //
    //     console.log(1)
    // },
    sendTempleMsg: function (orderId, trigger, template_id, form_id, page, postJsonString) {
        var that = this;
        wx.request({
            url: 'https://api.it120.cc/' + that.globalData.subDomain + '/template-msg/put',
            method: 'POST',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                token: wx.getStorageSync('token'),
                type: 0,
                module: 'order',
                business_id: orderId,
                trigger: trigger,
                template_id: template_id,
                form_id: form_id,
                url: page,
                postJsonString: postJsonString
            },
            success: (res) => {
                //console.log('*********************');
                //console.log(res.data);
                //console.log('*********************');
            }
        })
    },
    sendTempleMsgImmediately: function (template_id, form_id, page, postJsonString) {
        var that = this;
        wx.request({
            url: 'https://api.it120.cc/' + that.globalData.subDomain + '/template-msg/put',
            method: 'POST',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                token: wx.getStorageSync('token'),
                type: 0,
                module: 'immediately',
                template_id: template_id,
                form_id: form_id,
                url: page,
                postJsonString: postJsonString
            },
            success: (res) => {
                console.log(res.data);
            }
        })
    },
    goLoginPageTimeOut: function () {
        setTimeout(function () {
            wx.navigateTo({
                url: "/pages/authorize/index"
            })
        }, 1000)
    },

//商品类别无限级接口
    getCategoryAll: function () {
        let that = this
        fetchNoToken({
            url: '/shop/goods/category/all',
            success(res){
                // console.log(res)
                if (res.code === 0) {
                    let data = res.data
                    let categoriesLevelTop = []
                    let categoriesLevelSecond = []
                    let categoryId = ''
                    data.forEach((item) => {
                        if (item.level === 1) {
                            categoriesLevelTop.push(item)
                            if (item.type === "all") {
                                categoryId = item.id
                            }
                        } else if (item.level === 2) {
                            categoriesLevelSecond.push(item)
                        }
                    })
                    that.globalData.categoriesLevelTop = categoriesLevelTop
                    that.globalData.categoriesLevelSecond = categoriesLevelSecond

                    that.getGoods(categoryId) //获取全部商品
                }
            },
            fail: function () {
                that.globalData.onLoadStatus = false
                wx.hideLoading()
            }
        })
    },

    //获取指定分类下的商品
    getGoods: function (categoryId) {
        if (categoryId === 0) {
            categoryId = ''
        }
        let that = this
        fetch({
            url: "/shop/goods/list",//获取商品列表
            data: {
                categoryId: categoryId
            },
            success(res){
                // console.log(res);
                let goodsName = []; //获取全部商品名称，做为智能联想输入库
                let temp;
                let goods = []
                if (res.code === 0) {
                    res.data.forEach((item) => {
                        goodsName.push(item.name);//，名称
                        temp = item;
                        temp.starscore = (temp.numberGoodReputation / temp.numberOrders) * 5;
                        temp.starscore = Math.ceil(temp.starscore / 0.5) * 0.5;
                        temp.starpic = starScore.picStr(temp.starscore);

                        temp.minPrice = temp.minPrice.toFixed(2)
                        temp.originalPrice = temp.originalPrice.toFixed(2)
                        goods.push(temp)
                    });

                    let goodsList = []
                    that.globalData.categoriesLevelSecond.forEach(a => {
                        let {
                            id,
                            key,
                            name,
                            typeStr
                        } = a
                        let goodsTemp = [];
                        goods.forEach(list => {
                            if (list.categoryId === id) {
                                goodsTemp.push(list)
                            }
                        });
                        goodsList.push({
                            'id': id,
                            'key': key,
                            'name': name,
                            'type': typeStr,
                            'goods': goodsTemp
                        })
                    })
                    that.globalData.goods = goods
                    that.globalData.goodsName = goodsName
                    that.globalData.goodsList = goodsList
                    that.globalData.onLoadStatus = true
                    // console.log('goods:', that.globalData.goods)
                    // console.log('categoriesLevelSecond:',that.globalData.categoriesLevelSecond)
                    // console.log('goodsList:',that.globalData.goodsList)
                }
            }
        })
    },
    globalData: {
        userInfo: null,
        subDomain: "jiangdonghua",//tz//jiangdonghua tiger// 如果你的域名是： https://api.it120.cc/abcd 那么这里只要填写 abcd
        version: "2.0",
        globalBGColor: '#00afb4',
        hotGoods: ['桔', '火龙果', '香蕉', '酸奶', '甘蔗'], //自定义热门搜索商品
        goodsName: [],
        goods: [],
        categoriesLevelTop: [],
        categoriesLevelSecond: [],
        goodsList: [],
        onLoadStatus: true,
        bgRed: 0,
        bgGreen: 175,
        bgBlue: 180,
        shareProfile: '百款精品商品，总有一款适合您' // 首页转发的时候话术
    }
    /*
     根据自己需要修改下单时候的模板消息内容设置，可增加关闭订单、收货时候模板消息提醒；
     1、/pages/to-pay-order/index.js 中已添加关闭订单、商家发货后提醒消费者；
     2、/pages/order-details/index.js 中已添加用户确认收货后提供用户参与评价；评价后提醒消费者好评奖励积分已到账；
     3、请自行修改上面几处的模板消息ID，参数为您自己的变量设置即可。
     */
})
