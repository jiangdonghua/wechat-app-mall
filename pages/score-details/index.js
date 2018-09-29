let app = getApp();
import {fetch, alert} from "../../utils/util"
Page({
    data: {
        scoreList: []
    },
    onLoad: function (e) {
        this.signLogs();
        this.scoreLogs();
        this.scoreSendRule();
        this.scoreSignRule();
    },
    onShow: function () {

    },
    //查询签到记录
    signLogs: function () {
        let that = this;
        fetch({
            url: "/score/sign/logs",
            // data:{
            //
            // },
            success: function (res) {
console.log(res)
                if (res.code === 0) {
                    that.setData({
                        signList: res.data.result,
                        totalRow: res.data.totalRow,
                        totalPage: res.data.totalPage
                    })
                }
            }
        })
    },
    //积分明细记录
    scoreLogs: function () {
        wx.showLoading();
        let that = this;
        fetch({
            url: "/score/logs",
            data: {},
            success: function (res) {
                wx.hideLoading();
                // console.log(res)
                if (res.code === 0) {
                    that.setData({
                        scoreList:res.data.result,
                        totalRow:res.data.totalRow,
                        totalPage:res.data.totalPage
                    })
                }
            }
        })
    },
    //获取积分赠送规则
    scoreSendRule: function () {

        let that = this;
        fetch({
            url: "/score/send/rule",
            data: {},
            success: function (res) {
                // console.log(res)
                if (res.code === 0) {
                    that.setData({
                        // scoreList:res.data.result,
                        // totalRow:res.data.totalRow,
                        // totalPage:res.data.totalPage
                    })
                }
            }
        })
    },
    //获取签到赠送积分规则
    scoreSignRule: function () {
        let that = this;
        fetch({
            url: "/score/sign/rules",
            data: {},
            success: function (res) {
                // console.log(res)
                if (res.code === 0) {
                    that.setData({
                            signRules:res.data
                    })
                }
            }
        })
    },
})