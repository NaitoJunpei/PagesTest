var i = 1

var c = document.getElementById("test")
var ctx = c.getContext("2d");

// １マスの大きさ
var SQUARE_SIZE = 32

ctx.fillStyle = "green";
ctx.fillRect(0, 0, SQUARE_SIZE * 8, SQUARE_SIZE * 8);

var board = new Array(64); // ボード
var color; // 現在の石の色
var puttables; // 石を置ける位置の配列

//棋譜を記録する
var kifu = new Array();

// 座標を指定して状態を取得
function get(x, y) {
	return board[x * 8 + y]
}

function boardClear() {
	for(var i = 0; i < 64; i += 1) {
		board[i] = 0;
	}
	// updateBoard()
}


// ボードの初期化
function initialBoard() {
	kifu = [];
	boardClear();
	putStone(3, 3, 1);
	putStone(3, 4, -1);
	putStone(4, 3, -1);
	putStone(4, 4, 1);
	updateBoard();
	color = 1;
	updatePuttable(color);
	message("");
	thinking = false;
}

// 人間同士の対戦
function PvP(e) {
	var x = parseInt(e.layerX / SQUARE_SIZE);
	var y = parseInt(e.layerY / SQUARE_SIZE);
	if(puttable(x, y, color)) {
		kifu.push([x, y, color]);
		putStone(x, y, color);
		reverse(x, y, color);
		updateBoard();
		color *= -1
		updatePuttable(color);
		if(puttables.length == 0) {
			color *= -1;
			updatePuttable(color);
			if(puttables.length == 0) {
				finishGame();
			}
		}
	}
}

var thinking = false; // コンピュータが思考中であるフラグ

// コンピュータと対戦
function PvE(e) {
	if(thinking == false) {
		var x = parseInt(e.layerX / SQUARE_SIZE);
		var y = parseInt(e.layerY / SQUARE_SIZE);
		if(puttable(x, y, color)) {
			kifu.push([x, y, color]);
			// if(predicted_place[0] != x | predicted_place[1] != y) {
			// 	updateImportance();
			// }
			putStone(x, y, color);
			reverse(x, y, color);
			updateBoard();
			color *= -1
			updatePuttable(color);
			if(puttables.length == 0) {
				color *= -1;
				updatePuttable(color);
				if(puttables.length == 0) {
					finishGame();
				}
			} else {
				thinking = true;
				message("computer thinking");
				setTimeout(computerThinking, 1);
			}
			
		}
	}
}

function computerThinking() {
	if(puttables.length == 0) {
		finishGame();
		return
	}
	var place;
	var value;
	[place, value] = choiceBest(color, 3);
	console.log(value);
	putStone(place[0], place[1], color);
	reverse(place[0], place[1], color);
	kifu.push([place[0], place[1], color]);
	color *= -1;
	
	updateBoard();
	updatePuttable(color);

	// importanceの更新を導入してみる

	thinking = false;
	message("");
				
	if(puttables.length == 0) {
		color *= -1;
		updatePuttable(color);
		thinking = true;
		message("computer thinking");
		setTimeout(computerThinking, 1);
	}
}

	
// ボードのグラフィックの更新
function updateBoard() {
	for(var x = 0; x < 8; x += 1) {
		for(var y = 0; y < 8; y += 1) {
			if(get(x, y) == 1) {
				// 黒が置かれている時
				ctx.fillStyle = "black";
				ctx.beginPath();
				ctx.arc(x * SQUARE_SIZE + SQUARE_SIZE / 2, y * SQUARE_SIZE + SQUARE_SIZE / 2, SQUARE_SIZE / 2 - 1, 0, Math.PI * 2, true);
				ctx.fill();
			}
			if(get(x, y) == -1) {
				// 白が置かれている時
				ctx.fillStyle = "white";
				ctx.beginPath();
				ctx.arc(x * SQUARE_SIZE + SQUARE_SIZE / 2, y * SQUARE_SIZE + SQUARE_SIZE / 2, SQUARE_SIZE / 2 - 1, 0, Math.PI * 2, true);
				ctx.fill();
			}
			if(get(x, y) == 0) {
				// 石が置かれていない時
				ctx.fillStyle = "green";
				ctx.fillRect(x * SQUARE_SIZE, y * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
				ctx.strokeRect(x * SQUARE_SIZE, y * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
			}
				
		}
	}
}


xi = 0
function test() {
	if (xi == 64) {
		boardClear();
		xi = 0;
		updateBoard();
		return
	}
	putStone(parseInt(xi / 8), xi % 8, 1);
	xi += 1;
	updateBoard();
}

// 石を置く
function putStone(x, y, color) {
	board[x * 8 + y] = color;
}

// 石をひっくり返す
function reverse(x, y, color) {
	miniReverse(-1, -1);
	miniReverse(0, -1);
	miniReverse(1, -1);
	miniReverse(-1, 0);
	miniReverse(1, 0);
	miniReverse(-1, 1);
	miniReverse(0, 1);
	miniReverse(1, 1);

	function miniReverse(dx, dy) {
		if (miniPuttable(x, y, dx, dy, color)) {
			for (var i = 1; get(x + dx * i, y + dy * i) * color == -1; i += 1) {
				putStone(x + dx * i, y + dy * i, color);
			}
		}
	}
		
}

// 石を置ける場所か判定
function puttable(x, y, color) {
	// 石がないか
	flag = get(x, y) == 0 && (
	// 左上をチェック
	miniPuttable(x, y, -1, -1, color) || 
	// 上をチェック
	miniPuttable(x, y, 0, -1, color) ||
	// 右上をチェック
	miniPuttable(x, y, 1, -1, color) || 
	// 左をチェック
	miniPuttable(x, y, -1, 0, color) ||
	// 右をチェック
	miniPuttable(x, y, 1, 0, color) ||
	// 左下をチェック
	miniPuttable(x, y, -1, 1, color) ||
	// 下をチェック
	miniPuttable(x, y, 0, 1, color) ||
	// 右下をチェック
	miniPuttable(x, y, 1, 1, color));
	

	return flag;
}

function miniPuttable(x, y, dx, dy, color) {
	// 方向を一つ決め、その方向に石を置けるか確かめる
	if(get(x + dx, y + dy) * color == -1) {
		// 石が違う色
		for(var i = 2; (x + dx * i > -1) && (x + dx * i < 8) && (y + dy * i > -1) && (y + dy * i < 8); i += 1) {
			temp = get(x + dx * i, y + dy * i) * color;
			if(temp == 1) {
				return true
			}
			
			if(temp == 0) {
				return false
			}
		}
	}
	return false
}

function updatePuttable(color) {
	puttables = [];
	for(var x = 0; x < 8; x += 1) {
		for(var y = 0; y < 8; y += 1) {
			if(puttable(x, y, color)) {
				puttables.push([x, y])

				ctx.fillStyle = "yellow";
				ctx.beginPath();
				ctx.arc(x * SQUARE_SIZE + SQUARE_SIZE / 2, y * SQUARE_SIZE + SQUARE_SIZE / 2, 2, 0, Math.PI * 2, true);
				ctx.fill();
				
			}
		}
	}
	return puttables
}

function finishGame() {
	var black = 0;
	var white = 0;
	for(var i = 0; i < 64; i += 1) {
		if(board[i] == 1) {
			black += 1;
		}
		if(board[i] == -1) {
			white += 1;
		}
	}
	updateImportance(black - white);
	making_kifu = false;
	message("ゲーム終了\n" + "黒: " + black + "\n白: " + white);
	
}

function message(text) {
	document.getElementById("finish").innerHTML = text;
}

// AI的な
// Experiments with Multi-ProbCut and a New High-Quality Evaluation Function for Othelloに記載されている(らしい)Logistelloを参考にパターン作成
// 大量の棋譜が必要となることが考えられるため、かなり単純な形に置き換える
function makeArray(n) {
	res = new Array(n);
	for (var i = 0; i < n; i++) {
		res[i] = 0
	}

	return res
}

var hor_vert1 = makeArray(81);
var corner2x2 = makeArray(81);
var diag = makeArray(81);
var ensemble = [1, 1, 1, 1, 1, 1]

/* 一番最初に作ったもの
var importance = new Array(17);
for (var i = 0; i < 17; i++) {
	importance[i] = 1;
}

importance =
	[64, 4, 16, 16,
	 4, -32, 8,  8,
	 16, 8, 32,  4,
	 16, 8, 4,   4,
	 16]
*/
function logistic(x) {
	return 1 / (1 + Math.exp(-x))
}

// 盤面を評価する
function evalBoard(color, depth) {
	if(depth < 1) {
		var score = 0;
		var i
		// hor_vert1
		score += hor_vert1[(board[0] + 1) * 27 + (board[1] + 1) * 9 + (board[2] + 1) * 3 + (board[3] + 1)] * ensemble[0] * color
		score += hor_vert1[(board[0 * 8] + 1) * 27 + (board[1 * 8] + 1) * 9 + (board[2 * 8] + 1) * 3 + (board[3 * 8] + 1)] * ensemble[0] * color
		score += hor_vert1[(board[7] + 1) * 27 + (board[6] + 1) * 9 + (board[5] + 1) * 3 + (board[4] + 1)] * ensemble[0] * color
		score += hor_vert1[(board[7 * 8] + 1) * 27 + (board[6 * 8] + 1) * 9 + (board[5 * 8] + 1) * 3 + (board[4 * 8] + 1)] * ensemble[0] * color
		score += hor_vert1[(board[7 * 8 + 0] + 1) * 27 + (board[7 * 8 + 1] + 1) * 9 + (board[7 * 8 + 2] + 1) * 3 + (board[7 * 8 + 3] + 1)] * ensemble[0] * color
		score += hor_vert1[(board[0 * 8 + 7] + 1) * 27 + (board[1 * 8 + 7] + 1) * 9 + (board[2 * 8 + 7] + 1) * 3 + (board[3 * 8 + 7] + 1)] * ensemble[0] * color
		score += hor_vert1[(board[7 * 8 + 7] + 1) * 27 + (board[7 * 8 + 6] + 1) * 9 + (board[7 * 8 + 5] + 1) * 3 + (board[7 * 8 + 4] + 1)] * ensemble[0] * color
		score += hor_vert1[(board[7 * 8 + 7] + 1) * 27 + (board[6 * 8 + 7] + 1) * 9 + (board[5 * 8 + 7] + 1) * 3 + (board[4 * 8 + 7] + 1)] * ensemble[0] * color

		// corner2x2
		score += corner2x2[(board[0] + 1) * 27 + (board[1] + 1) * 9 + (board[1 * 8] + 1) * 3 + (board[1 * 8 + 1] + 1)] * ensemble[1] * color
		score += corner2x2[(board[7] + 1) * 27 + (board[6] + 1) * 9 + (board[1 * 8 + 7] + 1) * 3 + (board[1 * 8 + 6] + 1)] * ensemble[1] * color
		score += corner2x2[(board[7 * 8] + 1) * 27 + (board[7 * 8 + 1] + 1) * 9 + (board[6 * 8] + 1) * 3 + (board[6 * 8 + 1] + 1)] * ensemble[1] * color
		score += corner2x2[(board[7 * 8 + 7] + 1) * 27 + (board[7 * 8 + 6] + 1) * 9 + (board[6 * 8 + 7] + 1) * 3 + (board[6 * 8 + 6] + 1)] * ensemble[1] * color

		// diag
		score += diag[(board[0] + 1) * 27 + (board[1 * 8 + 1] + 1) * 9 + (board[2 * 8 + 2] + 1) * 3 + (board[3 * 8 + 3] + 1)] * ensemble[5] * color;
		score += diag[(board[7] + 1) * 27 + (board[1 * 8 + 6] + 1) * 9 + (board[2 * 8 + 5] + 1) * 3 + (board[3 * 8 + 4] + 1)] * ensemble[5] * color;
		score += diag[(board[7 * 8 + 7] + 1) * 27 + (board[6 * 8 + 6] + 1) * 9 + (board[5 * 8 + 5] + 1) * 3 + (board[4 * 8 + 4] + 1)] * ensemble[5] * color;
		score += diag[(board[7 * 8] + 1) * 27 + (board[6 * 8 + 1] + 1) * 9 + (board[5 * 8 + 2] + 1) * 3 + (board[4 * 8 + 3] + 1)] * ensemble[5] * color;

		// 置ける場所の数
		var black = updatePuttable(1);
		var white = updatePuttable(-1);

		score += (black.length - white.length) * ensemble[2] * color;

		// 四隅
		score += (board[0] + board[7] + board[7 * 8] + board[7 * 8 + 7]) * ensemble[3] * color;

		// 石の合計数
		stones = 0
		for (var i = 0; i < 64; i++) {
			stones += board[i];
		}
		score += stones * color * ensemble[4]

		/* for(var x = 0; x < 4; x++) {
			for(var y = 0; y < 4; y++) {
				score += importance[x * 4 + y] * (board[x * 8 + y] +  board[x * 8 + (7 - y)] + board[(7 - x) * 8 + y] + board[(7 - x) * 8 + (7 - y)]) *	color;
			}
			} */

		if (score > 64) {
			score = 64;
		}
		if (score < -64) {
			score = -64;
		}
		
		return score
	} else {
		res = choiceBest(color * -1, depth - 1)[1];
		return res * -1;
	}
}

function choiceBest(color_cp, depth) {
	// 現在のボードを保存
	var board_return = board.concat();
	var color_return = color_cp
	var puttables_return = puttables.concat();

	var puttables_temp = updatePuttable(color);

	var best_score;
	var best_place;

	var len = puttables_temp.concat().length
	if(len == 0) {
		best_score = evalBoard(color_cp, depth);
		best_place = [];
	} else {
		for(var index = 0; index < len; index++) {
			var place = puttables[index];
			var x = place[0];
			var y = place[1];

			//仮置き
			putStone(x, y, color_cp);
			reverse(x, y, color_cp);
			score_temp = evalBoard(color_cp, depth);
			
			if(score_temp > best_score || best_score == undefined) {
				best_score = score_temp;
				best_place = [x, y];
			}
			board = board_return.concat();
			puttables = puttables_temp.concat();
		}
	}


	// もとの状態に戻す
	board = board_return;
	color_cp = color_return;

	return [best_place, best_score]
}

// importanceの更新を行う
// 最終盤面のスコアを予測値とし、誤差逆伝播法で更新する

function updateImportance(score) {
	console.log("update");
	epsilon = 0.001; //学習係数
	boardClear();
	putStone(3, 3, 1);
	putStone(3, 4, -1);
	putStone(4, 3, -1);
	putStone(4, 4, 1);
	
	for(var i = 0; i < kifu.length; i++) {
		var x, y;
		[x, y, color] = kifu[i];
		putStone(x, y, color);
		reverse(x, y, color);
		var temp_score = evalBoard(1, 0);
		var error = temp_score - score;
		console.log(temp_score, score);

		var score_hov = 0;
		score_hov += hor_vert1[(board[0] + 1) * 27 + (board[1] + 1) * 9 + (board[2] + 1) * 3 + (board[3] + 1)]
		score_hov += hor_vert1[(board[0 * 8] + 1) * 27 + (board[1 * 8] + 1) * 9 + (board[2 * 8] + 1) * 3 + (board[3 * 8] + 1)]
		score_hov += hor_vert1[(board[7] + 1) * 27 + (board[6] + 1) * 9 + (board[5] + 1) * 3 + (board[4] + 1)]
		score_hov += hor_vert1[(board[7 * 8] + 1) * 27 + (board[6 * 8] + 1) * 9 + (board[5 * 8] + 1) * 3 + (board[4 * 8] + 1)]
		score_hov += hor_vert1[(board[7 * 8 + 0] + 1) * 27 + (board[7 * 8 + 1] + 1) * 9 + (board[7 * 8 + 2] + 1) * 3 + (board[7 * 8 + 3] + 1)]
		score_hov += hor_vert1[(board[0 * 8 + 7] + 1) * 27 + (board[1 * 8 + 7] + 1) * 9 + (board[2 * 8 + 7] + 1) * 3 + (board[3 * 8 + 7] + 1)]
		score_hov += hor_vert1[(board[7 * 8 + 7] + 1) * 27 + (board[7 * 8 + 6] + 1) * 9 + (board[7 * 8 + 5] + 1) * 3 + (board[7 * 8 + 4] + 1)]
		score_hov += hor_vert1[(board[7 * 8 + 7] + 1) * 27 + (board[6 * 8 + 7] + 1) * 9 + (board[5 * 8 + 7] + 1) * 3 + (board[4 * 8 + 7] + 1)]

		var score_corner2x2 = 0;
		score_corner2x2 += corner2x2[(board[0] + 1) * 27 + (board[1] + 1) * 9 + (board[1 * 8] + 1) * 3 + (board[1 * 8 + 1] + 1)]
		score_corner2x2 += corner2x2[(board[7] + 1) * 27 + (board[6] + 1) * 9 + (board[1 * 8 + 7] + 1) * 3 + (board[1 * 8 + 6] + 1)]
		score_corner2x2 += corner2x2[(board[7 * 8] + 1) * 27 + (board[7 * 8 + 1] + 1) * 9 + (board[6 * 8] + 1) * 3 + (board[6 * 8 + 1] + 1)]
		score_corner2x2 += corner2x2[(board[7 * 8 + 7] + 1) * 27 + (board[7 * 8 + 6] + 1) * 9 + (board[6 * 8 + 7] + 1) * 3 + (board[6 * 8 + 6] + 1)]

		var score_diag = 0;
		score_diag += diag[(board[0] + 1) * 27 + (board[1 * 8 + 1] + 1) * 9 + (board[2 * 8 + 2] + 1) * 3 + (board[3 * 8 + 3] + 1)]
		score_diag += diag[(board[7] + 1) * 27 + (board[1 * 8 + 6] + 1) * 9 + (board[2 * 8 + 5] + 1) * 3 + (board[3 * 8 + 4] + 1)]
		score_diag += diag[(board[7 * 8 + 7] + 1) * 27 + (board[6 * 8 + 6] + 1) * 9 + (board[5 * 8 + 5] + 1) * 3 + (board[4 * 8 + 4] + 1)]
		score_diag += diag[(board[7 * 8] + 1) * 27 + (board[6 * 8 + 1] + 1) * 9 + (board[5 * 8 + 2] + 1) * 3 + (board[4 * 8 + 3] + 1)]
		

		// hor_vert1
		hor_vert1[(board[0] + 1) * 27 + (board[1] + 1) * 9 + (board[2] + 1) * 3 + (board[3] + 1)] -= error * ensemble[0] * epsilon;
		hor_vert1[(board[0 * 8] + 1) * 27 + (board[1 * 8] + 1) * 9 + (board[2 * 8] + 1) * 3 + (board[3 * 8] + 1)] -= error * ensemble[0] * epsilon;
		hor_vert1[(board[7] + 1) * 27 + (board[6] + 1) * 9 + (board[5] + 1) * 3 + (board[4] + 1)] -= error * ensemble[0] * epsilon;
		hor_vert1[(board[7 * 8] + 1) * 27 + (board[6 * 8] + 1) * 9 + (board[5 * 8] + 1) * 3 + (board[4 * 8] + 1)] -= error * ensemble[0] * epsilon;
		hor_vert1[(board[7 * 8 + 0] + 1) * 27 + (board[7 * 8 + 1] + 1) * 9 + (board[7 * 8 + 2] + 1) * 3 + (board[7 * 8 + 3] + 1)] -= error * ensemble[0] * epsilon;
		hor_vert1[(board[0 * 8 + 7] + 1) * 27 + (board[1 * 8 + 7] + 1) * 9 + (board[2 * 8 + 7] + 1) * 3 + (board[3 * 8 + 7] + 1)] -= error * ensemble[0] * epsilon;
		hor_vert1[(board[7 * 8 + 7] + 1) * 27 + (board[7 * 8 + 6] + 1) * 9 + (board[7 * 8 + 5] + 1) * 3 + (board[7 * 8 + 4] + 1)] -= error * ensemble[0] * epsilon;
		hor_vert1[(board[7 * 8 + 7] + 1) * 27 + (board[6 * 8 + 7] + 1) * 9 + (board[5 * 8 + 7] + 1) * 3 + (board[4 * 8 + 7] + 1)] -= error * ensemble[0] * epsilon;


		hor_vert1[(-board[0] + 1) * 27 + (-board[1] + 1) * 9 + (-board[2] + 1) * 3 + (-board[3] + 1)] += error * ensemble[0] * epsilon;
		hor_vert1[(-board[0 * 8] + 1) * 27 + (-board[1 * 8] + 1) * 9 + (-board[2 * 8] + 1) * 3 + (-board[3 * 8] + 1)] += error * ensemble[0] * epsilon;
		hor_vert1[(-board[7] + 1) * 27 + (-board[6] + 1) * 9 + (-board[5] + 1) * 3 + (-board[4] + 1)] += error * ensemble[0] * epsilon;
		hor_vert1[(-board[7 * 8] + 1) * 27 + (-board[6 * 8] + 1) * 9 + (-board[5 * 8] + 1) * 3 + (-board[4 * 8] + 1)] += error * ensemble[0] * epsilon;
		hor_vert1[(-board[7 * 8 + 0] + 1) * 27 + (-board[7 * 8 + 1] + 1) * 9 + (-board[7 * 8 + 2] + 1) * 3 + (-board[7 * 8 + 3] + 1)] += error * ensemble[0] * epsilon;
		hor_vert1[(-board[0 * 8 + 7] + 1) * 27 + (-board[1 * 8 + 7] + 1) * 9 + (-board[2 * 8 + 7] + 1) * 3 + (-board[3 * 8 + 7] + 1)] += error * ensemble[0] * epsilon;
		hor_vert1[(-board[7 * 8 + 7] + 1) * 27 + (-board[7 * 8 + 6] + 1) * 9 + (-board[7 * 8 + 5] + 1) * 3 + (-board[7 * 8 + 4] + 1)] += error * ensemble[0] * epsilon;
		hor_vert1[(-board[7 * 8 + 7] + 1) * 27 + (-board[6 * 8 + 7] + 1) * 9 + (-board[5 * 8 + 7] + 1) * 3 + (-board[4 * 8 + 7] + 1)] += error * ensemble[0] * epsilon;

		// corner2x2
		corner2x2[(board[0] + 1) * 27 + (board[1] + 1) * 9 + (board[1 * 8] + 1) * 3 + (board[1 * 8 + 1] + 1)] -= error * ensemble[1] * epsilon;
		corner2x2[(board[7] + 1) * 27 + (board[6] + 1) * 9 + (board[1 * 8 + 7] + 1) * 3 + (board[1 * 8 + 6] + 1)] -= error * ensemble[1] * epsilon;
		corner2x2[(board[7 * 8] + 1) * 27 + (board[7 * 8 + 1] + 1) * 9 + (board[6 * 8] + 1) * 3 + (board[6 * 8 + 1] + 1)] -= error * ensemble[1] * epsilon;
		corner2x2[(board[7 * 8 + 7] + 1) * 27 + (board[7 * 8 + 6] + 1) * 9 + (board[6 * 8 + 7] + 1) * 3 + (board[6 * 8 + 6] + 1)] -= error * ensemble[1] * epsilon;

		corner2x2[(-board[0] + 1) * 27 + (-board[1] + 1) * 9 + (-board[1 * 8] + 1) * 3 + (-board[1 * 8 + 1] + 1)] += error * ensemble[1] * epsilon;
		corner2x2[(-board[7] + 1) * 27 + (-board[6] + 1) * 9 + (-board[1 * 8 + 7] + 1) * 3 + (-board[1 * 8 + 6] + 1)] += error * ensemble[1] * epsilon;
		corner2x2[(-board[7 * 8] + 1) * 27 + (-board[7 * 8 + 1] + 1) * 9 + (-board[6 * 8] + 1) * 3 + (-board[6 * 8 + 1] + 1)] += error * ensemble[1] * epsilon;
		corner2x2[(-board[7 * 8 + 7] + 1) * 27 + (-board[7 * 8 + 6] + 1) * 9 + (-board[6 * 8 + 7] + 1) * 3 + (-board[6 * 8 + 6] + 1)] += error * ensemble[1] * epsilon;

		// diag
		diag[(board[0] + 1) * 27 + (board[1 * 8 + 1] + 1) * 9 + (board[2 * 8 + 2] + 1) * 3 + (board[3 * 8 + 3] + 1)] -= error * ensemble[5] * epsilon;
		diag[(board[7] + 1) * 27 + (board[1 * 8 + 6] + 1) * 9 + (board[2 * 8 + 5] + 1) * 3 + (board[3 * 8 + 4] + 1)] -= error * ensemble[5] * epsilon;
		diag[(board[7 * 8 + 7] + 1) * 27 + (board[6 * 8 + 6] + 1) * 9 + (board[5 * 8 + 5] + 1) * 3 + (board[4 * 8 + 4] + 1)] -= error * ensemble[5] * epsilon;
		diag[(board[7 * 8] + 1) * 27 + (board[6 * 8 + 1] + 1) * 9 + (board[5 * 8 + 2] + 1) * 3 + (board[4 * 8 + 3] + 1)] -= error * ensemble[5] * epsilon;
		
		diag[(-board[0] + 1) * 27 + (-board[1 * 8 + 1] + 1) * 9 + (-board[2 * 8 + 2] + 1) * 3 + (-board[3 * 8 + 3] + 1)] += error * ensemble[5] * epsilon;
		diag[(-board[7] + 1) * 27 + (-board[1 * 8 + 6] + 1) * 9 + (-board[2 * 8 + 5] + 1) * 3 + (-board[3 * 8 + 4] + 1)] += error * ensemble[5] * epsilon;
		diag[(-board[7 * 8 + 7] + 1) * 27 + (-board[6 * 8 + 6] + 1) * 9 + (-board[5 * 8 + 5] + 1) * 3 + (-board[4 * 8 + 4] + 1)] += error * ensemble[5] * epsilon;
		diag[(-board[7 * 8] + 1) * 27 + (-board[6 * 8 + 1] + 1) * 9 + (-board[5 * 8 + 2] + 1) * 3 + (-board[4 * 8 + 3] + 1)] += error * ensemble[5] * epsilon;
	
		ensemble[0] -= error * epsilon * score_hov;
		ensemble[1] -= error * epsilon * score_corner2x2;
		ensemble[5] -= error * epsilon * score_diag;

		var black = updatePuttable(1);
		var white = updatePuttable(-1);

		ensemble[2] -= error * epsilon * (black.length - white.length);
		ensemble[3] -= error * epsilon * (board[0] + board[7] + board[7 * 8] + board[7 * 8 + 7]); 
		var stones = 0;
		for(var j = 0; j < 64; j++) {
			stones += board[j];
		}
		ensemble[4] -= error * epsilon * stones;

	}
	updateBoard();
}


/* 
function updateImportance(x, y) {
	console.log("update")

	// 現在のボードを保存
	var board_return = board.concat();

	var len = puttables.length
	for(var index = 0; index < len; index++) {
		var x_temp = puttables[index][0];
		var y_temp = puttables[index][1];
		var weight;

		if ((x == x_temp) & (y == y_temp)) {
			weight = len - 1;
		} else {
			weight = -1;
		}
		putStone(x_temp, y_temp, color);
		reverse(x_temp, y_temp, color);

		// 更新

		for (var xx = 0; xx < 4; xx++) {
			for(var yy = 0; yy < 4; yy++) {
				importance[xx * 4 + yy] += (board[xx * 8 + yy] + board[xx * 8 + (7 - yy)] + board[(7 - xx) * 8 + yy] + board[(7 - xx) * 8 + (7 - yy)]) * color * weight;
			}
		}
		board = board_return.concat()
	}
	var black = updatePuttable(1);
	var white = updatePuttable(-1);

	importance[16] += (black.length - white.length) * color;
} */


function vsCP(color_p) {
	initialBoard();
	if(color_p == 1) {
		updateBoard();
		updatePuttable(1)
		c.removeEventListener("click", PvP);
		c.addEventListener("click", PvE);
	} else {
		c.removeEventListener("click", PvP);
		place = choiceBest(1, 0)[0];
		putStone(place[0], place[1], 1);
		reverse(place[0], place[1], 1);
		kifu.push([place[0], place[1], 1]);
		updateBoard();
		updatePuttable(-1);
		color = -1;
		c.addEventListener("click", PvE);
		
	}
	
}

function vsP() {
	initialBoard()
	c.removeEventListener("click", PvE);
	c.addEventListener("click", PvP);
}

// コンピュータ同士の対戦
// n回繰り返し、棋譜を生成する
var making_kifu = false
function makeKifu(n) {
	c.removeEventListener("click", PvE);
	c.removeEventListener("click", PvP);
	making_kifu = true;
	initialBoard()
	while(making_kifu) {
		computerThinking();
	}
	setTimeout(makeKifu(n-1), 10);
}

// 実行
function main() {
	initialBoard();
	c.addEventListener("click", PvP);
}

main();
