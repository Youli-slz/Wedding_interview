var interval;
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    version: app.globalData.version,
    winWidth: null,
    winHeight: null,
    countDown:3,
    isBtnClicked:false,
  },

  // 获取基本信息
  getwindowinfo: function () {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        })
      }
    })
  },

  //倒计时
  countDown: function () {
    var that = this;
    interval = setInterval(function() {
      that.data.countDown--;
      that.setData({
        countDown: that.data.countDown
      })
      if(that.data.countDown == 0) {
        that.toMain();
      }
    }, 1000);
  },

  // 跳转到主页
  toMain: function () {
    clearInterval(interval);
    wx.redirectTo({
      url: '../cardholder/cardholder'
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getwindowinfo();
    this.countDown();
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