
let AI = {};
// 历史表
AI.historyTable = {};

//人工智能初始化
AI.init = function (pace) {
  let bill = AI.historyBill || com.gambit; //开局库
  if (bill.length) {
    let len = pace.length;
    let arr = [];
    //先搜索棋谱
    for (let i = 0; i < bill.length; i++) {
      if (bill[i].slice(0, len) == pace) {
        arr.push(bill[i]);
      }
    }
    if (arr.length) {
      let inx = Math.floor(Math.random() * arr.length);
      AI.historyBill = arr;
      return arr[inx].slice(len, len + 4).split("");
    } else {
      AI.historyBill = [];
    }

  }
  //如果棋谱里面没有，人工智能开始运作
  let initTime = new Date().getTime();
  AI.treeDepth = play.depth;
  //AI.treeDepth=4;

  AI.number = 0;
  AI.setHistoryTable.lenght = 0

  let val = AI.getAlphaBeta(-99999, 99999, AI.treeDepth, com.arr2Clone(play.map), play.my);
  //let val = AI.iterativeSearch(com.arr2Clone(play.map),play.my)
  if (!val || val.value == -8888) {
    AI.treeDepth = 2;
    val = AI.getAlphaBeta(-99999, 99999, AI.treeDepth, com.arr2Clone(play.map), play.my);
  }
  //let val = AI.iterativeSearch(com.arr2Clone(play.map),play.my);
  if (val && val.value != -8888) {
    let man = play.mans[val.key];
    let nowTime = new Date().getTime();
    let arr = [man.x, man.y, val.x, val.y];
    com.get("moveInfo").innerHTML = '<h3>AI搜索结果：</h3>最佳着法：' +
      com.createMove(com.arr2Clone(play.map), ...arr) +
      '<br />搜索深度：' + AI.treeDepth + '<br />搜索分支：' +
      AI.number + '个 <br />最佳着法评估：' +
      val.value + '分' +
      ' <br />搜索用时：' +
      (nowTime - initTime) + '毫秒'
    return arr;
  } else {
    return !1;
  }
}

// 迭代加深搜索着法
AI.iterativeSearch = function (map, my) {
  AI.treeDepth = 0;
  let initTime = new Date().getTime();
  for (let i = 1; i <= 8; i++) {
    let nowTime = new Date().getTime();
    AI.treeDepth = i;
    AI.aotuDepth = i;
    if (nowTime - initTime > 100) return AI.getAlphaBeta(-99999, 99999, AI.treeDepth, map, my);
  }
  return !1;
}

// 取得棋盘上所有棋子
AI.getMapAllMan = function (map, my) {
  let mans = [];
  map.forEach((sizes, y) => {
    sizes.forEach((key, x) => {
      if (key && play.mans[key].my == my) {
        play.mans[key].x = x;
        play.mans[key].y = y;
        mans.push(play.mans[key]);
      }
    })
  })
  return mans;
}

/* // 取得棋谱所有己方棋子的着法
AI.getMoves = function (map, my, txtMap) {
  let highMores = []; // 优先级高的着法
  let moves = [];
  AI.getMapAllMan(map, my).forEach(man => {
    man.bl(map).forEach(n => {
      let arr = [man.x, man.y, n[0], n[1], man.key];
      AI.historyTable[txtMap] ? highMores.push(arr) : moves.push(arr);
    });
  });
  return highMores.concat(moves);
} */

// 取得棋谱所有己方棋子的着法
AI.getMoves = function (map, my) {
  let manArr = AI.getMapAllMan(map, my);
  let moves = [];
  let foul = play.isFoul;
  for (let man of manArr) {
    for (let n of man.bl(map)) {
      let { x, y } = man;
      let [newX, newY] = n;
      //如果不是长将着法
      if (foul[0] != x || foul[1] != y || foul[2] != newX || foul[3] != newY) {
        moves.push([x, y, newX, newY, man.key]);
      }
    }
  }
  return moves;
}
// A:当前棋手value/B:对手value/depth：层级
AI.getAlphaBeta = function (A, B, depth, map, my) {
  // let txtMap = map.join();
  // let history = AI.historyTable[txtMap];
  // if (history && history.depth >= AI.treeDepth - depth + 1) {
  //   return history.value * my;
  // }
  if (depth == 0)
    return { "value": AI.evaluate(map, my) }; // 局面评价函数
  // 这里排序以后会增加效率
  let rootKey;
  let oldX, oldY, newX, newY, key;
  for ([oldX, oldY, newX, newY, key] of AI.getMoves(map, my)/* 生成全部走法 */) {
    // 走这个走法
    let clearKey = map[newY][newX] || "";

    map[newY][newX] = key;
    delete map[oldY][oldX];
    play.mans[key].x = newX;
    play.mans[key].y = newY;

    if (clearKey == "j0" || clearKey == "J0") { // 被吃老将,撤消这个走法; 
      undo();

      return { "key": key, "x": newX, "y": newY, "value": 8888 };
      // return rootKey; 
    } else {
      let val = -AI.getAlphaBeta(-B, -A, depth - 1, map, -my).value;
      // val = val || val.value;

      // 撤消这个走法;　 
      undo();
      if (val >= B) {
        // 将这个走法记录到历史表中; 
        // AI.setHistoryTable(txtMap,AI.treeDepth-depth+1,B,my);
        return { "key": key, "x": newX, "y": newY, "value": B };
      }
      if (val > A) {
        A = val; // 设置最佳走法; 
        if (AI.treeDepth == depth) rootKey = { "key": key, "x": newX, "y": newY, "value": A };
      }
    }
    function undo() {
      play.mans[key].x = oldX;
      play.mans[key].y = oldY;
      map[oldY][oldX] = key;
      delete map[newY][newX];
      if (clearKey) {
        map[newY][newX] = clearKey;
      }
    }
  }
  // 将这个走法记录到历史表中; 
  // AI.setHistoryTable(txtMap,AI.treeDepth-depth+1,A,my);
  if (AI.treeDepth == depth) { // 已经递归回根了
    if (!rootKey) {
      // AI没有最佳走法，说明AI被将死了，返回!1
      return !1;
    } else {
      // 这个就是最佳走法
      return rootKey;
    }
  }
  return { "key": key, "x": newX, "y": newY, "value": A };
}

// 奖着法记录到历史表
AI.setHistoryTable = function (txtMap, depth, value) {
  AI.setHistoryTable.lenght++;
  AI.historyTable[txtMap] = { depth, value }
}

// 评估棋局 取得棋盘双方棋子价值差
AI.evaluate = function (map, my) {
  let val = 0;
  map.forEach((keyList, i) => keyList.forEach((key, n) => key && (val += play.mans[key].value[i][n] * play.mans[key].my)));
  // val+=Math.floor( Math.random() * 10);  //让AI走棋增加随机元素
  // com.show()
  // z(val*my)
  AI.number++;
  return val * my;
}

// 评估棋局 取得棋盘双方棋子价值差
AI.evaluate1 = function (map, my) {
  let val = 0;
  for (let key in play.mans) {
    let man = play.mans[key];
    if (man.isShow) {
      val += man.value[man.y][man.x] * man.my;
    }
  }
  // val+=Math.floor( Math.random() * 10); // 让AI走棋增加随机元素
  // com.show();
  // z(val*my);
  AI.number++;
  return val * my;
}


