//index.js
//获取应用实例
let app = getApp();
let WxParse = require('../../wxParse/wxParse.js');
import {fetch,fetchNoToken,alert} from '../../utils/util'
Page({
    data: {
        autoplay: true,
        interval: 3000,
        duration: 1000,
        goodsDetail: {},
        swiperCurrent: 0,
        hasMoreSelect: false,
        selectSize: "选择：",
        selectSizePrice: 0,
        totalScoreToPay: 0,
        shopNum: 0,
        hideShopPopup: true,
        buyNumber: 0,
        buyNumMin: 1,
        buyNumMax: 0,
        videoTag: [
            {
                name: "视频"
            },
            {
                name: "图片"
            }
        ],
        videoCurrent:0,
        propertyChildIds: "",
        propertyChildNames: "",
        canSubmit: false, //  选中规格尺寸时候是否允许加入购物车
        shopCarInfo: {},
        shopType: "addShopCar",//购物类型，加入购物车或立即购买，默认为加入购物车
    },

    //事件处理函数
    swiperchange: function (e) {
        if(e.detail.current===0){
            this.setData({
                videoCurrent:0,
                swiperCurrent: 0,
                currentTab: 0
            })
        }else{
            this.setData({
                videoCurrent:1
            })
        }
        this.setData({
            swiperCurrent: e.detail.current,

        })
    },
    videoCurrent:function (e) {
        this.setData({
            videoCurrent:e.currentTarget.dataset.index,
            swiperCurrent: e.currentTarget.dataset.index,
            currentTab: e.currentTarget.dataset.index
        })
    },
    onLoad: function (e) {
        let that = this;
        //如果有邀请者id
        if (e.inviter_id) {
            wx.setStorage({
                key: 'inviter_id_' + e.id,
                data: e.inviter_id
            })
        }

        that.data.kjId = e.kjId;
        // 获取购物车数据
        wx.getStorage({
            key: 'shopCarInfo',
            success: function (res) {
                that.setData({
                    shopCarInfo: res.data,
                    shopNum: res.data.shopNum
                });
            }
        })


        //获取商品详情
        fetchNoToken({
            url:'shop/goods/detail',
            data: {
                id: e.id
            },
            success(res){
                console.log(res)
                if(res.data.properties){//该商品可选的规格和尺寸单元，对应不同的价格和库存数
                    let properties=res.data.properties;
                    let selectSizeTemp=""
                    for(let i=0;i<properties.length;i++){
                        selectSizeTemp=selectSizeTemp+" "+properties[i].name;
                    }
                    that.setData({
                        hasMoreSelect: true,
                        selectSize:that.data.selectSize+selectSizeTemp
                    })
                }
                //有介绍视频
                if(res.data.basicInfo.videoId){
                            let videoId=res.data.basicInfo.videoId
                           that.getVideoSrc(videoId)
                }
                that.setData({
                    goodsDetail:res.data,
                    basicInfo:res.data.basicInfo,//商品基础信息
                    content:res.data.content,//商品详细介绍，后台富媒体编辑器填写的内容
                    pics:res.data.pics,//本商品的多少展示图片
                    category:res.data.category,//商品分类信息
                    logistics:res.data.logistics,//该商品的物流信息
                    selectSizePrice:res.data.basicInfo.minPrice, //价格
                    totalScoreToPay: res.data.basicInfo.minScore,
                    logisticsId: res.data.basicInfo.logisticsId,
                    poster: res.data.pics[0].pic,
                    buyNumMax: res.data.basicInfo.stores,
                    buyNumber: (res.data.basicInfo.stores > 0) ? 1 : 0
                })
                WxParse.wxParse('article', 'html', res.data.content, that);//解析详情
            }
        });
        //获取评价
        this.reputation(e.id);
        //获取砍价信息 只对vip开放
        // this.getKanjiaInfo(e.id);
    },
    goShopCar: function () {
        wx.reLaunch({
            url: "/pages/shop-cart/index"
        });
    },
    toAddShopCar: function () {
        this.setData({
            shopType: "addShopCar"
        })
        this.bindGuiGeTap();
    },
    tobuy: function () {
        this.setData({
            shopType: "tobuy"
        });
        this.bindGuiGeTap();
        /*    if (this.data.goodsDetail.properties && !this.data.canSubmit) {
         this.bindGuiGeTap();
         return;
         }
         if(this.data.buyNumber < 1){
         wx.showModal({
         title: '提示',
         content: '暂时缺货哦~',
         showCancel:false
         })
         return;
         }
         this.addShopCar();
         this.goShopCar();*/
    },
    /**
     * 规格选择弹出框
     */
    bindGuiGeTap: function () {
        this.setData({
            hideShopPopup: false,
        })
    },
    /**
     * 规格选择弹出框隐藏
     */
    closePopupTap: function () {
        this.setData({
            hideShopPopup: true
        })
    },
    numJianTap: function () {
        if (this.data.buyNumber > this.data.buyNumMin) {
            let currentNum = this.data.buyNumber;
            currentNum--;
            this.setData({
                buyNumber: currentNum
            })
        }
    },
    numJiaTap: function () {
        if (this.data.buyNumber < this.data.buyNumMax) {
            let currentNum = this.data.buyNumber;
            currentNum++;
            this.setData({
                buyNumber: currentNum
            })
        }
    },
    /**
     * 选择商品规格
     * @param {Object} e
     */
    labelItemTap: function (e) {
        let that = this;
        let properties=that.data.goodsDetail.properties;
        let propertyindex=e.currentTarget.dataset.propertyindex;
        // let propertyid=e.currentTarget.dataset.propertyid;
        // let propertyname=e.currentTarget.dataset.propertyname;
        let propertychildindex=e.currentTarget.dataset.propertychildindex;
        // let propertychildid=e.currentTarget.dataset.propertychildid;
        // let propertychildname=e.currentTarget.dataset.propertychildname;
        // 取消该分类下的子栏目所有的选中状态
        let childs=properties[propertyindex].childsCurGoods;

        for(let i=0;i<childs.length;i++){
            childs[i].active=false;
        }
        // 设置当前选中状态
        childs[propertychildindex].active=true;

        // 获取所有的选中规格尺寸数据
        let needSelectNum =properties.length;
        let curSelectNum = 0;
        let propertyChildIds = "";
        let propertyChildNames = "";
        for (let i = 0; i < needSelectNum; i++) {
            childs =properties[i].childsCurGoods;
            for (let j = 0; j < childs.length; j++) {
                if (childs[j].active) {
                    curSelectNum++;
                    propertyChildIds = propertyChildIds + properties[i].id + ":" + childs[j].id + ",";
                    propertyChildNames = propertyChildNames + properties[i].name + ":" + childs[j].name + "  ";
                }
            }
        }
        let canSubmit = false;
        console.log('needSelectNum:'+needSelectNum,"curSelectNum:"+curSelectNum)
        if (needSelectNum === curSelectNum) {
            canSubmit = true;
        }
        // 计算当前价格
        if (canSubmit) {
            fetchNoToken({
                url: '/shop/goods/price',
                data: {
                    goodsId: that.data.goodsDetail.basicInfo.id,
                    propertyChildIds: propertyChildIds
                },
                success(res){
                    that.setData({
                        originalPrice:res.data.originalPrice,
                        selectedSizePrice:res.data.price,
                        score:res.data.score>0?res.data.score:0,
                        stores:res.data.stores,
                        propertyChildIds: propertyChildIds,
                        propertyChildNames: propertyChildNames,
                        buyNumMax:res.data.stores,
                        buyNumMin:res.data.stores>0?1:0
                    })
                }
            });
        }
        this.setData({
            goodsDetail: that.data.goodsDetail,
            canSubmit: canSubmit
        })
    },
    /**
     * 加入购物车
     */
    addShopCar: function () {
        if (this.data.goodsDetail.properties && !this.data.canSubmit) {
            if (!this.data.canSubmit) {
                alert("提示","请选择商品规格！");
            }
            this.bindGuiGeTap();
            return;
        }
        if (this.data.buyNumber < 1) {
            alert("提示","购买数量不能为0！");
            return;
        }
        //组建购物车
        let shopCarInfo = this.buildShopCarInfo();
        this.setData({
            shopCarInfo: shopCarInfo,
            shopNum: shopCarInfo.shopNum
        });

        // 写入本地存储
        wx.setStorage({
            key: 'shopCarInfo',
            data: shopCarInfo
        })
        this.closePopupTap();
        wx.showToast({
            title: '加入购物车成功',
            icon: 'success',
            duration: 2000
        })
        //console.log(shopCarInfo);

        //shopCarInfo = {shopNum:12,shopList:[]}
    },
    /**
     * 立即购买
     */
    buyNow: function () {
        if (this.data.goodsDetail.properties && !this.data.canSubmit) {
            if (!this.data.canSubmit) {
                alert("提示","请选择商品规格！");
            }
            this.bindGuiGeTap();
            alert("提示","请先选择规格尺寸哦~");
            return;
        }
        if (this.data.buyNumber < 1) {
            alert("提示","购买数量不能为0！");
            return;
        }
        //组建立即购买信息
        let buyNowInfo = this.buildBuyNowInfo();
        console.log(buyNowInfo)
        // 写入本地存储
        wx.setStorage({
            key: "buyNowInfo",
            data: buyNowInfo
        })
        this.closePopupTap();

        wx.navigateTo({
            url: "/pages/to-pay-order/index?orderType=buyNow"
        })
    },
    /**
     * 组建购物车信息
     */
    buildShopCarInfo: function () {
        // 加入购物车
        let shopCarMap={
            goodsId:this.data.goodsDetail.basicInfo.id,
            pic :this.data.goodsDetail.basicInfo.pic,
            name : this.data.goodsDetail.basicInfo.name,
            propertyChildIds : this.data.propertyChildIds,
            label:this.data.propertyChildNames,
            price:this.data.selectSizePrice,
            score: this.data.totalScoreToPay,
            left:"",
            active:true,
            number:this.data.buyNumber,
            logisticsType:this.data.goodsDetail.basicInfo.logisticsId,
            logistics:this.data.goodsDetail.logistics,
            weight:this.data.goodsDetail.basicInfo.weight,
        };

        let shopCarInfo = this.data.shopCarInfo;
        if (!shopCarInfo.shopNum) {
            shopCarInfo.shopNum = 0;
        }
        if (!shopCarInfo.shopList) {
            shopCarInfo.shopList = [];
        }
        //假设商品id
        let hasSameGoodsIndex = -1;

        for (let i = 0; i < shopCarInfo.shopList.length; i++) {
            let tmpShopCarMap = shopCarInfo.shopList[i];
            if (tmpShopCarMap.goodsId === shopCarMap.goodsId && tmpShopCarMap.propertyChildIds === shopCarMap.propertyChildIds) {
                hasSameGoodsIndex = i;
                shopCarMap.number = shopCarMap.number + tmpShopCarMap.number;
                break;
            }
        }

        //购物车数量
        shopCarInfo.shopNum = shopCarInfo.shopNum + this.data.buyNumber
        //已存在购物车的商品 替换
        if (hasSameGoodsIndex > -1) {
            shopCarInfo.shopList.splice(hasSameGoodsIndex, 1, shopCarMap);
        } else {
            //没有则加入
            shopCarInfo.shopList.push(shopCarMap);
        }
        shopCarInfo.kjId = this.data.kjId;
        return shopCarInfo;
    },
    /**
     * 组建立即购买信息
     */
    buildBuyNowInfo: function () {
        let shopCarMap={
            goodsId:this.data.goodsDetail.basicInfo.id,
            pic :this.data.goodsDetail.basicInfo.pic,
            name : this.data.goodsDetail.basicInfo.name,
            propertyChildIds : this.data.propertyChildIds,
            label:this.data.propertyChildNames,
            price:this.data.selectSizePrice,
            score: this.data.totalScoreToPay,
            left:"",
            active:true,
            number:this.data.buyNumber,
            logisticsType:this.data.goodsDetail.basicInfo.logisticsId,
            logistics:this.data.goodsDetail.logistics,
            weight:this.data.goodsDetail.basicInfo.weight,
        };
        let buyNowInfo = {};
        if (!buyNowInfo.shopNum) {
            buyNowInfo.shopNum = 0;
        }
        if (!buyNowInfo.shopList) {
            buyNowInfo.shopList = [];
        }
        /*    let hasSameGoodsIndex = -1;
         for (let i = 0; i < toBuyInfo.shopList.length; i++) {
         let tmpShopCarMap = toBuyInfo.shopList[i];
         if (tmpShopCarMap.goodsId == shopCarMap.goodsId && tmpShopCarMap.propertyChildIds == shopCarMap.propertyChildIds) {
         hasSameGoodsIndex = i;
         shopCarMap.number = shopCarMap.number + tmpShopCarMap.number;
         break;
         }
         }
         toBuyInfo.shopNum = toBuyInfo.shopNum + this.data.buyNumber;
         if (hasSameGoodsIndex > -1) {
         toBuyInfo.shopList.splice(hasSameGoodsIndex, 1, shopCarMap);
         } else {
         toBuyInfo.shopList.push(shopCarMap);
         }*/

        buyNowInfo.shopList.push(shopCarMap);
        buyNowInfo.kjId = this.data.kjId;
        return buyNowInfo;
    },

    //分享
    onShareAppMessage: function () {
        return {
            title: this.data.goodsDetail.basicInfo.name,
            path: '/pages/goods-details/index?id=' + this.data.goodsDetail.basicInfo.id + '&inviter_id=' + wx.getStorageSync('uid'),
            success: function (res) {
                // 转发成功
            },
            fail: function (res) {
                // 转发失败
            }
        }
    },
    //评价信息
    reputation: function (goodsId) {
        let that = this;
        wx.request({
            url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/reputation',
            data: {
                goodsId: goodsId
            },
            success: function (res) {
                if (res.data.code == 0) {
                    //console.log(res.data.data);
                    that.setData({
                        reputation: res.data.data
                    });
                }
            }
        })
    },
    //获取视频信息
    getVideoSrc: function (videoId) {
        let that = this;
        wx.request({
            url: 'https://api.it120.cc/' + app.globalData.subDomain + '/media/video/detail',
            data: {
                videoId: videoId
            },
            success: function (res) {
                if (res.data.code == 0) {
                    that.setData({
                        videoMp4Src: res.data.data.fdMp4
                    });
                }
            }
        })
    },
    //获取砍价信息 只对vip用户开放
    getKanjiaInfo: function (gid) {
        let that = this;
        if (!app.globalData.kanjiaList || app.globalData.kanjiaList.length === 0) {
            that.setData({
                curGoodsKanjia: null
            });
            return;
        }
        let curGoodsKanjia = app.globalData.kanjiaList.find(ele => {
            return ele.goodsId === gid
        });
        if (curGoodsKanjia) {
            that.setData({
                curGoodsKanjia: curGoodsKanjia
            });
        } else {
            that.setData({
                curGoodsKanjia: null
            });
        }
    },
    //加入砍价
    goKanjia: function () {
        let that = this;
        if (!that.data.curGoodsKanjia) {
            return;
        }
        wx.request({
            url: 'https://api.it120.cc/' + app.globalData.subDomain + '/shop/goods/kanjia/join',
            data: {
                kjid: that.data.curGoodsKanjia.id,
                token: wx.getStorageSync('token')
            },
            success: function (res) {
                if (res.data.code === 0) {
                    console.log(res.data);
                    wx.navigateTo({
                        url: "/pages/kanjia/index?kjId=" + res.data.data.kjId + "&joiner=" + res.data.data.uid + "&id=" + res.data.data.goodsId
                    })
                } else {
                    wx.showModal({
                        title: '错误',
                        content: res.data.msg,
                        showCancel: false
                    })
                }
            }
        })
    },
})
