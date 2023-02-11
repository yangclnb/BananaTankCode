# BananaCodeTank

🪖一款基于 **ES6 + canvas** 的坦克对战平台，其区别于传统的坦克大战的主要因素在于并非通过玩家的键鼠控制坦克的各种行为，而是通过代码执行各种函数从而实现控制坦克在特定的事件触发时按照玩家的代码让坦克执行特定的操作。在这个过程中玩家可以更好的了解 **ES6** 中的语法以及新特性，从而达到学习的目的。




## 坐标系

在正式开始驾驶我们的坦克之前，让我们先了解一下 *BananaCodeTank* 中的坐标系

![坦克坐标](https://pic.imgdb.cn/item/63c3f7f2be43e0d30ee8d6b2.png#pic_center)

图中原点o作为坦克的中心点，当坦克从 *平行于x轴* 时，它的角度就是是 *0°*。而从 *平行于x轴* 的状态旋转到上图中的状态后（向左/逆时针 旋转），那它当前的角度就是 *x°*，同理可知向右（顺时针）旋转 *-X°* 可以让上图中的坦克重回平行于x轴的状态。

## 初始化坦克
想要初始化坦克非常简单，只需要调用`UserTank.create()`方法即可，其中需要的参数有以下几项
``` javascript
// tank的运动方法
const run = ()=> {
};

// 发现敌人时触发
const scannedRobot = ()=>{
}

// 撞墙时触发
const hitWall = ()=>{
}

// 被击中时触发
const hitByBullet = ()=>{
}

// 初始化配置
const options = {
  color: "red", // 坦克颜色 red | green | blue | yellow
  initDirection: 230, // 坦克初始朝向，输入角度
  initPosition: 1, // 初始位置，按照象限划分
  loopRun: true, // 是否循环执行run函数
};

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
  color: "red", // 坦克颜色 red | green | blue | yellow
  initDirection: 230, // 坦克初始朝向，输入角度
  initPosition: 1, // 初始位置，按照象限划分
  loopRun: false, // 是否循环执行run函数
};
```

### run
初始化坦克传入的第二个参数是`run`函数，其主要的作用是让我们的坦克在为触发任何事件时控制其进行活动，因在一系列事件的优先级中`run`的优先级是最低的。接下来我们看一个该函数的实例。
```javascript
const run = ()=> {
  ahead(400);  // 向前移动400个单位
  tankTurn(-45); // 坦克自身向右旋转45°
  back(400) // 向后移动400个单位
};
```
在以上的实例中，我们的坦克的运动轨迹是**先向前移动400个单位，接着坦克自身向右旋转45°，最后向后移动400个单位**
在这里突然出现的`ahead`、`tank-turn`、之类的方法可能会使你有些措不及防，但不用担心，他们的出现只是为了这里的`run`更加的合理，具体控制坦克的API后续都会有详细的介绍。
### scannedRobot
初始化坦克传入的第二个参数是`scannedRobot`函数，顾名思义，它的出现是为了让我们可以在坦克的 *雷达扫描到敌方单位后* 可以进行一系列我们预设的行为。同样我们可以看一下该函数的实例。
```javascript
// 发现敌人时触发
const scannedRobot = ()=>{ 
      console.log(enemyAngle()); // 打印敌人的角度
      say("我已经发现你了"); // 向敌方喊话
      continualScan(); // 恢复扫描
}
```
在以上的实例中，当我们的坦克雷达扫描到敌方单位时会**大喊一声“我已经发现你了”**，随后接着扫描。
该函数可以调用一个`enemyAngle()`返回敌人相对于自身的角度。因此我们就可以配合系统提供的API`getCurrentCannonAngle()`获取我们当前炮口的角度从而校准炮口位置，从而进行对敌方单位的攻击。
你可能注意到了，在扫描的最后我们调用了`continualScan()`，它的作用是在执行完`scannedRobot`后恢复雷达的扫描行为，**若是我们不调用该方法则我们的坦克在后续的行动中将无法旋转雷达**，因为雷达扫描到敌方单位的优先级是高于`run`的。

### hitWall
初始化坦克传入的第三个参数是`hitWall`函数，它的出现是为了让我们可以在坦克 *撞击墙壁后* 可以进行一系列我们预设的行为。
```javascript
// 撞墙时触发
const hitWall = ()=>{
  say("怎么撞墙了");
  back(30);
  tankTurn(45);
}
```
在上面的示例中，我们完成了一个最基本的`hitWall`回调，当我们的坦克撞墙时会**先说“怎么撞墙了？”，接着往回退30个单位，最后坦克车身向左转45°**。

### hitByBullet
初始化坦克需要传入的第最后个参数是`hitByBullet`，它可以让我们在坦克 *被敌方单位击中后* 可以进行一系列我们预设的行为。
```javascript
// 被击中时触发
const hitByBullet = ()=>{
  say("我申气呢");
}
```
## 行为API
上面我们已经了解了初始化坦克的必要参数，这些传入的函数中有许多控制坦克行为API，接下来我们一起看看  **TankCode** 提供的各种行为控制API...

### 移动
+ 前进
``` javascript
// 前进100个单位
ahead(100)

// 后退100个单位
ahead(-100)
```
+ 后退
``` javascript
// 后退100个单位
back(100)

// 前进100个单位
back(-100)
```

### 旋转
+ 坦克旋转
``` javascript
// 向左旋转45°
tankTurn(45)

// 向右旋转45°
tankTurn(-45)
```
+ 炮口旋转
``` javascript
// 向左旋转45°
cannonTurn(45)

// 向右旋转45°
cannonTurn(-45)
```
+ 雷达旋转
``` javascript
// 向左旋转45°
radarTurn(45)

// 向右旋转45°
radarTurn(-45)
```

### 开炮
每次开炮之后都需要耗费时间重新装填弹药，我的可以调用`getCannnonReloadTime()`查看装填所需的总时间，`getLastLaunchTime()` 可以查看上次发射炮弹的时间，通过判断当前时间`Date.now()`减去发射时间`getLastLaunchTime()`是否大于等于所需的装填时间`getCannnonReloadTime()`，来确定本次是否可以射出炮弹
``` javascript
// 判断是否可以发射
if (Date.now() - getLastLaunchTime() >= getCannnonReloadTime()){
  // 朝当前炮管朝向发射炮弹
  fire()
}
```

### 喊话
``` javascript
say("Hello TankCode")
```

### 继续扫描
它的作用是在执行完`scannedRobot`后恢复雷达的扫描行为，**若是我们不调用该方法则我们的坦克在后续的行动中将无法旋转雷达**，因为雷达扫描到敌方单位的优先级是高于`run`的。
``` javascript
continualScan();
```

### 行为重复
你可能已经注意到了，坦克在 `run` 方法里的运动结束之后，就会停止。如果我们想运动多次地执行，最简单的方式只需要一个 for 循环。例如下面的代码将使坦克进行三次的来回运动
``` javascript
for(let i = 0; i < 3; i++){
  tankTurn(180)
  ahead(300)
}
```
有时候可能多次的循环运动还不足够，如果我们想让运动无限地循环执行，这时使用`while(true)`的死循环是不可取的，因为其会阻塞主线程的运行。这时候我们可以在初始化坦克的配置中将`loopRun`更改为`true`，使坦克的行为无限重复run函数中的行为。
``` javascript
const options = {
  ...
  loopRun: true, // 是否循环执行run函数
};
```
### 事件优先级
```javascript
// 事件及其优先级
export const event_priority = {
  run: 1,
  runCallback: 5,
  scannedRobot: 10,
  hitTank: 20,
  hitWall: 30,
  hitByBullet: 40,
};
```


