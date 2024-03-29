// 这个助手方法下面会用到，用来获取 css 相关属性值
const getAttr = (obj, key) =>
  obj.currentStyle
    ? obj.currentStyle[key]
    : window.getComputedStyle(obj, false)[key];

export const vDrag = {
  inserted(el) {
    /**
     * 这里是跟据 dialog 组件的 dom 结构来写的
     * target: dialog 组件的容器元素
     * header：dialog 组件的头部区域，也是就是拖拽的区域
     */
    const target = el;
    const header = target.children[0];

    // 鼠标手型
    header.style.cursor = "move";
    header.onmousedown = (e) => {
      // 记录按下时鼠标的坐标和目标元素的 left、top 值
      const currentX = e.clientX;
      const currentY = e.clientY;
      const left = parseInt(getAttr(target, "left"));
      const top = parseInt(getAttr(target, "top"));

      // 分别计算四个方向的边界值
      const maxLeft =
        parseInt(getAttr(document.body, "width")) -
        parseInt(getAttr(target, "width")) -
        25;

      const maxTop =
        parseInt(getAttr(document.body, "height")) -
        parseInt(getAttr(target, "height")) -
        45;

      console.log("object :>> ", maxLeft, maxTop);

      document.onmousemove = (event) => {
        // 鼠标移动时计算每次移动的距离，并改变拖拽元素的定位
        const disX = event.clientX - currentX;
        const disY = event.clientY - currentY;

        if (left + disX < 0) {
          // 吸附左侧
          target.style.left = `0px`;
        } else if (left + disX >= maxLeft) {
          // 吸附右侧
          target.style.left = `${maxLeft}px`;
        } else {
          target.style.left = `${left + disX}px`;
        }

        if (top + disY <= 0) {
          // 吸附顶部
          target.style.top = `0px`;
        } else if (top + disY >= maxTop) {
          // 吸附底部
          target.style.top = `${maxTop}px`;
        } else {
          target.style.top = `${top + disY}px`;
        }
        return false;
      };

      // 鼠标松开时，拖拽结束
      document.onmouseup = () => {
        document.onmousemove = null;
        document.onmouseup = null;
      };
    };
  },

  // 每次重新打开 dialog 时，要将其还原
  update(el) {
    const target = el.children[0];
    target.style.left = "";
    target.style.top = "";
  },

  // 最后卸载时，清除事件绑定
  unbind(el) {
    const header = el.children[0].children[0];
    header.onmousedown = null;
  },
};
