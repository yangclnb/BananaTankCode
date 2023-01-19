# BananaCodeTank

🪖一款基于 **ES6 + canvas** 的坦克对战平台，其区别于传统的坦克大战的主要因素在于并非通过玩家的键鼠控制坦克的各种行为，而是通过代码执行各种函数从而实现控制坦克在特定的事件触发时按照玩家的代码让坦克执行特定的操作。在这个过程中玩家可以更好的了解 **ES6** 中的语法以及新特性，从而达到学习的目的。


## 初始化坦克
想要初始化坦克非常简单，只需要调用`UserTank.create()`方法即可，其中需要的参数有以下几项
``` javascript
UserTank.create(
    options, //坦克基本配置
    run,     //坦克最基本的运行逻辑
    scannedRobot, //发现敌人后的行为
    hitWall,      //撞墙后的行为
    hitByBullet   //被击中后的行为
  );
```
### options配置
正如上面说讲的，options的内容是坦克的基本配置，其中包含**坦克的颜色**，**初始角度**以及**出生点的位置**。
+ **color** : 但由于贴图的绘制有限，目前可供用户选择的颜色只有 red yellow green blue 四种选择
+ **initDirection** : 初始的朝向，也就是生成坦克是坦克正面的朝向，*BananaCodeTank*的坐标系具体划分可以看下面关于**坐标系**的内容
+ **initPosition** : 坦克出生点的象限，按照数学意义上的象限划分。比如此处我输入的是`initPosition: 1`，那么我的出生点就是在地图右上角的位置也就是第一象限。
``` javascript
// 初始化配置
const options = {
  color: "red", //坦克颜色
  initDirection: 230, // 坦克初始朝向，输入角度
  initPosition: 1, //初始位置，按照象限划分
};
```

### run

### scannedRobot

### hitWall

### hitByBullet

### 坐标系

在正式开始驾驶我们的坦克之前，让我们先了解一下 *BananaCodeTank* 中的坐标系

![坦克坐标](https://pic.imgdb.cn/item/63c3f7f2be43e0d30ee8d6b2.png#pic_center)

图中原点o作为坦克的中心点，当坦克从 *平行于x轴* 时，它的角度就是是 *0°*。而从 *平行于x轴* 的状态旋转到上图中的状态后（向左/逆时针 旋转），那它当前的角度就是 *x°*，同理可知向右（顺时针）旋转 *-X°* 可以让上图中的坦克重回平行于x轴的状态。

## 移动
+ 前进
``` javascript
// 前进100个单位
this.ahead(100)

// 后退100个单位
this.ahead(-100)
```
+ 后退
``` javascript
// 后退100个单位
this.back(100)

// 前进100个单位
this.back(-100)
```

## 旋转
+ 坦克旋转
+ 炮口旋转
+ 雷达旋转

## 开炮

## 讲垃圾话

## 敌我判断

## 行为重复

## 事件
+ 常规运动
+ 撞墙
+ 撞到坦克
+ 被击中
+ 击中敌方坦克
+ 扫描到敌人


