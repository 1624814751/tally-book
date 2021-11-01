// miniprogram/pages/home/home.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    arr: ["a", "b", "c", "e", "f", "g"],
    currenMonth: "", //当前选择的月份，默认是当月
    monCost: {
      pay: 0,
      income: 0
    },
    //某月结余
    surplus: 0,
    //某月数据
    monthArr: [],
    //判断当前是否有数据
    hasData: false,
    //判断页面是否首次进入，默认是
    isOnload:true
  },
  onLoad() {
    //调用函数，获取月份信息
    this.getMonth();
    //调用函数，获取月份数据
    this.getMsgData(this.data.currenMonth);
  },
  // 生命周期函数--监听页面显示
  onShow: function () {
    if (this.data.isOnload) {
      //条件处理则说明页面是首次进入，则不执行函数
      this.data.isOnload = false;
    } else {
      //调用函数，获取月份信息
      this.getMonth();
      //调用函数，获取月份数据
      this.getMsgData(this.data.currenMonth);
    }
  },
  //跳转到记账页面事件
  toRecord() {
    wx.navigateTo({
      url: '../record/record'
    })
  },
  //获取当月信息
  getMonth() {
    //获取时间对象
    var time = new Date();

    //获取年份
    var y = time.getFullYear();

    //获取月份
    var m = time.getMonth() + 1;

    //数据响应
    this.setData({
      currenMonth: this.addZero(m) + "/" + y
    })
  },
  //补零函数
  addZero(num) {
    return num < 10 ? "0" + num : num;
  },
  //选择月份事件
  selectMonth(e) {
    console.log(e)

    var monArr = e.detail.value.split("-");
    console.log(monArr)

    //数据响应
    this.setData({
      currenMonth: monArr[1] + "/" + monArr[0]
    })
    //根据选择日期获取对应数据
    this.getMsgData(this.data.currenMonth);
  },
  //获取月份数据
  getMsgData(month) {
    //2021-04-01<=数据的日期<=2021-04-30
    //获取某月的数据原理：只要数据库集合的数据日期在该月的1号到该月的最后一天范围之内，则该条数据符合该月数据的要求

    var dateArr = month.split("/")
    //console.log(dateArr)

    //获取当月的第一天日期
    var start = dateArr[1] + "-" + dateArr[0] + "-01"
    console.log(start)
    //console.log(new Date(2021, 4, 0).getDate())//某月有多少天
    //获取该月份有多少天
    var dayNum = new Date(dateArr[1], dateArr[0], 0).getDate();
    //获取当月最后一天的日期
    var end = dateArr[1] + "-" + dateArr[0] + "-" + dayNum;
    console.log(end)
    //清空月份的总收入和总支出
    this.data.monCost.pay = 0;
    this.data.monCost.income = 0;


    //清空本地缓存
    wx.clearStorage();
    //显示加载框
    wx.showLoading({
      title: '正在加载...',
      mask: true
    })


    //调用云函数
    wx.cloud.callFunction({
      name: "get_msg_data",
      data: {
        startTime: start,
        endTime: end
      },
      success: res => {
        //  console.log("获取数据成功==》",res)

        //成功获取数据，关闭加载框
        wx.hideLoading();

        //获取返回的数据
        var data = res.result.data;
        console.log(data)

        //判断获取数据长度是否大于0，如果是则说明有数据，反之则没有数据
        if (data.length > 0) {
          //条件成立，说明有数据
          this.data.hasData = true;
        } else {
          //条件不成立，没有数据
          this.data.hasData = false;
        }

        //声明时间数组，存放一个月里消费的日期
        var timeArr = [];

        //遍历数据，累加总收入和支出
        data.forEach(v => {
          console.log(v)
          //将每条数据存储在本地缓存里
          wx.setStorage({
            data: v,
            key: v._id,
          })
          //  获取一个月里有哪一天是有消费的，判断该日期是否存在时间数组里，如果存在则说明该日期已经有消费记录，不存在则说明以前没有消费记录则需要将该日期添加到时间数组里
          //indexOf（查询元素），数组/字符串的查询元素方法，如果将该数组/字符串存在该元素则放回元素对应的下标，反之不存在则返回-1
          if (timeArr.indexOf(v.data) == -1) {
            timeArr.push(v.data)
          }

          this.data.monCost[v.costType] += Number(v.money);
        })
        //console.log(timeArr);
        //计算结余
        var surNum = Number(this.data.monCost.income) - Number(this.data.monCost.pay)
        //累加完成，强制保留两个小数位

        //保留小数位方法
        this.data.monCost.pay = Number(this.data.monCost.pay).toFixed(2);
        this.data.monCost.income = Number(this.data.monCost.income).toFixed(2);

        //处理月份数据结构
        var monthData = [];
        //将时间数组的元素从大到小排列
        //sort()数组排列方法，默认按照字符大小从小到大进行排列
        //reverse()颠倒数组排序方法
        timeArr.sort().reverse();
        console.log(timeArr);

        //遍历时间数组，根据时间生产对象，一个对象代表一天
        timeArr.forEach(v => {
          //v:当前日期
          //存放一天数据信息
          var dayData = {};
          //获取日期
          var arr = v.split("-");
          dayData.date = arr[0] + "年" + Number(arr[1]) + "月" + Number(arr[2]) + "日";

          switch (new Date(v).getDay()) {
            case 0:
              dayData.week = "星期日";
              break;
            case 1:
              dayData.week = "星期一";
              break;
            case 2:
              dayData.week = "星期二";
              break;
            case 3:
              dayData.week = "星期三";
              break;
            case 4:
              dayData.week = "星期四";
              break;
            case 5:
              dayData.week = "星期五";
              break;
            case 6:
              dayData.week = "星期六";
              break;
          }
          //累加一天的总收入支出
          dayData.pay = 0;
          dayData.income = 0;

          //存放一天所有的消费记录
          dayData.info = [];
          //遍历数据，累加金额
          data.forEach(x => {
            if (x.data == v) {
              dayData.info.push(x);
              dayData[x.costType] += Number(x.money);
            }
          })
          //强制收入支出保留两个小数位
          dayData.pay = dayData.pay.toFixed(2);
          dayData.income = dayData.income.toFixed(2);

          //将每天数据添加到monthData
          monthData.push(dayData);


          console.log(dayData);
        })

        //数据响应
        this.setData({
          monCost: this.data.monCost,
          surplus: surNum.toFixed(2),
          monthArr: monthData,
          hasData: this.data.hasData
        })
      },
      fail: err => {
        console.log("获取数据失败==》", err)
      }
    })
  },
  //点击跳转到详情页的事件
  navToDetail(e){
    // console.log(e)
    //获取点击的列表对应的_id
    var id=e.currentTarget.dataset.index;
    console.log(id)
    //跳转到详情页
    wx.navigateTo({
      url: "../detail/detail?_id="+id
    })
  }
})