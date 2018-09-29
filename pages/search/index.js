// index.js
let starscore = require("../../templates/starscore/starscore.js");
let WxSearch = require('../../templates/wxSearch/wxSearch.js');
import {fetchNoToken} from '../../utils/util'
let app = getApp();
Page({
    data: {
        scrollTop: 0,
        searchInput: '',
        keyword: '',
        pageNum: 1,
        pageSize: 1000,
        load_statue: true,
        goods: [],
        goodsNum: 0,
        loadingHidden: false,
    },
    onLoad: function (options) {
        let that = this;
        console.log('key', options)
        //初始化的时候渲染wxSearchdata 第二个为你的search高度
        WxSearch.init(that, 43, app.globalData.hotGoods);
        WxSearch.initMindKeys(app.globalData.goodsName);
        this.setData({
            keyword: options.keyword
        });
        this.refreshGoodsList();
    },
    listenerSearchInput: function (e) {
        this.setData({
            searchInput: e.detail.value
        })
    },
    loadSearchContent: function (keyword, pageNum, pageSize) {
        wx.showLoading({
            title: '加载中',
        });
        let that = this;
        fetchNoToken({
            url: "/shop/goods/list",
            data: {
                page: pageNum,
                pageSize: pageSize,
                nameLike: keyword,
            },
            success: function (res) {
                console.log('list', res)
                that.setData({
                    load_statue: true
                })

                let goods = that.data.goods;
                if (res.data !== null) {
                    for (let i = 0; i < res.data.length; i++) {
                        goods.push(res.data[i])
                    }
                    console.log('goods', goods);
                    let page = 1;
                    let pageSize = that.data.pageSize;
                    for (let i = 0; i < goods.length; i++) {
                        fetchNoToken({
                            url: '/shop/goods/reputation',//获取商品评价数据
                            data: {
                                goodsId: goods[i].id,
                                page: page,
                                pageSize: pageSize
                            },
                            success: function (res) {
                                // console.log('reputation',res)
                                function star(numberReputation) {
                                    goods[i].numberReputation = numberReputation;
                                    goods[i].starscore = (goods[i].numberGoodReputation / goods[i].numberReputation) * 5
                                    goods[i].starscore = Math.ceil(goods[i].starscore / 0.5) * 0.5
                                    goods[i].starpic = starscore.picStr(goods[i].starscore)
                                }

                                if (res.code === 0) {
                                    if (res.data.length < pageSize) {
                                        star(res.data.length)
                                    }
                                    else {
                                        goods[i].numberReputation = -1;
                                    }
                                }
                                else if (res.code === 700) {
                                    star(0)
                                }
                                that.setData({
                                    goods: goods,
                                });
                            },
                            fail: function (res) {
                            }
                        })
                    }
                    that.setData({
                        goodsNum: goods.length
                    })
                }
                if (res.data === null || res.data.length < 10) {
                    that.setData({
                        loadingHidden: true
                    })
                } else {
                    that.setData({
                        loadingHidden: false
                    })
                }

                console.log('data', that.data)

                wx.showToast({
                    title: '加载成功',
                })
            },
            fail: function () {
                that.setData({
                    load_statue: false
                })
                wx.showToast({
                    title: '加载失败',
                })
            }
        })
    },
    refreshGoodsList: function () {
        this.setData({
            pageNum: 1,
            goods: []
        })
        this.loadSearchContent(this.data.keyword, this.data.pageNum, this.data.pageSize);
    },
    onReachBottom: function () {
        if (this.data.loadingHidden) {
            return
        }
        this.loadMoreGoodsList();
    },
    loadMoreGoodsList: function () {
        let page = this.data.pageNum + 1;
        this.setData({
            pageNum: page
        })
        this.loadSearchContent(this.data.keyword, this.data.pageNum, this.data.pageSize);
    },
    toSearch: function (e) {
        this.refreshGoodsList();
    },
    toDetailsTap: function (e) {
        wx.navigateTo({
            url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
        })
    },
    //////////////////////////////////////
    wxSearchFn: function (e) {
        let that = this
        that.toSearch();
        WxSearch.wxSearchAddHisKey(that);

    },
    wxSearchInput: function (e) {
        let that = this
        WxSearch.wxSearchInput(e, that);

        that.setData({
            keyword: that.data.wxSearchData.value,
        })
    },
    wxSearchFocus: function (e) {
        let that = this
        WxSearch.wxSearchFocus(e, that);
    },
    wxSearchBlur: function (e) {
        let that = this
        WxSearch.wxSearchBlur(e, that);
    },
    wxSearchKeyTap: function (e) {
        let that = this
        WxSearch.wxSearchKeyTap(e, that);

        that.setData({
            keyword: that.data.wxSearchData.value,
        })
    },
    wxSearchDeleteKey: function (e) {
        let that = this
        WxSearch.wxSearchDeleteKey(e, that);
    },
    wxSearchDeleteAll: function (e) {
        let that = this;
        WxSearch.wxSearchDeleteAll(that);
    },
    wxSearchTap: function (e) {
        let that = this
        WxSearch.wxSearchHiddenPancel(that);
    }
})