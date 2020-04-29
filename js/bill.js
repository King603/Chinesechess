let bill = {
  // 初始化
  init() {
    if (com.store) {
      clearInterval(bill.timer);
      bill.setBillList(com.arr2Clone(com.initMap)); // 写入棋谱列表
      play.isPlay = !1;
      com.show();
    } else bill.timer = setInterval(() => bill.init(), 300);
  },
  // 把所有棋谱写入棋谱列表
  setBillList(map) {
    let list = com.get("billList")
    for (let num = 0; num < com.store.length; num++) {
      let option = document.createElement("option");
      option.text = "棋谱" + (num + 1);
      option.value = num;
      list.add(option, null);
    }
    list.addEventListener("change", function () {
      bill.setBox(com.store[this.value], map);
    });
    bill.setBox(com.store[0], map);
  },
  // 棋谱分析 写入
  setMove(bl, index, map) {
    map = com.arr2Clone(map);
    map.forEach(({ forEach }, y) => forEach((key, x) => {
      if (key) {
        com.mans[key].x = x;
        com.mans[key].y = y;
        com.mans[key].isShow = !0;
      }
    }));
    for (let i = 0; i <= index; i++) {
      let n = i * 4;
      let y = bl[n + 1];
      let newX = bl[n + 2];
      let x = bl[n + 0];
      let newY = bl[n + 3];
      if (com.mans[map[newY][newX]])
        com.mans[map[newY][newX]].isShow = !1;
      com.mans[map[y][x]].x = newX;
      com.mans[map[y][x]].y = newY;
      if (i == index)
        com.showPane(x, y, newX, newY);
      map[newY][newX] = map[y][x];
      delete map[y][x];
    }
    return map;
  },
  // 写入棋谱
  setBox(bl, initMap) {
    bl = bl.split("");
    let h = "";
    for (let i = 0; i < bl.length; i += 4)
      h += `<li id="move_${i / 4})">${com.createMove(com.arr2Clone(initMap), bl[i + 0], bl[i + 1], bl[i + 2], bl[i + 3])}</li>`;
    let billBox = com.get("billBox");
    billBox.innerHTML = h;
    billBox.getElementsByTagName("li").forEach(li => {
      li.addEventListener("click", function () {
        bill.setMove(bl, this.getAttribute("id").split("_")[1], initMap);
        com.show();
      });
    });
  }
};