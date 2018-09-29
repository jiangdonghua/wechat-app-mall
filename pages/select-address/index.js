//index.js
//获取应用实例
let app = getApp();
import {fetch, alert} from '../../utils/util'
Page({
    data: {
        addressList: [],
        errMsg:''
    },
    selectTap: function (e) {
        let id = e.currentTarget.dataset.id;
        fetch({
            url:'/user/shipping-address/update',
            data: {
                id: id,
                isDefault: 'true'
            },
            success: (res) => {
                wx.navigateBack({})
            }
        });
    },

    addAddress: function () {
        wx.navigateTo({
            url: "/pages/address-add/index"
        })
    },

    editAddress: function (e) {
        wx.navigateTo({
            url: "/pages/address-add/index?id=" + e.currentTarget.dataset.id
        })
    },

    onLoad: function () {
        console.log('onLoad')
    },
    onShow: function () {
        this.initShippingAddress();
    },
    initShippingAddress: function () {
        let that = this;
        fetch({
            url:'/user/shipping-address/list',
            success: (res) => {
                // console.log(res.data)
                if (res.code === 0) {
                    that.setData({
                        addressList: res.data
                    });
                } else if (res.code === 700) {
                    that.setData({
                        addressList: null,
                        errMsg:res.msg
                    });
                }
            }
        })
    }

})
