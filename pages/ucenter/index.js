const app = getApp()
import {fetch,alert} from '../../utils/util'
Page({
    data: {
        aboutUsTitle: '',
        aboutUsContent: '',
        servicePhoneNumber: '',
        balance: 0,
        freeze: 0,
        score: 0,
        score_sign_continuous: 0,
        totleConsumed:0,
        iconSize: 45,
        iconColor: '#999999'
    },
    onLoad() {
        let that=this
        let userInfo = wx.getStorageSync('userInfo');
        if(!userInfo){
            wx.navigateTo({
                url: "/pages/authorize/index"
            })
        }
        that.setData({
            version:app.globalData.version,
            backgroundColor:app.globalData.globalBGColor,
            userInfo:userInfo
        })
    },
    onShow() {
       this.checkScoreSign();
        let userInfo = wx.getStorageSync('userInfo')
        if(userInfo){
            this.getUserAmount()
        }
        this.getUserApiInfo();
    },
    //今日是否签到
    checkScoreSign(){
      let that=this
        fetch({
            url:"/score/today-signed",
            success(res){
                if(res.code===0){
                    that.setData({
                        score_sign_continuous:res.data.continuous
                    })
                }
            }
        })
    },
    //签到
    scoresign:function () {
        let that=this
        fetch({
            url:"/score/sign",
            success(res){
                if(res.code===0){
                    that.getUserAmount();
                    that.checkScoreSign();
                }else{
                    alert("小tip",res.msg+'~')
                }
            }
        })
    },
    //用户的统计 包括积分 余额 提现的查询
    getUserAmount(){
        let that = this;
        fetch({
            url:"/user/amount",
            success(res){
                // console.log(res)
                that.setData({
                    balance:res.data.balance,
                    freeze:res.data.freeze,
                    score:res.data.score,
                    totleConsumed:res.data.totleConsumed
                })
            }
        })
    },
    relogin:function () {
      wx.navigateTo({
        url: "/pages/authorize/index"
      })
        this.onLoad()
    },
    register:function () {
       wx.login({
           success:function (res) {
               if(res.code){
                   let code=res.code
                   wx.getSetting({
                       success(setRes){
                           if(!setRes.authSetting['scope.userInfo']){
                               wx.navigateTo({
                                   url: "/pages/authorize/index"
                               })
                           }else{
                                wx.getUserInfo({
                                    success(resInfo){
                                        console.log(resInfo)
                                        fetch({
                                            url:"user/wxapp/register/complex",
                                            data:{
                                                code:code,
                                                encryptedData:resInfo.encryptedData,
                                                iv:resInfo.iv
                                            },
                                            success(resolve){
                                                console.log(resolve)
                                                if(resolve.code===10000){
                                                    // alert("tip","用户已注册")
                                                }
                                            }
                                        })
                                    }
                                })
                           }
                       }
                   })

               }
           }
       })
    },
    //获取用户的基本信息
    getUserApiInfo: function () {
        let that = this;
        fetch({
            url: '/user/detail',
            data: {
                token: wx.getStorageSync('token')
            },
            success: function (res) {
                that.setData({
                    // apiUserInfoMap: res.data,
                    // userMobile: res.data.base.mobile
                });
            }
        })


    },
    onPullDownRefresh:function () {
        wx.showNavigationBarLoading();
        this.onShow();
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();

    },
    //进入积分明细
    scoreDetail:function () {
        wx.navigateTo({
            url: "/pages/score-details/index"
        })
    }
})