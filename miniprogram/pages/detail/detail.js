// pages/detail/detail.js
Page({

  data: {
    //数据
    info: {},
    //新修改数据
    newData: {},
    //当前数据的日期
    time: ""
  },

  //生命周期函数--监听页面加载
  onLoad: function (options) {
    console.log(1111)
    console.log("option==>", options)
    wx.getStorage({
      key: options._id,
      success: res => {
        console.log(res)
        //数据响应
        this.setData({
          info: res.data,
          time: res.data.data
        })
      }
    })
  },
  getNewData(e) {
    console.log(e)
    //获取当前修改的数据类型
    var type = e.currentTarget.dataset.type;

    this.data.newData[type] = e.detail.value;
    console.log(this.data.newData)
    //加入修改的是日期数据，则要更改time数据
    if (type == "data") {
      time: e.detail.value
    }
  },
  //编辑数据事件
  setMsgData() {
    console.log(111)
    //如果数据没有更改则不执行编辑事件，只有数据更改了才执行编辑事件修改数据库的数据
    //判断数据是否有修改,默认没有修改
    var isSet = false;
    //遍历新数据
    for (var k in this.data.newData) {
      if (this.data.newData[k] != this.data.info[k]) {
        //条件成立则说明数据更改了
        isSet = true;
      }
    }
    if (isSet) {
      //修改数据库数据
      console.log("数据已经更改了")

      //调用云函数
      wx.cloud.callFunction({
        name: "update_msg_data",
        data: {
          id: this.data.info._id,
          newData: this.data.newData
        },
        success: res => {
          console.log("编辑数据成功==》", res)
          wx.navigateBack()
          // wx.switchTab({
          //   url: '../home/home'
          // })
        },
        fail: err => {
          console.log("编辑数据失败==>", err)
        }
      })
    } else {
      console.log("数据没有更改")
    }
  },
  //删除数据事件
  deleteMsgData() {
    console.log('删除数据')
    console.log(this.data.info._id)
    //调用云函数
    wx.cloud.callFunction({
      name: "delete_msg_data",
      data: {
        id: this.data.info._id
      },
      success: res => {
        console.log("数据删除成功==》", res)
        wx.navigateBack()
      },
      fail: err => {
        console.log("删除数据失败=》", err)
      }
    })
  }
})

