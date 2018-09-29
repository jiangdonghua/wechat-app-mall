//index.js
//获取应用实例
let starScore = require("../../templates/starscore/starscore.js");
let WxSearch = require('../../templates/wxSearch/wxSearch.js');
let app = getApp()
import {fetch, alert} from '../../utils/util'
Page({
    data: {
        page: 1,
        pageSize: 10000,
        keyword: '',
        loadingHidden: false, // loading
        userInfo: {},
        categories: [],
        goods: [],
        scrollTop: 0,
        loadingMoreHidden: false,
        hasNoCoupons: true,
        couponsTitlePicStr: '',
        coupons: [],
        networkStatus: true, //正常联网
        couponsStatus: 0,
        getCoupStatus: -1
    },
    onReady: function () {
        this.prompt = this.selectComponent("#prompt");
    },
//初始化
    onShow: function () {
        let that = this;
        that.setData({
            background_color: app.globalData.globalBGColor,
            bgRed: app.globalData.bgRed,
            bgGreen: app.globalData.bgGreen,
            bgBlue: app.globalData.bgBlue
        })
    },
    //
    onLoad: function () {
        let that = this
        //初始化的时候渲染wxSearchData 第二个为你的search高度
        WxSearch.init(that, 43, app.globalData.hotGoods);
        WxSearch.initMindKeys(app.globalData.goodsName);  //获取全部商品名称，做为智能联想输入库
        //获取couponsTitlePic
        that.getCouponsTitlePicStr();
        //获取优惠券
        that.getCoupons();
    },
    //  获取商城图片
    getCouponsTitlePicStr: function () {
        let that = this;
        fetch({
            url: '/config/get-value',
            data: {
                key: 'couponsTitlePicStr',
            },
            success: function (res) {
                if (res.code === 0) {
                    that.setData({
                        couponsTitlePicStr: res.data.value
                    })
                }
            }
        })
    },
    //检索可领取优惠券
    getCoupons: function () {
        let that = this;
        fetch({
            url: '/discounts/coupons',
            data: {
                type: "",
            },
            success: function (res) {
                // console.log(res)
                if (res.code === 0) {
                    that.setData({
                        hasNoCoupons: false,//取到之后置为false
                        coupons: res.data,//优惠券
                        couponsStatus: 1//加载成功
                    });
                    setTimeout(() => {
                        that.setData({
                            couponsStatus: -1
                        })
                    }, 1500)
                } else if (res.code === 700) {
                    that.setData({
                        hasNoCoupons: true,
                        coupons: res.data,
                        couponsStatus: 2//暂无优惠券可领
                    });
                    setTimeout(() => {
                        that.setData({
                            couponsStatus: -1
                        })
                    }, 1500)
                }
            },
            fail: function (res) {
                that.setData({
                    networkStatus: false//网络错误
                })
                setTimeout(() => {
                    that.setData({
                        networkStatus: true
                    })
                }, 1500)
            }

        })
    },

    //领取优惠券公共部分
    gitCouponCommon: function (pwdData) {
        let pwdData1=pwdData||{}
        console.log(pwdData1)
        let that=this
        fetch({
            url: "/discounts/fetch",
            data:Object.assign(pwdData1,{
                id: that.data.id,
                detect: "",
            }),

            success: function (res) {
                console.log(res);
                if (res.code === 20000) {
                    that.setData({
                        getCoupStatus: 5
                    })
                    setTimeout(() => {
                        that.setData({
                            getCoupStatus: -1
                        })
                    }, 1500)
                    return;
                }
                if (res.code === 20001 || res.code === 20002) {
                    that.setData({
                        getCoupStatus: 0
                    })
                    setTimeout(() => {
                        that.setData({
                            getCoupStatus: -1
                        })
                    }, 1500)
                    return;
                }
                if (res.code === 20003) {
                    that.setData({
                        getCoupStatus: 2
                    })
                    setTimeout(() => {
                        that.setData({
                            getCoupStatus: -1
                        })
                    }, 1500);
                    return;
                }
                if (res.code === 20004) {
                    that.setData({
                        getCoupStatus: 6
                    })
                    setTimeout(() => {
                        that.setData({
                            getCoupStatus: -1
                        })
                    }, 1500);
                    return;
                }
                if (res.code === 30001) {
                    that.setData({
                        getCoupStatus: 3
                    })
                    setTimeout(() => {
                        that.setData({
                            getCoupStatus: -1
                        })
                    }, 1500)
                    return;
                }
                if (res.code === 20004) {
                    that.setData({
                        getCoupStatus: 4
                    })
                    that.cancel()
                    setTimeout(() => {
                        that.setData({
                            getCoupStatus: -1
                        })
                    }, 1500)
                    return;
                }
                if (res.code === 0) {
                    that.cancel();
                    that.setData({
                        getCoupStatus: 1
                    })
                    setTimeout(() => {
                        that.setData({
                            getCoupStatus: -1
                        })
                    }, 1500)
                } else if (res.code === 600) {
                    alert('权限不足', '您当前尚未登陆，是否前往登陆', function (res) {
                        if (res.confirm) {
                            wx.navigateTo({
                                url: '/pages/authorize/index',
                            })
                        } else if (res.cancel) {
                            console.log('用户点击取消授权登陆')
                        }
                    })
                } else {
                    alert('错误', res.code + res.msg);
                }
            }
        })
    },
    //领取优惠券 判断是否是口令红包
    gitCoupon: function (e) {
        let that = this;
        let type = e.currentTarget.dataset.type;
        let id=e.currentTarget.dataset.id
        this.setData({
            type:type,
            id:id
        });
        if (type === "口令红包") {
            this.showPrompt();
            if(!that.data.pwd){
                return
            }
        }
        this.gitCouponCommon()
    },

    /*口令红包输入框start*/

    showPrompt: function () {
        this.setData({
            pwd:''
        })
        this.prompt.showPrompt();
    },
    //将输入的value保存起来
    getInput: function (e) {
        this.setData({
            HbValue: e.detail.value
        })
    },
    confirm: function (e) {
        let that=this
        let _cost = that.data.HbValue;
        if (_cost === ''||typeof _cost==='undefined') {
            alert('tips','请输入口令~');
            return;
        }
        else {
            this.setData({
                pwd:_cost
            })
            this.pwdData={
                pwd:_cost
            };
            this.gitCouponCommon(this.pwdData)
        }
    },
    cancel: function () {
        this.prompt.hidePrompt();
    },

    /*口令红包输入框end*/

    //事件处理函数
    toDetailsTap: function (e) {
        wx.navigateTo({
            url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
        })
    },

    //输入完成进入搜索完成页
    toSearch: function () {
        wx.navigateTo({
            url: '/pages/search/index?keyword=' + this.data.keyword
        })
    },
    //获得商品列表
    getGoodsList: function (categoryId) {
        if (categoryId === 0) {
            categoryId = "";
        }
        console.log(categoryId)
        let that = this;
        wx.request({
            url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/list',
            data: {
                page: that.data.page,
                pageSize: that.data.pageSize,
                categoryId: categoryId
            },
            success: function (res) {
                that.setData({
                    goods: [],
                    loadingMoreHidden: true
                });
                let goods = [];
                if (res.data.code !== 0 || res.data.data.length === 0) {
                    that.setData({
                        loadingMoreHidden: false,
                        prePageBtn: false,
                        nextPageBtn: true,
                        toBottom: true
                    });
                    return;
                }
                for (let i = 0; i < res.data.data.length; i++) {
                    goods.push(res.data.data[i]);
                }


                console.log('getGoodsList----------------------')
                console.log(goods)


                for (let i = 0; i < goods.length; i++) {
                    goods[i].starScore = (goods[i].numberGoodReputation / goods[i].numberOrders) * 5
                    goods[i].starScore = Math.ceil(goods[i].starScore / 0.5) * 0.5
                    goods[i].starpic = starScore.picStr(goods[i].starScore)
                }
                console.log('getGoodsReputation----------------------')
                console.log(goods)

            }
        })
    },


    //搜索部分//
    // 键盘点击搜索回调函数
    wxSearchFn: function () {
        let that = this;
        that.toSearch();
        //加入搜索历史
        WxSearch.wxSearchAddHisKey(that);
    },
//监控键盘输入
    wxSearchInput: function (e) {
        let that = this
        WxSearch.wxSearchInput(e, that);
        that.setData({
            keyword: e.detail.value
        })
    },
    //focus
    wxSearchFocus: function (e) {
        let that = this
        WxSearch.wxSearchFocus(e, that);
    },
    //blur
    wxSearchBlur: function (e) {
        let that = this
        WxSearch.wxSearchBlur(e, that);
    },
    //搜索联想出的商品点击
    wxSearchKeyTap: function (e) {
        let that = this
        WxSearch.wxSearchKeyTap(e, that);
        that.setData({
            keyword: that.data.wxSearchData.value
        })
    },
    //删除关键词
    wxSearchDeleteKey: function (e) {
        let that = this
        WxSearch.wxSearchDeleteKey(e, that);
    },
    //删除全部关键词
    wxSearchDeleteAll: function () {
        let that = this;
        WxSearch.wxSearchDeleteAll(that);
    },
    wxSearchTap: function () {
        let that = this
        WxSearch.wxSearchHiddenPancel(that);
    },

    onPullDownRefresh: function () {
        let that = this
        wx.showNavigationBarLoading()
        that.onLoad()
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
    },
    onShareAppMessage: function () {
        return {
            title: wx.getStorageSync('mallName') + '——' + app.globalData.shareProfile,
            path: '/pages/finder/index',
            success: function (res) {
                // 转发成功
            },
            fail: function (res) {
                // 转发失败
            }
        }
    },
})
