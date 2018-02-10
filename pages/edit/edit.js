var login = require('../../framework/login/login.js');
var eg = require('../../framework/communication/engine.js');
var constants = require('../../framework/communication/constants.js');
var qiniu = require('../../static/qiniu_upload.js');
var COUNT_DOWN_TIME = 60  // 定义倒计时时间
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    workTime:['一年以内','1-3年','3-5年','5-10年','10年以上'],
    job: ['婚庆','司仪','摄影','摄像','跟妆','婚纱','婚宴','婚车','甜点','鲜花','策划'],
    personImg: 'https://oss.ririyuedu.com/t3_03.png?imageMogr2/size-limit/500k',
    index: 0,               // 工作时间的index
    Jindex:0,               // 工作的index
    isnew:0,                // 是否显示创建页面
    isUpdate: false,         // 判断是否有修改
    code: null,
    isBtnClicked: false,    // 判断按钮是否点击
    cardInfo:{              // 名片信息
      name: '',
      phone: '',
      pic: 'https://oss.ririyuedu.com/t3_03.png?imageMogr2/size-limit/500k',
      professional: '婚庆',
      year: '一年以内',
      company: '',
      site: '',
      accessment: '',
      latitude: null,
      longitude: null,
    },
    isGetCode: false,
    countDownTime: COUNT_DOWN_TIME,
    site:''                 // 通过地图选择的地址
  },

  // 确保页面不重复跳转
  isClick: function (url) {
    var that = this;
    if (!that.data.isBtnClicked) {
      wx.navigateTo({
        url: url,
      })
      that.setData({
        isBtnClicked: true,
      })
      let t = setTimeout(function () {
        that.setData({
          isBtnClicked: false
        })
        clearTimeout(t);
      }, 500);
    }
  },

  //获取从业时间
  bindPickerChange: function(e) {
    var that = this;
    that.setData({
      index: e.detail.value,
      isUpdate: true
    })
    that.data.cardInfo.year = that.data.workTime[e.detail.value]

  },

  // 获取职业
  bindJob: function (e) {
    var that = this;
    that.setData({
      Jindex: e.detail.value,
      isUpdate: true
    })
    that.data.cardInfo.professional = that.data.job[e.detail.value]
  },

  // 跳转到修改手机号码页面
  updatePhone: function () {
    var that = this;
    var url = '../updatephone/updatephone';
    that.isClick(url);
  },

  // 创建成功后跳转到我的详情信息
  toMyCard: function () {
    wx.redirectTo({
      url: '../mycard/mycard'
    })
  },

  // 获取验证码请求
  getCheckCode: function () {
    var that = this;
    eg.rpc({
      serverName: constants.CONTENT_SERVER_NAME,
      methodName: constants.GET_VALIDATE_CODE,
      data:{
        userId: app.globalData.userInfo.id,
        phone: that.data.cardInfo.phone,
        type: 1
      },
      success: function (res) {
        wx.showToast({
          title: '已发送',
          icon: 'none',
          duration: 1500
        })
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

  // 获取验证码倒计时
  codeCountDown: function () {
    var that = this;
    if(!that.data.cardInfo.phone) {
      wx.showToast({
        title: '请填写手机号',
        icon: 'none',
        duration: 1500
      })
      return false;
    }
    var countdownTime = that.data.countDownTime;
    that.setData({
      isGetCode: true
    });
    var interval = setInterval(function () {
      countdownTime--;
      that.setData({
        countDownTime: countdownTime
      })
      if(countdownTime < 0){
        clearInterval(interval);
        that.setData({
          countDownTime: COUNT_DOWN_TIME,
          isGetCode: false
        })
      }
    }, 1000);
    that.getCheckCode();
  },

  // 获取头像
  getAvatarPic: function () {
    var that = this;
    wx.chooseImage({
      count:1,
      sizeType: ["original", "compressed"],
      sourceType: ["album","camera"],
      success: function (res) {
        qiniu.upLoad({
          type: 'image',
          filePaths: res.tempFilePaths,
          success: function (res) {
            that.data.cardInfo.pic = res.imageURL;
            console.log(res.imageURL);
            that.setData({
              personImg: res.imageURL,
              isUpdate: true
            });
          },
          fail: function (err){
            console.log(err);
          }
        })
      },
      fail: function (err) {
        console.log(err);
      }
    })
  },

  //通过点击按钮挑战到地图并选择当前地址
  getLocation: function () {
    var that = this;
    wx.chooseLocation({
      success: function (res) {
        that.data.cardInfo.latitude = res.latitude;
        that.data.cardInfo.longitude = res.longitude;
        that.data.cardInfo.site = res.address + res.name;
        that.setData({
          cardInfo: that.data.cardInfo
        })
      }
    })
  },

  //获取输入的数据
  getInputData: function (e) {
    var that = this;
    var inputId = e.currentTarget.id;
    switch(inputId){
      case "name":                     // 姓名输入
        that.data.cardInfo.name = e.detail.value;
        break;
      case "phone":                    // 手机输入
        that.data.cardInfo.phone = e.detail.value;
        break;
      case "code":                     // 验证码输入
        that.data.code = e.detail.value;
        break;
      case "job":                      // 职位输入
        that.data.cardInfo.professional = e.detail.value;
        break;
      case "company":                  // 公司输入
        that.data.cardInfo.company = e.detail.value;
        break;
      case "address":                  // 公司地址处理
        that.data.cardInfo.site = e.detail.value;
        break;
      case "accessment":               // 自我评价输入
        that.data.cardInfo.accessment = e.detail.value;
        break;
      default:
        console.log('没有输入');
    }
      that.setData({
        isUpdate: true
      })
  },

  // 校验验证码
  SMSVerification: function (info) {
    var that = this;
    eg.rpc({
      serverName: constants.CONTENT_SERVER_NAME,
      methodName: constants.CHECK_VALIDATE_CODE,
      data: {
        userId: app.globalData.userInfo.id,
        code: that.data.code
      },
      success: function (res) {
        that.createRequest(info);
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

  // https请求创建婚礼人信息
  createRequest: function (info) {
    var that = this;
    eg.rpc({
      serverName: constants.CONTENT_SERVER_NAME,
      methodName: constants.SET_CARD,
      data: {
        userId: app.globalData.userInfo.id,
        name: info.name,
        phone: info.phone,
        pic: info.pic,
        professional: info.professional,
        year: info.year,
        company: info.company,
        site: info.site,
        longitude: info.longitude,
        latitude: info.latitude,
        accessment: info.accessment
      },
      success: function (res) {
        that.toMyCard();       //  跳转到我的详情信息页面
      },
      fail: function(err) {
        wx.showToast({
          title: err.message,
          icon: 'none',
          duration: 1500
        });
      }
    })
  },

  // 提交信息
  submit: function () {
    var that = this;
    if(that.data.isnew == 0){   // 创建信息
      if (that.data.cardInfo.name != "" && that.data.cardInfo.phone != "" && that.data.cardInfo.professional != "" && that.data.code != "") {
        that.SMSVerification(that.data.cardInfo);
      } else {
        wx.showToast({
          title: "请填写完整信息",
          icon: "none",
          duration: 1500
        });
        return false;
      }
    } else {     // 修改信息
      if (that.data.cardInfo.name != "" && that.data.cardInfo.phone != "" && that.data.cardInfo.professional != "") {
        that.updateInfo(that.data.cardInfo);
      } else {
        wx.showToast({
          title: "请填写完整信息",
          icon: "none",
          duration: 1500
        });
      }
      return false;
    }
  },

  // 获取已经保存的个人基本信息
  getMyCardInfo: function () {
    var that = this;
    if (that.data.isnew == 1) {
      eg.rpc({
        serverName: constants.CONTENT_SERVER_NAME,
        methodName: constants.MY_CARD_INFO,
        data:{
          userId: app.globalData.userInfo.id
        },
        success: function (res) {
          res = res[0];
          that.getNumberByYear(res.year)
          that.getNumberByJob(res.professional);
          that.setData({
            cardInfo: res,
            personImg: res.pic
          })
        },
        fail: function (err) {
          wx.showToast({
            title: err.message,
            icon: 'none',
            duration: 1500
          })
        }
      })
    }
  },

  // 判断年限在workTime数组中的下标
  getNumberByYear: function (time) {
    var that = this;
    for(var i in that.data.workTime){
      if (that.data.workTime[i] == time){
        that.setData({
          index:i
        })
      }
    }
  }, 

  // 判断年限在workTime数组中的下标
  getNumberByJob: function (name) {
    var that = this;
    for(var i in that.data.job){
      if (that.data.job[i] == name){
        that.setData({
          Jindex:i
        })
      }
    }
  }, 

  // 更新新的信息
  updateInfo: function (info) {
    var that = this;
    eg.rpc({
      serverName: constants.CONTENT_SERVER_NAME,
      methodName: constants.UPDATE_CARD,
      data: info,
      success: function (res) {
        wx.showToast({
          title: '更新成功',
          icon: 'none',
          duration: 1500
        })
        that.toDesc();
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

  // 更新结束后跳转到详情页面
  toDesc: function () {
    wx.navigateBack({
      delta: 1
    })
  },

  //页面初始化
  pageInit: function () {
    this.getMyCardInfo();
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.data.cardInfo.pic = app.globalData.userInfo.avatarUrl;
    that.setData({
      isnew: options.isnew,
      personImg: app.globalData.userInfo.avatarUrl,
      cardInfo: that.data.cardInfo
    })
    if(login.isLogin(that.pageInit)) {
      that.pageInit();
    }
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