var login = require('../../framework/login/login.js');
var eg = require('../../framework/communication/engine.js');
var constants = require('../../framework/communication/constants.js');
var COUNT_DOWN_TIME = 60   //定义倒计时时间
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    newPhone: '',
    code: null,
    isGetCode: false,
    countDownTime:COUNT_DOWN_TIME,
  },

  //校验验证码
  SMSVerification: function () {
    var that = this;
    eg.rpc({
      serverName: constants.CONTENT_SERVER_NAME,
      methodName: constants.CHECK_VALIDATE_CODE,
      data:{
        userId: app.globalData.userInfo.id,
        code: that.data.code
      },
      success:function (res) {
        that.updatePhone();
      },
      fail: function (err) {
        wx.showToast({
          title: err.message,
          icon: 'none',
          duration: 1500
        })
      }
    })
  },

  //获取验证码的请求
  getCheckCode: function () {
    console.log(app.globalData.userInfo.id)
    var that = this;
    eg.rpc({
      serverName: constants.CONTENT_SERVER_NAME,
      methodName: constants.GET_VALIDATE_CODE,
      data:{
        userId: app.globalData.userInfo.id,
        phone: that.data.newPhone,
        type: 1
      },
      success: function (res) {
        wx.showToast({
          title: '已发送',
          icon: 'none',
          duration: 1500
        })
      },
      fail: function (res) {
        wx.showToast({
          title: err.message,
          icon: 'none',
          duration: 1500
        })
      }
    })
  },

  // 获取验证码
  codeCountDown: function () {
    var that = this;
    var countdownTime = that.data.countDownTime;
    if(!that.data.newPhone) {
      wx.showToast({
        title: '请输入新的手机号',
        icon: 'none',
        duration: 1500
      })
      return false;
    }
    that.setData({
      isGetCode:true
    });
    var interval = setInterval(function () {
      countdownTime--;
      that.setData({
        countDownTime: countdownTime
      })
      if(countdownTime < 0) {
        clearInterval(interval);
        that.setData({
          countDownTime: COUNT_DOWN_TIME,
          isGetCode: false
        });
      }
    }, 1000);
    that.getCheckCode();
  },

  // 获取输入的数据
  getInputData: function (e) {
    var that = this;
    var inputId = e.currentTarget.id;
    switch(inputId) {
      case "phone":
        that.data.newPhone = e.detail.value;
        break;
      case "code":
        that.data.code = e.detail.value;
        break;
    }
  },

  // 更新手机确定按钮
  updatePhone: function () {
    var that = this;
    var pages = getCurrentPages();      //获取当前页面信息栈
    var prePage = pages[pages.length-2]  //获取上一个页面信息栈
    var currentPage = prePage.data.cardInfo;
    currentPage.phone = that.data.newPhone;
    if (that.data.newPhone == ''){
      wx.showToast({
        title: "请输入新手机号",
        icon: "none",
        duration: 1500
      });
    } else if (!that.data.code){
      wx.showToast({
        title: "请验证手机号",
        icon: "none",
        duration: 1500
      });
    } else {
      console.log('确定更新');
      prePage.setData({
        cardInfo: currentPage,
        isUpdate: true
      });
      that.submit(currentPage);
    }
  },

  // 提交保存修改后的手机
  submit: function (info) {
    var that = this;
    eg.rpc({
      serverName: constants.CONTENT_SERVER_NAME,
      methodName: constants.UPDATE_CARD,
      data: info,
      success: function (res) {
        wx.navigateBack({
          delta: 1
        });
      },
      fail: function(err) {
        wx.showToast({
          title: err.message,
          icon: 'none',
          duration: 1500
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})