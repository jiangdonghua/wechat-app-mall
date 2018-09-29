let commonCityData = require('../../utils/city.js');

//获取应用实例
let app = getApp()
import {fetch, alert,showToast} from '../../utils/util'
Page({
    data: {
        provinces: [],
        citys: [],
        districts: [],
        selProvince: '请选择',
        selCity: '请选择',
        selDistrict: '请选择',
        selProvinceIndex: 0,
        selCityIndex: 0,
        selDistrictIndex: 0
    },
    bindCancel: function () {
        wx.navigateBack({})
    },
    //提交地址
    bindSave: function (e) {
        let that = this;
        let linkMan = e.detail.value.linkMan;
        let address = e.detail.value.address;
        let mobile = e.detail.value.mobile;
        let code = e.detail.value.code;
        // let provinceId = e.detail.value.provinceId;
        // let districtId = e.detail.value.districtId;

        if (linkMan === "") {
            alert('提示', '请填写联系人姓名')
            return
        }
        if (mobile === "") {
            alert('提示', '请填写手机号码')
            return
        }
        if (this.data.selProvince && this.data.selCity === "请选择") {
            alert('提示', '请选择地区')
            return
        }
        if (address === "") {
            alert('提示', '请填写详细地址')
            return
        }
        if (code === "") {
            alert('提示', '请填写邮编')
            return
        }

        let cityId = commonCityData.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].id;
        let districtId;
        if (this.data.selDistrict === "请选择" || !this.data.selDistrict) {
            districtId = ''
        } else {
            districtId = commonCityData.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].districtList[this.data.selDistrictIndex].id;
        }
        let apiAddoRuPDATE = "add";//新增
        let apiAddid = that.data.id;
        if (apiAddid) {
            apiAddoRuPDATE = "update";//存在地址则更新
        } else {
            apiAddid = 0;
        }
        fetch({
            url: '/user/shipping-address/' + apiAddoRuPDATE,
            data: {
                provinceId: commonCityData.cityData[this.data.selProvinceIndex].id,
                id: apiAddid,
                cityId: cityId,
                districtId: districtId,
                linkMan: linkMan,
                address: address,
                mobile: mobile,
                code: code,
                isDefault: 'true'
            },
            success: function (res) {
                if (res.code !== 0) {
                    // 登录错误
                    wx.hideLoading();
                    alert('失败', res.msg)
                    return;
                }
                // 跳转到结算页面
                wx.navigateBack({})
            }
        })

    },
    //填充城市数据 省市区
    initCityData: function (level, obj) {
        if (level === 1) {
            let pinkArray = [];
            for (let i = 0; i < commonCityData.cityData.length; i++) {
                pinkArray.push(commonCityData.cityData[i].name);
            }
            this.setData({
                provinces: pinkArray
            });
        } else if (level === 2) {
            let pinkArray = [];
            let dataArray = obj.cityList
            for (let i = 0; i < dataArray.length; i++) {
                pinkArray.push(dataArray[i].name);
            }
            this.setData({
                citys: pinkArray
            });
        } else if (level === 3) {
            let pinkArray = [];
            let dataArray = obj.districtList
            for (let i = 0; i < dataArray.length; i++) {
                pinkArray.push(dataArray[i].name);
            }
            this.setData({
                districts: pinkArray
            });
        }
    },
    //选择省
    bindPickerProvinceChange: function (event) {
        let selItem = commonCityData.cityData[event.detail.value];
        this.setData({
            selProvince: selItem.name,
            selProvinceIndex: event.detail.value,
            selCity: '请选择',
            selCityIndex: 0,
            selDistrict: '请选择',
            selDistrictIndex: 0
        })
        this.initCityData(2, selItem)
    },
    //选择市
    bindPickerCityChange: function (event) {
        let selItem = commonCityData.cityData[this.data.selProvinceIndex].cityList[event.detail.value];
        this.setData({
            selCity: selItem.name,
            selCityIndex: event.detail.value,
            selDistrict: '请选择',
            selDistrictIndex: 0
        })
        this.initCityData(3, selItem)
    },
    //选择区
    bindPickerChange: function (event) {
        let selItem = commonCityData.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].districtList[event.detail.value];
        if (selItem && selItem.name && event.detail.value) {
            this.setData({
                selDistrict: selItem.name,
                selDistrictIndex: event.detail.value
            })
        }
    },
    //初始化并获取编辑状态下的id
    onLoad: function (e) {
        let that = this;
        this.initCityData(1);
        let id = e.id;

        if (id) {
            // 初始化原数据
            wx.showLoading();
            //获取详细的收货地址
            fetch({
                url: '/user/shipping-address/detail',
                data: {
                    id: id
                },
                success: function (res) {
                    wx.hideLoading();
                    if (res.code === 0) {
                        // console.log(res)
                        that.setData({
                            id: id,
                            addressData: res.data,//详细地址
                            selProvince: res.data.provinceStr,
                            selCity: res.data.cityStr,
                            selDistrict: res.data.areaStr ? res.data.areaStr : ''
                        });
                        that.setDBSaveAddressId(res.data);
                    } else {
                        alert("提示", "无法获取快递地址数据")
                    }
                }
            })

        }
    },
    //如果已存在地址 初始化地址显示
    setDBSaveAddressId: function (data) {
        for (let i = 0; i < commonCityData.cityData.length; i++) {
            if (data.provinceId === commonCityData.cityData[i].id) {
                this.data.selProvinceIndex = i;
                for (let j = 0; j < commonCityData.cityData[i].cityList.length; j++) {
                    if (data.cityId === commonCityData.cityData[i].cityList[j].id) {
                        this.data.selCityIndex = j;
                        for (let k = 0; k < commonCityData.cityData[i].cityList[j].districtList.length; k++) {
                            if (data.districtId === commonCityData.cityData[i].cityList[j].districtList[k].id) {
                                this.data.selDistrictIndex = k;
                            }
                        }
                    }
                }
            }
        }
    },
    selectCity: function () {},
    //删除地址
    deleteAddress: function (e) {
        let id = e.currentTarget.dataset.id;
        alert('提示', '确定要删除该收货地址吗？', function (res) {
            if (res.confirm) {
                fetch({
                    url: '/user/shipping-address/delete',
                    data: {
                        id: id
                    },
                    success: (res) => {
                        showToast("删除成功","success",3000,function(){
                            wx.navigateBack({})
                        });
                    }
                })
            } else if (res.cancel) {
                console.log('用户点击取消')
            }
        })
    },
    //从微信读取地址
    readFromWx: function () {
        let that = this;
        wx.chooseAddress({
            success: function (res) {
                let provinceName = res.provinceName;
                let cityName = res.cityName;
                let districtName = res.countyName;

                for (let i = 0; i < commonCityData.cityData.length; i++) {

                    if (provinceName === commonCityData.cityData[i].name) {
                        let eventJ = {detail: {value: i}};
                        that.bindPickerProvinceChange(eventJ);
                        that.data.selProvinceIndex = i;
                        let list = commonCityData.cityData[i].cityList;
                        //直辖市
                        if (provinceName === cityName) {
                            for (let m = 0; m < list.length; m++) {
                                if (districtName === list[m].name) {
                                    let eventJ2 = {detail: {value: m}};
                                    that.bindPickerCityChange(eventJ2);
                                    that.data.selCityIndex = m;
                                }
                            }
                            that.setData({
                                selDistrict: ""
                            })
                        } else {
                            //非直辖市
                            for (let j = 0; j < list.length; j++) {
                                if (cityName === list[j].name) {
                                    let eventCity = {detail: {value: j}};
                                    that.bindPickerCityChange(eventCity);
                                    that.data.selCityIndex = j;
                                }
                                for (let k = 0; k < commonCityData.cityData[i].cityList[j].districtList.length; k++) {
                                    if (districtName === commonCityData.cityData[i].cityList[j].districtList[k].name) {

                                        let eventJ2 = {detail: {value: k}};
                                        that.bindPickerChange(eventJ2);
                                        that.data.selDistrictIndex = k;
                                    }
                                }
                            }
                        }
                    }
                }

                that.setData({
                    wxaddress: res,

                });
            }
        })
    }
})
