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

// 座標を指定して状態を取得
function get(x, y) {
	return board[x * 8 + y]
}

function boardClear() {
	for(var i = 0; i < 64; i += 1) {
		board[i] = 0;
	}
	updateBoard()
}


// ボードの初期化
function initialBoard() {
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
				message("conputer thinking");
				setTimeout(conputerThinking, 1);
			}
			
		}
	}
}

function conputerThinking() {
	if(puttables.length == 0) {
		finishGame();
		return
	}
	var place = choiceBest(color, 3)[0];
	putStone(place[0], place[1], color);
	reverse(place[0], place[1], color);
	color *= -1;
	
	updateBoard();
	updatePuttable(color);
	
	thinking = false;
	message("");
				
	if(puttables.length == 0) {
		color *= -1;
		updatePuttable(color);
		thinking = true;
		message("conputer thinking");
		setTimeout(conputerThinking, 1);
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
	message("ゲーム終了\n" + "黒: " + black + "\n白: " + white);
	
}

function message(text) {
	document.getElementById("finish").innerHTML = text;
}

// AI的な
var importance = new Array(64);
for (var i = 0; i < 64; i++) {
	importance[i] = 1;
}

importance =
	[64, 4, 16, 16, 16, 16, 4, 64,
	 4, -32, 8,  8,  8,  8, -32, 4,
	 16, 8, 32,  4,  4,  32, 8, 16,
	 16, 8, 4,   4,  4,   4, 8, 16,
	 16, 8, 4,   4,  4,   4, 8, 16,
	 16, 8, 32,  4,  4,  32, 8, 16,
	 4, -32, 8,  8,  8,  8, -32, 4,
	 64, 4, 16, 16, 16, 16,  4, 64]

function evalBoard(color, depth) {
	if(depth < 1) {
		var black = updatePuttable(1);
		var white = updatePuttable(-1);

		var score = (black.length - white.length) * color * 16
		for(var i = 0; i < 64; i++) {
			score += importance[i] * board[i]
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


	// もとの状態に戻す
	board = board_return;
	color_cp = color_return;

	return [best_place, best_score]
}


function vsCP(color_p) {
	initialBoard();
	if(color_p == 1) {
		c.removeEventListener("click", PvP);
		c.addEventListener("click", PvE);
	} else {
		c.removeEventListener("click", PvP);
		place = choiceBest(1, 0)[0];
		putStone(place[0], place[1], 1);
		reverse(place[0], place[1], 1);
		updateBoard();
		updatePuttable(-1);
		color = -1;
		c.addEventListener("click", PvE);
		
	}
	
}

// 実行
function main() {
	initialBoard();
	c.addEventListener("click", PvP);
}

main();
