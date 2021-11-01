// miniprogram/pages/record/record.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //收入支出标题数据
    costTitle: [{
        name: "支出", //标题的名字
        type: "pay", //类型
        isAct: true //激活状态，当前是否选中
      },
      {
        name: "收入",
        type: "income",
        isAct: false
      }
    ],
    arr: [
      [1, 2, 3, 4, 5, 6, 7, 8],
      [1, 2, 3, 4, 5, 6, 7, 8],
      [1, 2, 3, 4, 5, 6, 7, 8],
      [1, 2, 3, 4]
    ],
    //轮播图图标数据
    bannerIcon: {
      pay: [],
      income: []
    },
    //当天日期
    currentTime: "",
    //上一个激活的图标数据
    actIcon: {
      type: '', //图标类型
      index: '', //滑块下标
      id: '' //图片下标
    },
    info: {
      money: "", //金额，绑定在页面上
      data: "", //日期，不需要绑定在页面上，该数据主要是要上传到数据库上
      comment: "" //备注，需要绑定在页面上
    },
    today:"",//当天日期
    currentNum:0//默认显示滑块显示的位置

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    //调用函数，获取图标数据
    this.getIcon();
    //调用函数，获取当天日期
    this.getToday()
  },
  //标题点击切换事件
  //titleTap:function(){}
  titleTap(e) {
    //e:事件对象event
    //console.log(e)
    //获取当前点击的标题对应的下标
    var index = e.currentTarget.dataset.index;
    console.log(index)

    //取消上一个标题的激活状态
    for (var i = 0; i < this.data.costTitle.length; i++) {
      //第一种：将所有的数据都设置为非激活状态
      //this.data.costTitle[i].isAct = false;

      //第二种：找到激活的数据，将该数据设置为非激活状态
      if (this.data.costTitle[i].isAct) {
        this.data.costTitle[i].isAct = false;
        break; //找到激活数据则终止循环不再查找
      }
    }
    //   var type = this.data.costTitle[i].type;
    //   console.log("type==>", type)
    //   //切换标题时，查找对应类型的图标是否有激活的图标，有则取消激活
    //   for (var i = 0; i < this.data.bannerIcon[type].length; i++) {
    //     for (var j = 0; j< this.data.bannerIcon[type][i].length; j++) {
    //       if (this.data.bannerIcon[type][i][j].isAct) {
    //         this.data.bannerIcon[type][i][j].isAct = false;

    //       }
    //     }
    //   }


    //设置当前点击的标题为激活状态
    this.data.costTitle[index].isAct = true;

    //数据响应，重新更改视图层的数据
    this.setData({
      costTitle: this.data.costTitle
    })
    console.log(this.data.costTitle)
  },
  // 获取轮播图数据
  getIcon() {

    //调用云函数
    wx.cloud.callFunction({
      name: "get-icon",
      success: res => {
        console.log("获取图标数据成功==", res)
        //获取返回数据
        var data = res.result.data;
        console.log(data)

        //将数据分类 根据收入支出分
        var banner = {
          pay: [],
          income: []
        }

        //数据遍历，判断数据是收入图标还是支出图标
        data.forEach(v => {
          //给每条数据添加激活字段，判断当前的数据是否被激活,默认未激活状态s
          v.isAct = false;
          banner[v.type].push(v)
        })

        console.log(banner)

        //遍历对象 for in
        for (var k in banner) {
          console.log(banner[k])

          //开始截至下标
          var beginIndex = 0;

          ///条件循环语句
          while (beginIndex < banner[k].length) {
            var newArr = banner[k].slice(beginIndex, beginIndex + 8)
            // console.log("newArr=>",newArr)
            //将分割好的数组添加到bannerIcon上
            this.data.bannerIcon[k].push(newArr)

            //重新开始截取下标
            beginIndex += 8;
          }
        }
        console.log(this.data.bannerIcon)

        //数据响应，更改视图层的数据
        this.setData({
          bannerIcon: this.data.bannerIcon
        })
      },
      fail: err => {
        console.log("获取图标数据失败==", err)
      }
    })
  },
  //轮播图图标点击事件
  bannerIconTap(e) {

    //获取当前点击的图标类型
    var type = e.currentTarget.dataset.type;

    //获取当前点击的是第几个滑块对应的下标
    var index = e.currentTarget.dataset.index;
    //获取当前点击的是第几个图标对应的下标
    var id = e.currentTarget.dataset.id;
    console.log(type, index, id)

    if (this.data.bannerIcon[type][index][id].isAct) {
      //条件成立则说明当前点击的图标是激活状态
      this.data.bannerIcon[type][index][id].isAct = false;

      //设置激活数据为空
      this.data.actIcon.type = '';
      this.data.actIcon.index = '';
      this.data.actIcon.id = '';
    } else {
      //取消上一个标题的激活状态
      // for (var i = 0; i < this.data.bannerIcon[type].length; i++) {
      //   for (var b = 0; b < this.data.bannerIcon[type][i].length; b++) {
      //     //第一种：将所有的数据都设置为非激活状态


      //     //第二种：找到激活的数据，将该数据设置为非激活状态
      //     if (this.data.bannerIcon[type][i][b].isAct) {
      //       this.data.bannerIcon[type][i][b].isAct = false;
      //       break; //找到激活数据则终止循环不再查找
      //     }
      //   }
      // }

      //记录当前点击的图标的相关信息，然后直接根据激活信息取消激活
      if (this.data.actIcon.type != '') {
        this.data.bannerIcon[this.data.actIcon.type][this.data.actIcon.index][this.data.actIcon.id].isAct = false;
      }
      //设置当前点击的图标为激活状态
      this.data.bannerIcon[type][index][id].isAct = true;

      //设置当前激活的图标数据
      this.data.actIcon.type = type;
      this.data.actIcon.index = index;
      this.data.actIcon.id = id;
    }



    //数据响应
    this.setData({
      bannerIcon: this.data.bannerIcon
    })

  },
  //获取当天日期函数
  getToday() {
    //获取时间对象
    var time = new Date();
    //获取年份
    var y = time.getFullYear();
    console.log(y)
    //获取月
    var m = time.getMonth() + 1;
    console.log(m)
    //获取日
    var d = time.getDate();
    console.log(d)

    //数据响应
    this.setData({
      currentTime: y + "年" + this.addZero(m) + "月" + this.addZero(d) + "日",
      "info.data": y + "-" + this.addZero(m) + "-" + this.addZero(d),
      today: y + "-" + this.addZero(m) + "-" + this.addZero(d)
    })
  },
  //补零函数
  addZero(num) {
    return num < 10 ? "0" + num : num;
  },
  //获取用户选择信息
  getInfo(e) {
    console.log(e)

    //获取当前要修改的类型
    var type = e.currentTarget.dataset.type;
    console.log(type)

    //如果当前处理的是日期数据，则处理数据格式
    if (type == 'data') {
      //split():字符串分割方法，返回的是一个数组，参数：以某个字符进行分割
      var valArr = e.detail.value.split("-")
      console.log(valArr)

      this.data.currentTime = valArr[0] + "年" + valArr[1] + "月" + valArr[2] + "日";

    }
    this.data.info[type] = e.detail.value;

    console.log(this.data.info)
    //数据响应
    this.setData({
      currentTime: this.data.currentTime,
      info: this.data.info
    })
  },
  //保存按钮点击事件
  //添加一条记账记录到数据库
  addMsgData() {
    //存放所有用户的记账信息
    var msgData = {};

    //获取标题数据
    for (var i = 0; i < this.data.costTitle.length; i++) {
      if (this.data.costTitle[i].isAct) {
        //条件成立，则该标题是被用户选中的
        msgData.costName = this.data.costTitle[i].name;
        msgData.costType = this.data.costTitle[i].type;
        break; //找打数据终止循环
      }
    }
    //获取用户的选择的图标数据
    if (this.data.actIcon.type == "") {
      //用户没有选择图标，则不能保存数据
      wx.showToast({
        title: "请选择消费图标",
        icon: "error",
        mask: true,
        duration: 2000
      })

      return; //终止代码，以下代码不执行

    } else {
      //以上条件不成立，则说明用户选择了图标
      msgData.iconUrl = this.data.bannerIcon[this.data.actIcon.type][this.data.actIcon.index][this.data.actIcon.id].imgUrl;
      msgData.iconTitle = this.data.bannerIcon[this.data.actIcon.type][this.data.actIcon.index][this.data.actIcon.id].title;
    }

    //获取用户填写的金额 日期 备注
    for (var k in this.data.info) {
      msgData[k] = this.data.info[k]
    }
    //判断金额是否为空，如果为空则默认为0
    if(msgData.money==""){
      msgData.money="0.00";
    }

    //显示提示框
    wx.showLoading({
      title: '正在保存...',
      mask: true
    })
    //调用云函数，将数据添加到数据库上
    wx.cloud.callFunction({
      name: "add_msg_data",
      data: msgData,
      success: res => {
        console.log("添加数据成功=》", res)

        //数据保存成功，恢复页面
        this.resetData();

        //数据保存成功，关闭加载框
        wx.hideLoading();

        //数据保存成功跳转首页
        wx.switchTab({
          url: '../home/home'
        })

      },
      fail: err => {
        console.log("添加数据失败=》", err)
      }
    })

    console.log("msgData==>", msgData)
  },
  //重置页面数据
  resetData() {

    //重置标题数据
    this.data.costTitle[0].isAct = true;
    this.data.costTitle[1].isAct = false;

    //重置图标数据
    this.data.bannerIcon[this.data.actIcon.type][this.data.actIcon.index][this.data.actIcon.id].isAct = false;
    this.data.actIcon.type = "";
    this.data.actIcon.index = "";
    this.data.actIcon.id = "";

    //对当天日期进行分割获取年月日
    var timeArr=this.data.today.split("-")

    //数据响应
    this.setData({
      costTitle: this.data.costTitle,
      bannerIcon: this.data.bannerIcon,
      info:{
        money:"0.00",
        data:this.data.today,
        comment:""
      },
      currentTime:timeArr[0]+"年"+timeArr[1]+"月"+timeArr[2]+"日",
      currentNum:0
    })
  }

})