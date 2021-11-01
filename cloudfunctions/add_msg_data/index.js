// 云函数入口文件
const cloud = require('wx-server-sdk')

//云函数初始化
cloud.init()
//云函数数据库引用
const db = cloud.database()


// 云函数入口函数
exports.main = async (event, context) => {
  console.log("event==>", event)
  return await db.collection("msg-data").add({
    data: event
  })
}