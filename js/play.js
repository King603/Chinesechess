
let play = {};

play.init = function () {
  play.my = 1; // 玩家方
  play.map = com.arr2Clone(com.initMap); // 初始化棋盘
  play.nowManKey = !1; // 现在要操作的棋子
  play.pace = []; // 记录每一步
  play.isPlay = !0; // 是否能走棋
  play.mans = com.mans;
  play.bylaw = com.bylaw;
  play.show = com.show;
  play.showPane = com.showPane;
  play.isOffensive = !0; // 是否先手
  play.depth = play.depth || 3; // 搜索深度
  play.isFoul = !1; // 是否犯规长将
  com.pane.isShow = !1; // 隐藏方块
  // 初始化棋子
  play.map.forEach((keyList, y) => {
    keyList.forEach((key, x) => {
      if (key) {
        com.mans[key].x = x;
        com.mans[key].y = y;
        com.mans[key].isShow = !0;
      }
    })
  });
  play.show();
  // 绑定点击事件
  com.canvas.addEventListener("click", play.clickCanvas)
  // clearInterval(play.timer);
  // com.get("autoPlay").addEventListener("click", function (e) {
  //   clearInterval(play.timer);
  //   play.timer = setInterval("play.AIPlay()", 1000);
  //   play.AIPlay();
  // });
  // com.get("offensivePlay").addEventListener("click", function (e) {
  //   play.isOffensive = !0;
  //   play.isPlay = !0;
  //   com.get("chessRight").style.display = "none";
  //   play.init();
  // });
  // com.get("defensivePlay").addEventListener("click", function (e) {
  //   play.isOffensive = !1;
  //   play.isPlay = !0;
  //   com.get("chessRight").style.display = "none";
  //   play.init();
  // });
  com.get("regretBn").addEventListener("click", function (e) {
    play.regret();
  });
  // let initTime = new Date().getTime();
  for (let i = 0; i <= 100000; i++) {
    let h = play.map.join();
    for (let key in play.mans) {
      if (play.mans[key].show) h += play.mans[key].key + play.mans[key].x + play.mans[key].y;
    }
  }
  // let nowTime = new Date().getTime();
  // z([h, nowTime - initTime]);
}

// 悔棋
play.regret = function () {
  let map = com.arr2Clone(com.initMap);
  // 初始化所有棋子
  map.forEach((keyList, y) => {
    keyList.forEach((key, x) => {
      if (key) {
        com.mans[key].x = x;
        com.mans[key].y = y;
        com.mans[key].isShow = !0;
      }
    })
  })
  let pace = play.pace;
  pace.pop();
  pace.pop();
  pace.forEach((arr, i) => {
    let p = arr.split("");
    let x = parseInt(p[0]);
    let y = parseInt(p[1]);
    let newX = parseInt(p[2]);
    let newY = parseInt(p[3]);
    let key = map[y][x];
    try {
      let cMan = map[newY][newX];
      if (cMan) com.mans[map[newY][newX]].isShow = !1;
      com.mans[key].x = newX;
      com.mans[key].y = newY;
      map[newY][newX] = key;
      delete map[y][x];
      if (i == pace.length - 1)
        com.showPane(newX, newY, x, y);
    } catch (e) {
      com.show();
      com.alert([key, p, pace, map]);
    }
  })
  play.map = map;
  play.my = 1;
  play.isPlay = !0;
  com.show();
}

//点击棋盘事件
play.clickCanvas = function (e) {
  if (!play.isPlay) return !1;
  let key = play.getClickMan(e);
  let { x, y } = play.getClickPoint(e);
  if (key) {
    play.clickMan(key, x, y);
  } else {
    play.clickPoint(x, y);
  }
  play.isFoul = play.checkFoul();//检测是不是长将
}

//点击棋子，两种情况，选中或者吃子
play.clickMan = function (key, x, y) {
  let man = com.mans[key];
  //吃子
  if (play.nowManKey && play.nowManKey != key && man.my != com.mans[play.nowManKey].my) {
    //man为被吃掉的棋子
    if (play.indexOfPs(com.mans[play.nowManKey].ps, [x, y])) {
      man.isShow = !1;
      let pace = com.mans[play.nowManKey].x + "" + com.mans[play.nowManKey].y
      //z(bill.createMove(play.map,man.x,man.y,x,y))
      delete play.map[com.mans[play.nowManKey].y][com.mans[play.nowManKey].x];
      play.map[y][x] = play.nowManKey;
      com.showPane(com.mans[play.nowManKey].x, com.mans[play.nowManKey].y, x, y)
      com.mans[play.nowManKey].x = x;
      com.mans[play.nowManKey].y = y;
      com.mans[play.nowManKey].alpha = 1
      play.pace.push(pace + x + y);
      play.nowManKey = !1;
      com.pane.isShow = !1;
      com.dot.dots = [];
      com.show()
      com.get("clickAudio").play();
      setTimeout(() => play.AIPlay(), 500);
      if (key == "j0") play.showWin(-1);
      if (key == "J0") play.showWin(1);
    }
    // 选中棋子
  } else if (man.my === 1) {
    if (com.mans[play.nowManKey]) com.mans[play.nowManKey].alpha = 1;
    man.alpha = .6;
    com.pane.isShow = !1;
    play.nowManKey = key;
    com.mans[key].ps = com.mans[key].bl(); //获得所有能着点
    com.dot.dots = com.mans[key].ps
    com.show();
    //com.get("selectAudio").start(0);
    com.get("selectAudio").play();
  }
}

// 点击着点
play.clickPoint = function (x, y) {
  let key = play.nowManKey;
  let man = com.mans[key];
  if (play.nowManKey) {
    if (play.indexOfPs(com.mans[key].ps, [x, y])) {
      // z(bill.createMove(play.map,man.x,man.y,x,y))
      delete play.map[man.y][man.x];
      play.map[y][x] = key;
      com.showPane(man.x, man.y, x, y);
      man.x = x;
      man.y = y;
      man.alpha = 1;
      play.pace.push(man.x + "" + man.y + x + y);
      play.nowManKey = !1;
      com.dot.dots = [];
      com.show();
      com.get("clickAudio").play();
      setTimeout("play.AIPlay()", 500);
    } else {
      // alert("不能这么走哦！")	
    }
  }
}

// Ai自动走棋
play.AIPlay = function () {
  play.my = -1;
  let pace = AI.init(play.pace.join(""));
  if (!pace) {
    play.showWin(1);
    return;
  }
  play.pace.push(pace.join(""));
  play.nowManKey = play.map[pace[1]][pace[0]];
  let key = play.map[pace[3]][pace[2]];
  key ? play.AIclickMan(key, pace[2], pace[3]) : play.AIclickPoint(pace[2], pace[3]);
  com.get("clickAudio").play();
}

// 检查是否长将
play.checkFoul = function () {
  let p = play.pace;
  let len = parseInt(p.length, 10);
  return len > 11 && p[len - 1] == p[len - 5] && p[len - 5] == p[len - 9] ? p[len - 4].split("") : !1;
}

play.AIclickMan = function (key, x, y) {
  // 吃子
  com.mans[key].isShow = !1;
  delete play.map[com.mans[play.nowManKey].y][com.mans[play.nowManKey].x];
  play.map[y][x] = play.nowManKey;
  play.showPane(com.mans[play.nowManKey].x, com.mans[play.nowManKey].y, x, y)
  com.mans[play.nowManKey].x = x;
  com.mans[play.nowManKey].y = y;
  play.nowManKey = !1;
  com.show()
  if (key == "j0") play.showWin(-1);
  if (key == "J0") play.showWin(1);
}

play.AIclickPoint = function (x, y) {
  let key = play.nowManKey;
  let man = com.mans[key];
  if (play.nowManKey) {
    delete play.map[com.mans[play.nowManKey].y][com.mans[play.nowManKey].x];
    play.map[y][x] = key;
    com.showPane(man.x, man.y, x, y)
    man.x = x;
    man.y = y;
    play.nowManKey = !1;
  }
  com.show();
}

play.indexOfPs = function (ps, xy) {
  for (let i of ps)
    if (i[0] == xy[0] && i[1] == xy[1]) return !0;
  return !1;
}

//获得点击的着点
play.getClickPoint = function (e) {
  let domXY = com.getDomXY(com.canvas);
  let x = Math.round((e.pageX - domXY.x - com.pointStartX - 20) / com.spaceX);
  let y = Math.round((e.pageY - domXY.y - com.pointStartY - 20) / com.spaceY);
  return { "x": x, "y": y }
}

//获得棋子
play.getClickMan = function (e) {
  let clickXY = play.getClickPoint(e);
  let x = clickXY.x;
  let y = clickXY.y;
  if (x < 0 || x > 8 || y < 0 || y > 9) return !1;
  return (play.map[y][x] && play.map[y][x] != "0") ? play.map[y][x] : !1;
}

play.showWin = function (my) {
  play.isPlay = !1;
  alert(my === 1 ? "恭喜你，你赢了！" : "很遗憾，你输了！");
}
