window.__require = function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var b = o.split("/");
        b = b[b.length - 1];
        if (!t[b]) {
          var a = "function" == typeof __require && __require;
          if (!u && a) return a(b, !0);
          if (i) return i(b, !0);
          throw new Error("Cannot find module '" + o + "'");
        }
        o = b;
      }
      var f = n[o] = {
        exports: {}
      };
      t[o][0].call(f.exports, function(e) {
        var n = t[o][1][e];
        return s(n || e);
      }, f, f.exports, e, t, n, r);
    }
    return n[o].exports;
  }
  var i = "function" == typeof __require && __require;
  for (var o = 0; o < r.length; o++) s(r[o]);
  return s;
}({
  BlastGame: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "1bb97YsETRMy5ys8C6Ls5Mj", "BlastGame");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.BlastGame = void 0;
    var GameEvent_1 = require("../GameEvent");
    var GameState_1 = require("./enums/GameState");
    var InputState_1 = require("./enums/InputState");
    var BlastGame = function() {
      function BlastGame(input, board, score, moves, spawner, shuffle, matches, gravity, superTiles, boosters, preGameProcessors, postGameProcessors, preProcessors, clickProcessors, postProcessors, tileRemovedProcessors) {
        this.onStateChanged = new GameEvent_1.GameEvent();
        this.onInputStateChanged = new GameEvent_1.GameEvent();
        this.onTurnFinished = new GameEvent_1.GameEvent();
        this.onGameStarted = new GameEvent_1.GameEvent();
        this.onGameFinished = new GameEvent_1.GameEvent();
        this._state = GameState_1.GameState.GAME;
        this._inputState = InputState_1.InputState.NORMAL;
        this.input = input;
        this.board = board;
        this.score = score;
        this.moves = moves;
        this.spawner = spawner;
        this.shuffle = shuffle;
        this.matches = matches;
        this.gravity = gravity;
        this.superTiles = superTiles;
        this.boosters = boosters;
        this._lastTurnContext = this.createTurnCtx();
        this._preGameProcessors = preGameProcessors;
        this._postGameProcessors = postGameProcessors;
        this._preTurnProcessors = preProcessors;
        this._clickProcessors = clickProcessors;
        this._postTurnProcessors = postProcessors;
        this._tileRemovedProcessors = tileRemovedProcessors;
        this.boosters.init(this);
      }
      Object.defineProperty(BlastGame.prototype, "lastTurnContext", {
        get: function() {
          return this._lastTurnContext;
        },
        enumerable: false,
        configurable: true
      });
      BlastGame.prototype.getState = function() {
        return this._state;
      };
      BlastGame.prototype.getInputState = function() {
        return this._inputState;
      };
      BlastGame.prototype.setInputState = function(state) {
        this._inputState = state;
        this.onInputStateChanged.invoke(this._inputState);
      };
      BlastGame.prototype.start = function() {
        var effects = new Array();
        for (var _i = 0, _a = this._preGameProcessors; _i < _a.length; _i++) {
          var preGameProc = _a[_i];
          effects.push(preGameProc.onPreGame(this));
        }
        this.onGameStarted.invoke(effects);
        this.input.onTileClicked.subscribe(this.processTurn, this);
      };
      BlastGame.prototype.finish = function() {
        this.input.onTileClicked.unsubscribe(this.processTurn, this);
        var effects = new Array();
        for (var _i = 0, _a = this._postGameProcessors; _i < _a.length; _i++) {
          var postGameProc = _a[_i];
          effects.push(postGameProc.onPostGame(this));
        }
        this.onGameFinished.invoke(effects);
        this.reset();
      };
      BlastGame.prototype.processTurn = function(pos) {
        if (!this.input.isEnabled) return;
        this._lastTurnContext = this.createTurnCtx();
        var tile = this.board.getTile(pos.x, pos.y);
        if (!tile || tile.isEmpty) return;
        this._lastTurnContext.selectedTile = tile;
        var effects = new Array();
        for (var _i = 0, _a = this._preTurnProcessors; _i < _a.length; _i++) {
          var preTurnProc = _a[_i];
          preTurnProc.canProcess(this._lastTurnContext) && effects.push(preTurnProc.onPreTurn(this._lastTurnContext));
        }
        for (var _b = 0, _c = this._clickProcessors; _b < _c.length; _b++) {
          var clickProcessor = _c[_b];
          clickProcessor.canProcess(this._lastTurnContext) && effects.push(clickProcessor.onTileClick(this._lastTurnContext));
        }
        for (var _d = 0, _e = Array.from(this._lastTurnContext.tilesToRemove); _d < _e.length; _d++) {
          var deletedTile = _e[_d];
          this.board.removeTile(deletedTile);
        }
        for (var _f = 0, _g = this._tileRemovedProcessors; _f < _g.length; _f++) {
          var tileDeteledProcessor = _g[_f];
          tileDeteledProcessor.canProcess(this._lastTurnContext) && effects.push(tileDeteledProcessor.onTileRemoved(this._lastTurnContext));
        }
        for (var _h = 0, _j = this._postTurnProcessors; _h < _j.length; _h++) {
          var postProcessor = _j[_h];
          postProcessor.canProcess(this._lastTurnContext) && effects.push(postProcessor.onPostTurn(this._lastTurnContext));
        }
        this.onTurnFinished.invoke(effects);
      };
      BlastGame.prototype.reset = function() {
        this.setInputState(InputState_1.InputState.NORMAL);
        this._lastTurnContext = null;
        this.score.reset();
        this.moves.reset();
        this.boosters.reset();
        this.board.clear();
      };
      BlastGame.prototype.setState = function(state) {
        this._state = state;
        this.onStateChanged.invoke(this._state);
      };
      BlastGame.prototype.createTurnCtx = function() {
        return {
          getState: this.getState.bind(this),
          setState: this.setState.bind(this),
          getInputState: this.getInputState.bind(this),
          setInputState: this.setInputState.bind(this),
          selectedTile: null,
          spawner: this.spawner,
          board: this.board,
          matches: this.matches,
          initialRemovedCount: 0,
          tilesToRemove: new Set(),
          tilesToCreate: new Set()
        };
      };
      return BlastGame;
    }();
    exports.BlastGame = BlastGame;
    cc._RF.pop();
  }, {
    "../GameEvent": "GameEvent",
    "./enums/GameState": "GameState",
    "./enums/InputState": "InputState"
  } ],
  BoardView: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "ccdd2EI3lROVpmUTBoeVb+M", "BoardView");
    "use strict";
    var __extends = this && this.__extends || function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || {
          __proto__: []
        } instanceof Array && function(d, b) {
          d.__proto__ = b;
        } || function(d, b) {
          for (var p in b) Object.prototype.hasOwnProperty.call(b, p) && (d[p] = b[p]);
        };
        return extendStatics(d, b);
      };
      return function(d, b) {
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    }();
    var __decorate = this && this.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if ("object" === typeof Reflect && "function" === typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) (d = decorators[i]) && (r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r);
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.BoardView = void 0;
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var BoardView = function(_super) {
      __extends(BoardView, _super);
      function BoardView() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this._tileViews = [];
        return _this;
      }
      BoardView.prototype.init = function(board, input, tileViewPool, tileSize, tileSpacing) {
        this._tileViewPool = tileViewPool;
        this._board = board;
        this._input = input;
        this._tileSize = tileSize;
        this._tileSpacing = tileSpacing;
        for (var x = 0; x < this._board.width; x++) {
          this._tileViews[x] = [];
          for (var y = 0; y < this._board.height; y++) this._tileViews[x][y] = null;
        }
      };
      BoardView.prototype.onEnable = function() {
        this.clickNode.on(cc.Node.EventType.TOUCH_END, this.onTouch, this);
      };
      BoardView.prototype.onDisable = function() {
        this.clickNode.off(cc.Node.EventType.TOUCH_END, this.onTouch, this);
      };
      BoardView.prototype.getTileView = function(x, y) {
        if (x >= 0 && x < this._board.width && y >= 0 && y < this._board.height) return this._tileViews[x][y];
        return null;
      };
      BoardView.prototype.reset = function() {
        for (var x = 0; x < this._board.width; x++) {
          this._tileViews[x] = [];
          for (var y = 0; y < this._board.height; y++) {
            null != this._tileViews[x][y] && this._tileViewPool.put(this._tileViews[x][y]);
            this._tileViews[x][y] = null;
          }
        }
      };
      BoardView.prototype.onTouch = function(event) {
        var touchPos = event.getLocation();
        var gridPos = this.worldToGridPos(touchPos);
        cc.log("\u041a\u043b\u0438\u043a \u0432 \u043c\u0438\u0440\u043e\u0432\u044b\u0445 \u043a\u043e\u043e\u0440\u0434\u0438\u043d\u0430\u0442\u0430\u0445: (" + touchPos.x + ", " + touchPos.y + ")");
        cc.log("\u041a\u043e\u043d\u0432\u0435\u0440\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u043e \u0432 \u0441\u0435\u0442\u043a\u0443: (" + gridPos.x + ", " + gridPos.y + ")");
        var tile = this._board.getTile(gridPos.x, gridPos.y);
        tile ? cc.log("\u0422\u0430\u0439\u043b \u043d\u0430\u0439\u0434\u0435\u043d: \u0446\u0432\u0435\u0442=" + tile.color + ", isEmpty=" + tile.isEmpty) : cc.log("\u0422\u0430\u0439\u043b \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d (\u0432\u043d\u0435 \u0433\u0440\u0430\u043d\u0438\u0446)");
        this.isValidPosition(gridPos.x, gridPos.y) && this._input.invokeTileClick({
          x: gridPos.x,
          y: gridPos.y
        });
      };
      BoardView.prototype.isValidPosition = function(x, y) {
        return x >= 0 && x < this._board.width && y >= 0 && y < this._board.height;
      };
      BoardView.prototype.createTileView = function(tile) {
        if (null == tile) return null;
        var view = this._tileViewPool.get(tile);
        view.node.position = this.gridToWorldPos(tile.x, tile.y);
        this.tiles.addChild(view.node);
        return view;
      };
      BoardView.prototype.gridToWorldPos = function(x, y) {
        var startX = -this._board.width * (this._tileSize + this._tileSpacing) / 2 + this._tileSize / 2;
        var startY = -this._board.height * (this._tileSize + this._tileSpacing) / 2 + this._tileSize / 2;
        return cc.v3(startX + x * (this._tileSize + this._tileSpacing), startY + y * (this._tileSize + this._tileSpacing), 0);
      };
      BoardView.prototype.worldToGridPos = function(worldPos) {
        var localPos = this.tiles.convertToNodeSpaceAR(worldPos);
        var startX = -this._board.width * (this._tileSize + this._tileSpacing) / 2 + this._tileSize / 2;
        var startY = -this._board.height * (this._tileSize + this._tileSpacing) / 2 + this._tileSize / 2;
        var x = Math.floor((localPos.x - startX + this._tileSize / 2) / (this._tileSize + this._tileSpacing));
        var y = Math.floor((localPos.y - startY + this._tileSize / 2) / (this._tileSize + this._tileSpacing));
        return {
          x: x,
          y: y
        };
      };
      BoardView.prototype.animateTileRemoval = function(tiles) {
        var _this = this;
        return new Promise(function(resolve) {
          if (0 === tiles.length) {
            resolve();
            return;
          }
          var completed = 0;
          var duration = .3;
          var _loop_1 = function(tile) {
            var tileView = _this.getTileView(tile.x, tile.y);
            if (tileView) tileView.node.runAction(cc.sequence(cc.spawn(cc.scaleTo(duration, 0), cc.fadeOut(duration)), cc.callFunc(function() {
              _this._tileViews[tile.x][tile.y] = null;
              _this._tileViewPool.put(tileView);
              completed++;
              completed === tiles.length && resolve();
            }))); else {
              completed++;
              completed === tiles.length && resolve();
            }
          };
          for (var _i = 0, tiles_1 = tiles; _i < tiles_1.length; _i++) {
            var tile = tiles_1[_i];
            _loop_1(tile);
          }
        });
      };
      BoardView.prototype.animateSuperTileCreation = function(superTile) {
        var _this = this;
        return new Promise(function(resolve) {
          if (!superTile) {
            resolve();
            return;
          }
          var x = superTile.x;
          var y = superTile.y;
          var tileView = _this.createTileView(superTile);
          _this._tileViews[x][y] = tileView;
          if (!tileView) {
            resolve();
            return;
          }
          tileView.node.scale = 0;
          var duration = .4;
          tileView.node.runAction(cc.sequence(cc.spawn(cc.fadeIn(.3 * duration), cc.scaleTo(.3 * duration, 1).easing(cc.easeBackOut())), cc.callFunc(function() {
            resolve();
          })));
        });
      };
      BoardView.prototype.animateGravity = function(movements) {
        var _this = this;
        return new Promise(function(resolve) {
          if (!movements || 0 === movements.length) {
            resolve();
            return;
          }
          var completed = 0;
          var duration = .1;
          movements.forEach(function(move) {
            var tileView = _this._tileViews[move.x][move.fromY];
            if (tileView) {
              _this._tileViews[move.x][move.fromY] = null;
              var updatedTile = _this._board.getTile(move.x, move.toY);
              if (updatedTile) {
                _this._tileViews[move.x][move.toY] = tileView;
                cc.log("  \u041e\u0431\u043d\u043e\u0432\u043b\u0435\u043d \u0432\u043d\u0443\u0442\u0440\u0435\u043d\u043d\u0438\u0439 tile TileView: (" + updatedTile.x + ", " + updatedTile.y + ")");
              }
              var newWorldPos = _this.gridToWorldPos(move.x, move.toY);
              tileView.node.runAction(cc.sequence(cc.moveTo(duration, newWorldPos.x, newWorldPos.y).easing(cc.easeIn(2)), cc.callFunc(function() {
                completed++;
                completed === movements.length && resolve();
              })));
            } else {
              completed++;
              completed === movements.length && resolve();
            }
          });
        });
      };
      BoardView.prototype.animateHideTiles = function() {
        var _this = this;
        return new Promise(function(resolve) {
          if (0 === _this._tileViews.length) {
            resolve();
            return;
          }
          var completed = 0;
          var duration = .4;
          var centerX = Math.floor(_this._board.width / 2);
          var centerY = Math.floor(_this._board.height / 2);
          for (var x = 0; x < _this._board.width; x++) for (var y = 0; y < _this._board.height; y++) {
            var tileView = _this.getTileView(x, y);
            if (tileView) {
              var distance = Math.abs(x - centerX) + Math.abs(y - centerY);
              var delay = .05 * distance;
              tileView.node.runAction(cc.sequence(cc.delayTime(delay), cc.spawn(cc.scaleTo(duration, 0).easing(cc.easeIn(2)), cc.fadeOut(duration), cc.rotateBy(duration, 180)), cc.callFunc(function() {
                completed++;
                completed == _this._tileViews.length && resolve();
              })));
            }
          }
        });
      };
      BoardView.prototype.animateNewTiles = function(newTiles) {
        var _this = this;
        return new Promise(function(resolve) {
          if (0 === newTiles.length) {
            resolve();
            return;
          }
          var completed = 0;
          var duration = .4;
          for (var _i = 0, newTiles_1 = newTiles; _i < newTiles_1.length; _i++) {
            var tile = newTiles_1[_i];
            var tileView = _this.createTileView(tile);
            _this._tileViews[tile.x][tile.y] = tileView;
            if (!tileView) {
              completed++;
              completed === newTiles.length && resolve();
              continue;
            }
            var finalPos = _this.gridToWorldPos(tile.x, tile.y);
            var startPos = cc.v3(finalPos.x, finalPos.y + _this._board.height * (_this._tileSize + _this._tileSpacing));
            tileView.node.position = startPos;
            tileView.node.opacity = 0;
            tileView.node.runAction(cc.sequence(cc.spawn(cc.moveTo(duration, cc.v2(finalPos)).easing(cc.easeBounceOut()), cc.fadeIn(.3 * duration), cc.scaleTo(.3 * duration, 1)), cc.callFunc(function() {
              completed++;
              completed === newTiles.length && resolve();
            })));
          }
        });
      };
      BoardView.prototype.animateTileSwap = function(left, right) {
        var _this = this;
        return new Promise(function(resolve) {
          var tileView1 = _this.getTileView(left.x, left.y);
          var tileView2 = _this.getTileView(right.x, right.y);
          if (!tileView1 || !tileView2) {
            resolve();
            return;
          }
          var duration = .3;
          var completed = 0;
          var onComplete = function() {
            completed++;
            2 === completed && resolve();
          };
          tileView1.node.runAction(cc.sequence(cc.scaleTo(duration / 2, 0).easing(cc.easeIn(2)), cc.callFunc(function() {
            var newPos = _this.gridToWorldPos(right.x, right.y);
            tileView1.node.position = newPos;
            _this._tileViews[right.x][right.y] = tileView1;
          }), cc.scaleTo(duration / 2, 1).easing(cc.easeOut(2)), cc.callFunc(onComplete)));
          tileView2.node.runAction(cc.sequence(cc.scaleTo(duration / 2, 0).easing(cc.easeIn(2)), cc.callFunc(function() {
            var newPos = _this.gridToWorldPos(left.x, left.y);
            tileView2.node.position = newPos;
            _this._tileViews[left.x][left.y] = tileView2;
          }), cc.scaleTo(duration / 2, 1).easing(cc.easeOut(2)), cc.callFunc(onComplete)));
        });
      };
      BoardView.prototype.animateShuffle = function() {
        var _this = this;
        return new Promise(function(resolve) {
          if (0 === _this._tileViews.length) {
            resolve();
            return;
          }
          var duration = .5;
          var completed = 0;
          var totalTiles = 0;
          for (var _i = 0, _a = _this._tileViews; _i < _a.length; _i++) {
            var row = _a[_i];
            totalTiles += row.length;
          }
          for (var _b = 0, _c = _this._tileViews; _b < _c.length; _b++) {
            var row = _c[_b];
            for (var _d = 0, row_1 = row; _d < row_1.length; _d++) {
              var tile = row_1[_d];
              if (!tile) {
                completed++;
                continue;
              }
              tile.node.runAction(cc.sequence(cc.spawn(cc.scaleTo(duration / 2, 0).easing(cc.easeIn(2)), cc.rotateBy(duration / 2, 180), cc.fadeOut(duration / 2)), cc.callFunc(function() {
                completed++;
                if (completed === totalTiles) {
                  for (var x = 0; x < _this._board.width; x++) for (var y = 0; y < _this._board.height; y++) {
                    var tileView = _this.getTileView(x, y);
                    var tile_1 = _this._board.getTile(x, y);
                    if (tileView && tile_1) {
                      tileView.node.scale = 0;
                      tileView.node.opacity = 0;
                      tileView.node.rotation = 0;
                    }
                  }
                  var allTileViews_2 = [];
                  for (var x = 0; x < _this._board.width; x++) for (var y = 0; y < _this._board.height; y++) {
                    var tileView = _this.getTileView(x, y);
                    tileView && allTileViews_2.push(tileView);
                  }
                  var completedAppear_1 = 0;
                  var appearDuration = .5;
                  for (var _i = 0, allTileViews_1 = allTileViews_2; _i < allTileViews_1.length; _i++) {
                    var tileView = allTileViews_1[_i];
                    var randomDelay = .3 * Math.random();
                    tileView.node.runAction(cc.sequence(cc.delayTime(randomDelay), cc.spawn(cc.scaleTo(appearDuration / 2, 1).easing(cc.easeBackOut()), cc.fadeIn(appearDuration / 2)), cc.callFunc(function() {
                      completedAppear_1++;
                      completedAppear_1 === allTileViews_2.length && resolve();
                    })));
                  }
                }
              })));
            }
          }
        });
      };
      __decorate([ property(cc.Node) ], BoardView.prototype, "tiles", void 0);
      __decorate([ property(cc.Node) ], BoardView.prototype, "clickNode", void 0);
      BoardView = __decorate([ ccclass ], BoardView);
      return BoardView;
    }(cc.Component);
    exports.BoardView = BoardView;
    cc._RF.pop();
  }, {} ],
  Board: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "98f8bm/VhNL0at9McS5982c", "Board");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.Board = void 0;
    var Board = function() {
      function Board(width, height) {
        this.width = width;
        this.height = height;
        this.tiles = new Map();
      }
      Board.prototype.getTile = function(x, y) {
        if (!this.isValidPosition(x, y)) return;
        return this.tiles.get(this.getKey(x, y));
      };
      Board.prototype.setTile = function(x, y, tile) {
        this.validatePosition(x, y);
        this.tiles.set(this.getKey(x, y), tile);
      };
      Board.prototype.swapTiles = function(tileA, tileB) {
        var posA = {
          x: tileA.x,
          y: tileA.y
        };
        var posB = {
          x: tileB.x,
          y: tileB.y
        };
        this.validatePosition(posA.x, posA.y);
        this.validatePosition(posB.x, posB.y);
        tileA.setPosition(posB.x, posB.y);
        tileB.setPosition(posA.x, posA.y);
        this.tiles.set(this.getKey(posB.x, posB.y), tileA);
        this.tiles.set(this.getKey(posA.x, posA.y), tileB);
      };
      Board.prototype.removeTiles = function(tiles) {
        for (var _i = 0, tiles_1 = tiles; _i < tiles_1.length; _i++) {
          var tile = tiles_1[_i];
          this.removeTileByPosition(tile.x, tile.y);
        }
      };
      Board.prototype.removeTile = function(tile) {
        this.removeTileByPosition(tile.x, tile.y);
      };
      Board.prototype.removeTileByPosition = function(x, y) {
        if (!this.isValidPosition(x, y)) return;
        this.tiles.delete(this.getKey(x, y));
      };
      Board.prototype.hasTile = function(x, y) {
        if (!this.isValidPosition(x, y)) return false;
        return this.tiles.has(this.getKey(x, y));
      };
      Board.prototype.isEmpty = function(x, y) {
        var tile = this.getTile(x, y);
        return !tile || tile.isEmpty;
      };
      Board.prototype.isValidPosition = function(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
      };
      Board.prototype.getAllTiles = function() {
        return Array.from(this.tiles.values());
      };
      Board.prototype.clear = function() {
        this.tiles.clear();
      };
      Board.prototype.getKey = function(x, y) {
        return y * this.width + x;
      };
      Board.prototype.validatePosition = function(x, y) {
        if (!this.isValidPosition(x, y)) throw new Error("Position out of bounds: (" + x + ", " + y + "). Valid range: 0-" + (this.width - 1) + ", 0-" + (this.height - 1));
      };
      return Board;
    }();
    exports.Board = Board;
    cc._RF.pop();
  }, {} ],
  BombBooster: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "ada81jumdFOk5U9KhtMv8px", "BombBooster");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.BombBooster = void 0;
    var GameEvent_1 = require("../../../GameEvent");
    var BoosterType_1 = require("../../enums/BoosterType");
    var InputState_1 = require("../../enums/InputState");
    var DestroyEffect_1 = require("../effects/DestroyEffect");
    var BombBooster = function() {
      function BombBooster(count, radius) {
        this.type = BoosterType_1.BoosterType.BOMB;
        this.initialInputState = InputState_1.InputState.BOMB;
        this.onCountChanged = new GameEvent_1.GameEvent();
        this._maxCount = count;
        this._radius = radius;
        this._count = count;
      }
      BombBooster.prototype.canProcess = function(ctx) {
        return this.canUse();
      };
      BombBooster.prototype.onTileClick = function(ctx) {
        if (!this.canUse()) return [];
        var tiles = this.getBombAffectedTiles(ctx.selectedTile, ctx.board);
        for (var _i = 0, tiles_1 = tiles; _i < tiles_1.length; _i++) {
          var tile = tiles_1[_i];
          ctx.tilesToRemove.add(tile);
        }
        this.setCount(this._count - 1);
        ctx.setInputState(InputState_1.InputState.NORMAL);
        var result = new DestroyEffect_1.DestroyEffect();
        result.tilesToRemove = tiles;
        return result;
      };
      BombBooster.prototype.getCount = function() {
        return this._count;
      };
      BombBooster.prototype.canUse = function() {
        return this._count > 0;
      };
      BombBooster.prototype.reset = function() {
        this.setCount(this._maxCount);
      };
      BombBooster.prototype.getBombAffectedTiles = function(selectedTile, board) {
        var tiles = [];
        var radiusSq = this._radius * this._radius;
        for (var dx = -this._radius; dx <= this._radius; dx++) for (var dy = -this._radius; dy <= this._radius; dy++) {
          var distanceSq = dx * dx + dy * dy;
          if (distanceSq > radiusSq) continue;
          var tile = board.getTile(selectedTile.x + dx, selectedTile.y + dy);
          false == (null === tile || void 0 === tile ? void 0 : tile.isEmpty) && tiles.push(tile);
        }
        return tiles;
      };
      BombBooster.prototype.setCount = function(value) {
        this._count = value;
        this.onCountChanged.invoke(this._count);
      };
      return BombBooster;
    }();
    exports.BombBooster = BombBooster;
    cc._RF.pop();
  }, {
    "../../../GameEvent": "GameEvent",
    "../../enums/BoosterType": "BoosterType",
    "../../enums/InputState": "InputState",
    "../effects/DestroyEffect": "DestroyEffect"
  } ],
  BoosterType: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "da25f6r2ZBP9bFfhxymWGTx", "BoosterType");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.BoosterType = void 0;
    var BoosterType;
    (function(BoosterType) {
      BoosterType[BoosterType["TELEPORT"] = 0] = "TELEPORT";
      BoosterType[BoosterType["BOMB"] = 1] = "BOMB";
      BoosterType[BoosterType["NONE"] = -1] = "NONE";
    })(BoosterType = exports.BoosterType || (exports.BoosterType = {}));
    cc._RF.pop();
  }, {} ],
  BoosterView: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "12c37DX555I7JcHLrXdSpe9", "BoosterView");
    "use strict";
    var __extends = this && this.__extends || function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || {
          __proto__: []
        } instanceof Array && function(d, b) {
          d.__proto__ = b;
        } || function(d, b) {
          for (var p in b) Object.prototype.hasOwnProperty.call(b, p) && (d[p] = b[p]);
        };
        return extendStatics(d, b);
      };
      return function(d, b) {
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    }();
    var __decorate = this && this.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if ("object" === typeof Reflect && "function" === typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) (d = decorators[i]) && (r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r);
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.BoosterView = void 0;
    var BoosterType_1 = require("../enums/BoosterType");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var BoosterView = function(_super) {
      __extends(BoosterView, _super);
      function BoosterView() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      Object.defineProperty(BoosterView.prototype, "type", {
        get: function() {
          return this._type;
        },
        enumerable: false,
        configurable: true
      });
      BoosterView.prototype.init = function(boosters, type) {
        var _this = this;
        this._boosters = boosters;
        this._type = type;
        this._booster = this._boosters.getBooster(type);
        this._booster.onCountChanged.subscribe(this.handleCountChanged, this);
        boosters.onSelectedTypeChanged.subscribe(this.handleTypeChanged, this);
        this.handleCountChanged(this._booster.getCount());
        this.button.node.on("click", function() {
          _this._boosters.selectedType == type ? _this._boosters.apply(BoosterType_1.BoosterType.NONE) : _this._boosters.canApply(type) && _this._boosters.apply(type);
        });
      };
      BoosterView.prototype.handleCountChanged = function(value) {
        this.label.string = this._booster.getCount().toString();
        this.button.interactable = this._boosters.canApply(this.type);
      };
      BoosterView.prototype.handleTypeChanged = function(type) {
        this.animateBoosterActive(this._type == type);
      };
      BoosterView.prototype.animateBoosterActive = function(active) {
        var scale = active ? 1.2 : 1;
        var color = active ? cc.Color.YELLOW : cc.Color.WHITE;
        this.node.stopAllActions();
        this.node.runAction(cc.spawn(cc.scaleTo(.2, scale), cc.tintTo(.2, color.r, color.g, color.b)));
        active && this.node.runAction(cc.repeatForever(cc.sequence(cc.scaleTo(.5, 1.3), cc.scaleTo(.5, 1.2))));
      };
      __decorate([ property(cc.Label) ], BoosterView.prototype, "label", void 0);
      __decorate([ property(cc.Button) ], BoosterView.prototype, "button", void 0);
      BoosterView = __decorate([ ccclass ], BoosterView);
      return BoosterView;
    }(cc.Component);
    exports.BoosterView = BoosterView;
    cc._RF.pop();
  }, {
    "../enums/BoosterType": "BoosterType"
  } ],
  Boosters: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "8f115Ic2opEIJHHTG5DK/mN", "Boosters");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.Boosters = void 0;
    var GameEvent_1 = require("../../GameEvent");
    var BoosterType_1 = require("../enums/BoosterType");
    var InputState_1 = require("../enums/InputState");
    var Boosters = function() {
      function Boosters() {
        this._boosters = new Map();
        this._selectedType = BoosterType_1.BoosterType.NONE;
        this.onSelectedTypeChanged = new GameEvent_1.GameEvent();
      }
      Boosters.prototype.init = function(game) {
        this._game = game;
        this._game.onInputStateChanged.subscribe(this.handleInputStateChanged, this);
      };
      Object.defineProperty(Boosters.prototype, "selectedType", {
        get: function() {
          return this._selectedType;
        },
        set: function(type) {
          this._selectedType = type;
          this.onSelectedTypeChanged.invoke(this.selectedType);
        },
        enumerable: false,
        configurable: true
      });
      Boosters.prototype.canProcess = function(ctx) {
        return ctx.getInputState() != InputState_1.InputState.NORMAL;
      };
      Boosters.prototype.onTileClick = function(ctx) {
        var booster = this._boosters.get(this.selectedType);
        if (!booster) return null;
        return booster.onTileClick(ctx);
      };
      Boosters.prototype.getBooster = function(type) {
        return this._boosters.get(type);
      };
      Boosters.prototype.register = function(booster) {
        this._boosters.set(booster.type, booster);
      };
      Boosters.prototype.reset = function() {
        this.selectedType = BoosterType_1.BoosterType.NONE;
        for (var _i = 0, _a = Array.from(this._boosters.values()); _i < _a.length; _i++) {
          var booster = _a[_i];
          booster.reset();
        }
      };
      Boosters.prototype.apply = function(type) {
        var booster = this._boosters.get(type);
        if (!booster || type == BoosterType_1.BoosterType.NONE) {
          this._game.setInputState(InputState_1.InputState.NORMAL);
          return;
        }
        this._game.setInputState(booster.initialInputState);
      };
      Boosters.prototype.canApply = function(type) {
        var _a;
        if (type == BoosterType_1.BoosterType.NONE) return true;
        var booster = this._boosters.get(type);
        return null !== (_a = null === booster || void 0 === booster ? void 0 : booster.canUse()) && void 0 !== _a && _a;
      };
      Boosters.prototype.handleInputStateChanged = function(state) {
        switch (state) {
         case InputState_1.InputState.NORMAL:
          this.selectedType = BoosterType_1.BoosterType.NONE;
          break;

         case InputState_1.InputState.BOMB:
          this.selectedType = BoosterType_1.BoosterType.BOMB;
          break;

         case InputState_1.InputState.TELEPORT_PHASE_ONE:
         case InputState_1.InputState.TELEPORT_PHASE_TWO:
          this.selectedType = BoosterType_1.BoosterType.TELEPORT;
        }
      };
      return Boosters;
    }();
    exports.Boosters = Boosters;
    cc._RF.pop();
  }, {
    "../../GameEvent": "GameEvent",
    "../enums/BoosterType": "BoosterType",
    "../enums/InputState": "InputState"
  } ],
  Booster: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "97bfd3E/NVHX4dqxyPVEewD", "Booster");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    cc._RF.pop();
  }, {} ],
  Bootstrap: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "2bbaf/YlIJDbo8YxrI9AkS6", "Bootstrap");
    "use strict";
    var __extends = this && this.__extends || function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || {
          __proto__: []
        } instanceof Array && function(d, b) {
          d.__proto__ = b;
        } || function(d, b) {
          for (var p in b) Object.prototype.hasOwnProperty.call(b, p) && (d[p] = b[p]);
        };
        return extendStatics(d, b);
      };
      return function(d, b) {
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    }();
    var __decorate = this && this.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if ("object" === typeof Reflect && "function" === typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) (d = decorators[i]) && (r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r);
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.Bootstrap = void 0;
    var BoardView_1 = require("./views/BoardView");
    var BoosterView_1 = require("./views/BoosterView");
    var LoseView_1 = require("./views/LoseView");
    var MovesView_1 = require("./views/MovesView");
    var ScoreView_1 = require("./views/ScoreView");
    var WinView_1 = require("./views/WinView");
    var BlastGame_1 = require("./BlastGame");
    var BoosterType_1 = require("./enums/BoosterType");
    var OverlayView_1 = require("./views/OverlayView");
    var TileViewPool_1 = require("./views/TileViewPool");
    var Board_1 = require("./mechanics/Board");
    var Boosters_1 = require("./mechanics/Boosters");
    var Gravity_1 = require("./mechanics/Gravity");
    var Matches_1 = require("./mechanics/Matches");
    var Moves_1 = require("./mechanics/Moves");
    var Score_1 = require("./mechanics/Score");
    var Shuffle_1 = require("./mechanics/Shuffle");
    var Spawner_1 = require("./mechanics/Spawner");
    var SuperTiles_1 = require("./mechanics/superTiles/SuperTiles");
    var BombBooster_1 = require("./mechanics/boosters/BombBooster");
    var TeleportBooster_1 = require("./mechanics/boosters/TeleportBooster");
    var TileColor_1 = require("./enums/TileColor");
    var SuperTileType_1 = require("./mechanics/superTiles/SuperTileType");
    var LineSuperTileLogic_1 = require("./mechanics/superTiles/LineSuperTileLogic");
    var RadiusBombSuperTileLogic_1 = require("./mechanics/superTiles/RadiusBombSuperTileLogic");
    var MaxBombSuperTileLogic_1 = require("./mechanics/superTiles/MaxBombSuperTileLogic");
    var Input_1 = require("./mechanics/Input");
    var GameViewController_1 = require("./views/GameViewController");
    var NormalClickProcessor_1 = require("./NormalClickProcessor");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var Bootstrap = function(_super) {
      __extends(Bootstrap, _super);
      function Bootstrap() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.boardWidth = 8;
        _this.boardHeight = 8;
        _this.tileSize = 110;
        _this.tileSpacing = 2;
        _this.scorePerTile = 10;
        _this.targetScore = 5e3;
        _this.maxMoves = 10;
        _this.maxShuffles = 3;
        _this.superTileRemovedCountForLine = 5;
        _this.superTileRemovedCountForLineRadiusBomb = 8;
        _this.superTileRemovedCountForMaxBomb = 10;
        _this.superTileBombRadius = 2;
        _this.boosterBombCount = 3;
        _this.boosterBombRadius = 2;
        _this.boosterTeleportCount = 3;
        return _this;
      }
      Bootstrap.prototype.onLoad = function() {
        var boosters = new Boosters_1.Boosters();
        boosters.register(new BombBooster_1.BombBooster(this.boosterBombCount, this.boosterBombRadius));
        boosters.register(new TeleportBooster_1.TeleportBooster(this.boosterTeleportCount));
        var superTiles = new SuperTiles_1.SuperTiles();
        superTiles.register(new LineSuperTileLogic_1.LineSuperTileLogic(true), this.superTileRemovedCountForLine);
        superTiles.register(new LineSuperTileLogic_1.LineSuperTileLogic(false), this.superTileRemovedCountForLine);
        superTiles.register(new RadiusBombSuperTileLogic_1.RadiusBombSuperTileLogic(this.superTileBombRadius), this.superTileRemovedCountForLineRadiusBomb);
        superTiles.register(new MaxBombSuperTileLogic_1.MaxBombSuperTileLogic(), this.superTileRemovedCountForMaxBomb);
        var spawner = new Spawner_1.Spawner();
        spawner.register(TileColor_1.TileColor.RED);
        spawner.register(TileColor_1.TileColor.BLUE);
        spawner.register(TileColor_1.TileColor.GREEN);
        spawner.register(TileColor_1.TileColor.YELLOW);
        spawner.register(TileColor_1.TileColor.PURPLE);
        var board = new Board_1.Board(this.boardWidth, this.boardHeight);
        var score = new Score_1.Score(this.targetScore, this.scorePerTile);
        var moves = new Moves_1.Moves(this.maxMoves);
        var shuffle = new Shuffle_1.Shuffle(this.maxShuffles);
        var matches = new Matches_1.Matches();
        var gravity = new Gravity_1.Gravity();
        var input = new Input_1.Input();
        var preGameProcessors = [ spawner ];
        var postGameProcessors = [ spawner ];
        var preTurnProcessors = [ shuffle ];
        var turnClickProcessors = [ new NormalClickProcessor_1.NormalClickProcessor(), boosters, superTiles ];
        var postTurnProcessors = [ gravity, spawner, moves, score ];
        var tileRemovedProcessors = [];
        var game = new BlastGame_1.BlastGame(input, board, score, moves, spawner, shuffle, matches, gravity, superTiles, boosters, preGameProcessors, postGameProcessors, preTurnProcessors, turnClickProcessors, postTurnProcessors, tileRemovedProcessors);
        this.scoreView.init(game.score);
        this.movesView.init(game.moves);
        this.winView.init(game);
        this.loseView.init(game);
        this.bombView.init(game.boosters, BoosterType_1.BoosterType.BOMB);
        this.teleportView.init(game.boosters, BoosterType_1.BoosterType.TELEPORT);
        var tileViewPool = new TileViewPool_1.TileViewPool();
        tileViewPool.init(this.tilePrefab, this.boardHeight * this.boardWidth);
        tileViewPool.registerRegularTile(TileColor_1.TileColor.RED, this.redTileSprite);
        tileViewPool.registerRegularTile(TileColor_1.TileColor.BLUE, this.blueTileSprite);
        tileViewPool.registerRegularTile(TileColor_1.TileColor.GREEN, this.greenTileSprite);
        tileViewPool.registerRegularTile(TileColor_1.TileColor.YELLOW, this.yellowTileSprite);
        tileViewPool.registerRegularTile(TileColor_1.TileColor.PURPLE, this.purpleTileSprite);
        tileViewPool.registerSuperTile(SuperTileType_1.SuperTileType.HORIZONTAL, this.horizontalTileSprite);
        tileViewPool.registerSuperTile(SuperTileType_1.SuperTileType.VERTICAL, this.verticalTileSprite);
        tileViewPool.registerSuperTile(SuperTileType_1.SuperTileType.RADIUS_BOMB, this.radiusBombTileSprite);
        tileViewPool.registerSuperTile(SuperTileType_1.SuperTileType.MAX_BOMB, this.maxBombTileSprite);
        this.boardView.init(game.board, game.input, tileViewPool, this.tileSize, this.tileSpacing);
        var gameView = new GameViewController_1.GameViewController(game, this.boardView, new Array(this.bombView, this.teleportView), this.loseView, this.winView, this.movesView, this.scoreView, this.overlayView);
        gameView.init();
        game.start();
      };
      __decorate([ property() ], Bootstrap.prototype, "boardWidth", void 0);
      __decorate([ property() ], Bootstrap.prototype, "boardHeight", void 0);
      __decorate([ property() ], Bootstrap.prototype, "tileSize", void 0);
      __decorate([ property() ], Bootstrap.prototype, "tileSpacing", void 0);
      __decorate([ property() ], Bootstrap.prototype, "scorePerTile", void 0);
      __decorate([ property() ], Bootstrap.prototype, "targetScore", void 0);
      __decorate([ property() ], Bootstrap.prototype, "maxMoves", void 0);
      __decorate([ property() ], Bootstrap.prototype, "maxShuffles", void 0);
      __decorate([ property() ], Bootstrap.prototype, "superTileRemovedCountForLine", void 0);
      __decorate([ property() ], Bootstrap.prototype, "superTileRemovedCountForLineRadiusBomb", void 0);
      __decorate([ property() ], Bootstrap.prototype, "superTileRemovedCountForMaxBomb", void 0);
      __decorate([ property() ], Bootstrap.prototype, "superTileBombRadius", void 0);
      __decorate([ property() ], Bootstrap.prototype, "boosterBombCount", void 0);
      __decorate([ property() ], Bootstrap.prototype, "boosterBombRadius", void 0);
      __decorate([ property() ], Bootstrap.prototype, "boosterTeleportCount", void 0);
      __decorate([ property(BoosterView_1.BoosterView) ], Bootstrap.prototype, "teleportView", void 0);
      __decorate([ property(BoosterView_1.BoosterView) ], Bootstrap.prototype, "bombView", void 0);
      __decorate([ property(BoardView_1.BoardView) ], Bootstrap.prototype, "boardView", void 0);
      __decorate([ property(ScoreView_1.ScoreView) ], Bootstrap.prototype, "scoreView", void 0);
      __decorate([ property(MovesView_1.MovesView) ], Bootstrap.prototype, "movesView", void 0);
      __decorate([ property(WinView_1.WinView) ], Bootstrap.prototype, "winView", void 0);
      __decorate([ property(LoseView_1.LoseView) ], Bootstrap.prototype, "loseView", void 0);
      __decorate([ property(OverlayView_1.OverlayView) ], Bootstrap.prototype, "overlayView", void 0);
      __decorate([ property(cc.Prefab) ], Bootstrap.prototype, "tilePrefab", void 0);
      __decorate([ property(cc.SpriteFrame) ], Bootstrap.prototype, "redTileSprite", void 0);
      __decorate([ property(cc.SpriteFrame) ], Bootstrap.prototype, "blueTileSprite", void 0);
      __decorate([ property(cc.SpriteFrame) ], Bootstrap.prototype, "greenTileSprite", void 0);
      __decorate([ property(cc.SpriteFrame) ], Bootstrap.prototype, "yellowTileSprite", void 0);
      __decorate([ property(cc.SpriteFrame) ], Bootstrap.prototype, "purpleTileSprite", void 0);
      __decorate([ property(cc.SpriteFrame) ], Bootstrap.prototype, "horizontalTileSprite", void 0);
      __decorate([ property(cc.SpriteFrame) ], Bootstrap.prototype, "verticalTileSprite", void 0);
      __decorate([ property(cc.SpriteFrame) ], Bootstrap.prototype, "radiusBombTileSprite", void 0);
      __decorate([ property(cc.SpriteFrame) ], Bootstrap.prototype, "maxBombTileSprite", void 0);
      Bootstrap = __decorate([ ccclass ], Bootstrap);
      return Bootstrap;
    }(cc.Component);
    exports.Bootstrap = Bootstrap;
    cc._RF.pop();
  }, {
    "./BlastGame": "BlastGame",
    "./NormalClickProcessor": "NormalClickProcessor",
    "./enums/BoosterType": "BoosterType",
    "./enums/TileColor": "TileColor",
    "./mechanics/Board": "Board",
    "./mechanics/Boosters": "Boosters",
    "./mechanics/Gravity": "Gravity",
    "./mechanics/Input": "Input",
    "./mechanics/Matches": "Matches",
    "./mechanics/Moves": "Moves",
    "./mechanics/Score": "Score",
    "./mechanics/Shuffle": "Shuffle",
    "./mechanics/Spawner": "Spawner",
    "./mechanics/boosters/BombBooster": "BombBooster",
    "./mechanics/boosters/TeleportBooster": "TeleportBooster",
    "./mechanics/superTiles/LineSuperTileLogic": "LineSuperTileLogic",
    "./mechanics/superTiles/MaxBombSuperTileLogic": "MaxBombSuperTileLogic",
    "./mechanics/superTiles/RadiusBombSuperTileLogic": "RadiusBombSuperTileLogic",
    "./mechanics/superTiles/SuperTileType": "SuperTileType",
    "./mechanics/superTiles/SuperTiles": "SuperTiles",
    "./views/BoardView": "BoardView",
    "./views/BoosterView": "BoosterView",
    "./views/GameViewController": "GameViewController",
    "./views/LoseView": "LoseView",
    "./views/MovesView": "MovesView",
    "./views/OverlayView": "OverlayView",
    "./views/ScoreView": "ScoreView",
    "./views/TileViewPool": "TileViewPool",
    "./views/WinView": "WinView"
  } ],
  DestroyEffect: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "acb4abij7ZPJoB2dxxk9TnR", "DestroyEffect");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.DestroyEffect = void 0;
    var DestroyEffect = function() {
      function DestroyEffect() {}
      return DestroyEffect;
    }();
    exports.DestroyEffect = DestroyEffect;
    cc._RF.pop();
  }, {} ],
  GameEvent: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "5eeebi2ezlOYIYvFhNtTTEs", "GameEvent");
    "use strict";
    var __spreadArrays = this && this.__spreadArrays || function() {
      for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
      for (var r = Array(s), k = 0, i = 0; i < il; i++) for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, 
      k++) r[k] = a[j];
      return r;
    };
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.GameEvent = void 0;
    var GameEvent = function() {
      function GameEvent() {
        this._handlers = [];
        this._onceHandlers = [];
      }
      GameEvent.prototype.subscribe = function(action, caller) {
        var _this = this;
        if (this._onceHandlers.find(function(handler) {
          return _this.same(handler, action, caller);
        })) throw new Error("Error in Event.subscribe(). Already subscribed once");
        if (this._handlers.find(function(handler) {
          return _this.same(handler, action, caller);
        })) return;
        this._handlers.push({
          action: action,
          caller: caller
        });
      };
      GameEvent.prototype.subscribeOnce = function(action, caller) {
        var _this = this;
        if (this._handlers.find(function(handler) {
          return _this.same(handler, action, caller);
        })) throw new Error("Error in Event.subscribeOnce(). Already subscribed");
        if (this._onceHandlers.find(function(handler) {
          return _this.same(handler, action, caller);
        })) return;
        this._onceHandlers.push({
          action: action,
          caller: caller
        });
      };
      GameEvent.prototype.unsubscribe = function(action, caller) {
        var _this = this;
        var handlerIndex = this._handlers.findIndex(function(handler) {
          return _this.same(handler, action, caller);
        });
        -1 != handlerIndex && this._handlers.splice(handlerIndex, 1);
        var onceHandlerIndex = this._onceHandlers.findIndex(function(handler) {
          return _this.same(handler, action, caller);
        });
        -1 != onceHandlerIndex && this._onceHandlers.splice(onceHandlerIndex, 1);
      };
      GameEvent.prototype.unsubscribeAll = function() {
        this._handlers.length = 0;
        this._onceHandlers.length = 0;
      };
      GameEvent.prototype.invoke = function(arg) {
        var handlers = __spreadArrays(this._handlers);
        handlers.forEach(function(handler, i) {
          handler.action.call(handler.caller, arg);
        });
        var onceHandlers = __spreadArrays(this._onceHandlers);
        onceHandlers.forEach(function(handler) {
          return handler.action.call(handler.caller, arg);
        });
        this._onceHandlers.length = 0;
      };
      GameEvent.prototype.same = function(handler, action, caller) {
        return handler.action == action && handler.caller == caller;
      };
      return GameEvent;
    }();
    exports.GameEvent = GameEvent;
    cc._RF.pop();
  }, {} ],
  GameState: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "a823f741klIrKztRhFkbNXc", "GameState");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.GameState = void 0;
    var GameState;
    (function(GameState) {
      GameState[GameState["GAME"] = 0] = "GAME";
      GameState[GameState["LOSE"] = 1] = "LOSE";
      GameState[GameState["WIN"] = 2] = "WIN";
    })(GameState = exports.GameState || (exports.GameState = {}));
    cc._RF.pop();
  }, {} ],
  GameViewController: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "f4bbf5vk+hOUb/Zl3FQtoq3", "GameViewController");
    "use strict";
    var __awaiter = this && this.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var __generator = this && this.__generator || function(thisArg, body) {
      var _ = {
        label: 0,
        sent: function() {
          if (1 & t[0]) throw t[1];
          return t[1];
        },
        trys: [],
        ops: []
      }, f, y, t, g;
      return g = {
        next: verb(0),
        throw: verb(1),
        return: verb(2)
      }, "function" === typeof Symbol && (g[Symbol.iterator] = function() {
        return this;
      }), g;
      function verb(n) {
        return function(v) {
          return step([ n, v ]);
        };
      }
      function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
          if (f = 1, y && (t = 2 & op[0] ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 
          0) : y.next) && !(t = t.call(y, op[1])).done) return t;
          (y = 0, t) && (op = [ 2 & op[0], t.value ]);
          switch (op[0]) {
           case 0:
           case 1:
            t = op;
            break;

           case 4:
            _.label++;
            return {
              value: op[1],
              done: false
            };

           case 5:
            _.label++;
            y = op[1];
            op = [ 0 ];
            continue;

           case 7:
            op = _.ops.pop();
            _.trys.pop();
            continue;

           default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (6 === op[0] || 2 === op[0])) {
              _ = 0;
              continue;
            }
            if (3 === op[0] && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }
            if (6 === op[0] && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }
            if (t && _.label < t[2]) {
              _.label = t[2];
              _.ops.push(op);
              break;
            }
            t[2] && _.ops.pop();
            _.trys.pop();
            continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [ 6, e ];
          y = 0;
        } finally {
          f = t = 0;
        }
        if (5 & op[0]) throw op[1];
        return {
          value: op[0] ? op[1] : void 0,
          done: true
        };
      }
    };
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.GameViewController = void 0;
    var DestroyEffect_1 = require("../mechanics/effects/DestroyEffect");
    var GravityEffect_1 = require("../mechanics/effects/GravityEffect");
    var LoseEffect_1 = require("../mechanics/effects/LoseEffect");
    var ShakeEffect_1 = require("../mechanics/effects/ShakeEffect");
    var ShuffleEffect_1 = require("../mechanics/effects/ShuffleEffect");
    var SuperTileSpawnEffect_1 = require("../mechanics/effects/SuperTileSpawnEffect");
    var SwapEffect_1 = require("../mechanics/effects/SwapEffect");
    var TileSpawnEffect_1 = require("../mechanics/effects/TileSpawnEffect");
    var WinEffect_1 = require("../mechanics/effects/WinEffect");
    var GameViewController = function() {
      function GameViewController(game, boardView, boosterViews, loseView, winView, movesView, scoreView, overlayView) {
        this._boosterViewsMap = new Map();
        this._game = game;
        this._boardView = boardView;
        this._boosterViews = boosterViews;
        this._loseView = loseView;
        this._winView = winView;
        this._movesView = movesView;
        this._scoreView = scoreView;
        this._overlayView = overlayView;
      }
      GameViewController.prototype.init = function() {
        this._game.onGameStarted.subscribe(this.processEffects, this);
        this._game.onTurnFinished.subscribe(this.processEffects, this);
        this._game.onGameFinished.subscribe(this.processEffects, this);
        for (var _i = 0, _a = this._boosterViews; _i < _a.length; _i++) {
          var item = _a[_i];
          this._boosterViewsMap.set(item.type, item);
        }
        this._overlayView.hide(false);
        this._winView.hide(false);
        this._loseView.hide(false);
        this._game.input.enable();
        this._scoreView.updateScore(false);
        this._movesView.updateMoves(false);
      };
      GameViewController.prototype.processEffects = function(effects) {
        return __awaiter(this, void 0, void 0, function() {
          var _i, effects_1, effect, view;
          return __generator(this, function(_a) {
            switch (_a.label) {
             case 0:
              this._game.input.disable();
              this._overlayView.hide();
              this._winView.hide();
              this._loseView.hide();
              _i = 0, effects_1 = effects;
              _a.label = 1;

             case 1:
              if (!(_i < effects_1.length)) return [ 3, 23 ];
              effect = effects_1[_i];
              if (!(effect instanceof DestroyEffect_1.DestroyEffect)) return [ 3, 3 ];
              return [ 4, this._boardView.animateTileRemoval(effect.tilesToRemove) ];

             case 2:
              _a.sent();
              return [ 3, 22 ];

             case 3:
              if (!(effect instanceof SuperTileSpawnEffect_1.SuperTileSpawnEffect)) return [ 3, 5 ];
              return [ 4, this._boardView.animateSuperTileCreation(effect.superTile) ];

             case 4:
              _a.sent();
              return [ 3, 22 ];

             case 5:
              if (!(effect instanceof TileSpawnEffect_1.TileSpawnEffect)) return [ 3, 7 ];
              return [ 4, this._boardView.animateNewTiles(effect.tilesToSpawn) ];

             case 6:
              _a.sent();
              return [ 3, 22 ];

             case 7:
              if (!(effect instanceof GravityEffect_1.GravityEffect)) return [ 3, 9 ];
              return [ 4, this._boardView.animateGravity(effect.moves) ];

             case 8:
              _a.sent();
              return [ 3, 22 ];

             case 9:
              if (!(effect instanceof ShuffleEffect_1.ShuffleEffect)) return [ 3, 11 ];
              return [ 4, this._boardView.animateShuffle() ];

             case 10:
              _a.sent();
              return [ 3, 22 ];

             case 11:
              if (!(effect instanceof ShakeEffect_1.ShakeEffect)) return [ 3, 12 ];
              view = this._boardView.getTileView(effect.tileToShake.x, effect.tileToShake.y);
              view.animateShake();
              return [ 3, 22 ];

             case 12:
              if (!(effect instanceof SwapEffect_1.SwapEffect)) return [ 3, 14 ];
              return [ 4, this._boardView.animateTileSwap(effect.left, effect.right) ];

             case 13:
              _a.sent();
              return [ 3, 22 ];

             case 14:
              if (!(effect instanceof WinEffect_1.WinEffect)) return [ 3, 18 ];
              return [ 4, this._boardView.animateHideTiles() ];

             case 15:
              _a.sent();
              return [ 4, this._overlayView.show() ];

             case 16:
              _a.sent();
              return [ 4, this._winView.show() ];

             case 17:
              _a.sent();
              this._boardView.reset();
              return [ 3, 22 ];

             case 18:
              if (!(effect instanceof LoseEffect_1.LoseEffect)) return [ 3, 22 ];
              return [ 4, this._boardView.animateHideTiles() ];

             case 19:
              _a.sent();
              return [ 4, this._overlayView.show() ];

             case 20:
              _a.sent();
              return [ 4, this._loseView.show() ];

             case 21:
              _a.sent();
              this._boardView.reset();
              _a.label = 22;

             case 22:
              _i++;
              return [ 3, 1 ];

             case 23:
              this._scoreView.updateScore();
              this._movesView.updateMoves();
              this._game.input.enable();
              return [ 2 ];
            }
          });
        });
      };
      return GameViewController;
    }();
    exports.GameViewController = GameViewController;
    cc._RF.pop();
  }, {
    "../mechanics/effects/DestroyEffect": "DestroyEffect",
    "../mechanics/effects/GravityEffect": "GravityEffect",
    "../mechanics/effects/LoseEffect": "LoseEffect",
    "../mechanics/effects/ShakeEffect": "ShakeEffect",
    "../mechanics/effects/ShuffleEffect": "ShuffleEffect",
    "../mechanics/effects/SuperTileSpawnEffect": "SuperTileSpawnEffect",
    "../mechanics/effects/SwapEffect": "SwapEffect",
    "../mechanics/effects/TileSpawnEffect": "TileSpawnEffect",
    "../mechanics/effects/WinEffect": "WinEffect"
  } ],
  GravityEffect: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "8abb3ycAVlPCLqhOBIGaE+8", "GravityEffect");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.GravityEffect = void 0;
    var GravityEffect = function() {
      function GravityEffect() {}
      return GravityEffect;
    }();
    exports.GravityEffect = GravityEffect;
    cc._RF.pop();
  }, {} ],
  Gravity: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "a328bu3rjxCzr08HGXKT/4Y", "Gravity");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.Gravity = void 0;
    var TileColor_1 = require("../enums/TileColor");
    var Tile_1 = require("../Tile");
    var GravityEffect_1 = require("./effects/GravityEffect");
    var Gravity = function() {
      function Gravity() {}
      Gravity.prototype.canProcess = function(ctx) {
        return true;
      };
      Gravity.prototype.onPostTurn = function(ctx) {
        var moves = this.applyGravity(ctx.board);
        var result = new GravityEffect_1.GravityEffect();
        result.moves = moves;
        return result;
      };
      Gravity.prototype.applyGravity = function(board) {
        var moveHistory = [];
        for (var x = 0; x < board.width; x++) {
          var tiles = [];
          for (var y = 0; y < board.height; y++) {
            var tile = board.getTile(x, y);
            tile && !tile.isEmpty && tiles.push(tile);
          }
          for (var i = 0; i < tiles.length; i++) {
            var tile = tiles[i];
            var oldY = tile.y;
            var newY = i;
            oldY !== newY && moveHistory.push({
              x: x,
              fromY: oldY,
              toY: newY,
              tile: tile
            });
            tile.y = newY;
            board.setTile(x, newY, tile);
          }
          for (var y = tiles.length; y < board.height; y++) board.setTile(x, y, new Tile_1.Tile(x, y, TileColor_1.TileColor.EMPTY));
        }
        return moveHistory;
      };
      return Gravity;
    }();
    exports.Gravity = Gravity;
    cc._RF.pop();
  }, {
    "../Tile": "Tile",
    "../enums/TileColor": "TileColor",
    "./effects/GravityEffect": "GravityEffect"
  } ],
  InputState: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "e5b4e11pmhGxKtn3J7JT3Y9", "InputState");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.InputState = void 0;
    var InputState;
    (function(InputState) {
      InputState[InputState["NORMAL"] = 0] = "NORMAL";
      InputState[InputState["TELEPORT_PHASE_ONE"] = 1] = "TELEPORT_PHASE_ONE";
      InputState[InputState["TELEPORT_PHASE_TWO"] = 2] = "TELEPORT_PHASE_TWO";
      InputState[InputState["BOMB"] = 3] = "BOMB";
    })(InputState = exports.InputState || (exports.InputState = {}));
    cc._RF.pop();
  }, {} ],
  Input: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "9d747AD7R5K95M+uJfQySAF", "Input");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.Input = void 0;
    var GameEvent_1 = require("../../GameEvent");
    var GameState_1 = require("../enums/GameState");
    var Input = function() {
      function Input() {
        this._enabled = true;
        this.onTileClicked = new GameEvent_1.GameEvent();
      }
      Input.prototype.canProcess = function(ctx) {
        return ctx.getState() == GameState_1.GameState.GAME;
      };
      Input.prototype.invokeTileClick = function(pos) {
        this.onTileClicked.invoke(pos);
      };
      Object.defineProperty(Input.prototype, "isEnabled", {
        get: function() {
          return this._enabled;
        },
        enumerable: false,
        configurable: true
      });
      Input.prototype.enable = function() {
        this._enabled = true;
      };
      Input.prototype.disable = function() {
        this._enabled = false;
      };
      return Input;
    }();
    exports.Input = Input;
    cc._RF.pop();
  }, {
    "../../GameEvent": "GameEvent",
    "../enums/GameState": "GameState"
  } ],
  LineSuperTileLogic: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "9b2107uu8pM267mw3zkrML9", "LineSuperTileLogic");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.LineSuperTileLogic = void 0;
    var SuperTileType_1 = require("./SuperTileType");
    var SuperTile_1 = require("./SuperTile");
    var DestroyEffect_1 = require("../effects/DestroyEffect");
    var LineSuperTileLogic = function() {
      function LineSuperTileLogic(isHorizontal) {
        this.type = isHorizontal ? SuperTileType_1.SuperTileType.HORIZONTAL : SuperTileType_1.SuperTileType.VERTICAL;
      }
      LineSuperTileLogic.prototype.canProcess = function(ctx) {
        return this.canProcessTile(ctx.selectedTile);
      };
      LineSuperTileLogic.prototype.canProcessTile = function(tile) {
        return tile instanceof SuperTile_1.SuperTile && tile.type == this.type;
      };
      LineSuperTileLogic.prototype.onTileClick = function(ctx) {
        var tiles = this.activate(ctx.selectedTile, ctx.board);
        for (var _i = 0, tiles_1 = tiles; _i < tiles_1.length; _i++) {
          var tile = tiles_1[_i];
          ctx.tilesToRemove.add(tile);
        }
        var result = new DestroyEffect_1.DestroyEffect();
        result.tilesToRemove = tiles;
        return result;
      };
      LineSuperTileLogic.prototype.activate = function(superTile, board) {
        var tiles = [];
        var range = this.type == SuperTileType_1.SuperTileType.HORIZONTAL ? board.width : board.height;
        for (var i = 0; i < range; i++) {
          var coord1 = this.type == SuperTileType_1.SuperTileType.HORIZONTAL ? i : superTile.x;
          var coord2 = this.type == SuperTileType_1.SuperTileType.HORIZONTAL ? superTile.y : i;
          var tile = board.getTile(coord1, coord2);
          tile && !tile.isEmpty && tiles.push(tile);
        }
        return tiles;
      };
      return LineSuperTileLogic;
    }();
    exports.LineSuperTileLogic = LineSuperTileLogic;
    cc._RF.pop();
  }, {
    "../effects/DestroyEffect": "DestroyEffect",
    "./SuperTile": "SuperTile",
    "./SuperTileType": "SuperTileType"
  } ],
  LoseEffect: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "146753HyI9FyLUC+s8lBdmN", "LoseEffect");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.LoseEffect = void 0;
    var LoseEffect = function() {
      function LoseEffect() {}
      return LoseEffect;
    }();
    exports.LoseEffect = LoseEffect;
    cc._RF.pop();
  }, {} ],
  LoseView: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "7c6e08TU+1BKLD32CrvgXIl", "LoseView");
    "use strict";
    var __extends = this && this.__extends || function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || {
          __proto__: []
        } instanceof Array && function(d, b) {
          d.__proto__ = b;
        } || function(d, b) {
          for (var p in b) Object.prototype.hasOwnProperty.call(b, p) && (d[p] = b[p]);
        };
        return extendStatics(d, b);
      };
      return function(d, b) {
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    }();
    var __decorate = this && this.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if ("object" === typeof Reflect && "function" === typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) (d = decorators[i]) && (r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r);
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __awaiter = this && this.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var __generator = this && this.__generator || function(thisArg, body) {
      var _ = {
        label: 0,
        sent: function() {
          if (1 & t[0]) throw t[1];
          return t[1];
        },
        trys: [],
        ops: []
      }, f, y, t, g;
      return g = {
        next: verb(0),
        throw: verb(1),
        return: verb(2)
      }, "function" === typeof Symbol && (g[Symbol.iterator] = function() {
        return this;
      }), g;
      function verb(n) {
        return function(v) {
          return step([ n, v ]);
        };
      }
      function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
          if (f = 1, y && (t = 2 & op[0] ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 
          0) : y.next) && !(t = t.call(y, op[1])).done) return t;
          (y = 0, t) && (op = [ 2 & op[0], t.value ]);
          switch (op[0]) {
           case 0:
           case 1:
            t = op;
            break;

           case 4:
            _.label++;
            return {
              value: op[1],
              done: false
            };

           case 5:
            _.label++;
            y = op[1];
            op = [ 0 ];
            continue;

           case 7:
            op = _.ops.pop();
            _.trys.pop();
            continue;

           default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (6 === op[0] || 2 === op[0])) {
              _ = 0;
              continue;
            }
            if (3 === op[0] && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }
            if (6 === op[0] && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }
            if (t && _.label < t[2]) {
              _.label = t[2];
              _.ops.push(op);
              break;
            }
            t[2] && _.ops.pop();
            _.trys.pop();
            continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [ 6, e ];
          y = 0;
        } finally {
          f = t = 0;
        }
        if (5 & op[0]) throw op[1];
        return {
          value: op[0] ? op[1] : void 0,
          done: true
        };
      }
    };
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.LoseView = void 0;
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var LoseView = function(_super) {
      __extends(LoseView, _super);
      function LoseView() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      LoseView.prototype.init = function(game) {
        var _this = this;
        this._game = game;
        this.button.node.on("click", function() {
          _this._game.finish();
          _this._game.start();
        });
      };
      LoseView.prototype.show = function(animated) {
        void 0 === animated && (animated = true);
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            this.panelLose.scale = 0;
            this.panelLose.active = true;
            this.panelLose.runAction(cc.spawn(cc.scaleTo(.3, 1), cc.fadeIn(.3)));
            return [ 2 ];
          });
        });
      };
      LoseView.prototype.hide = function(animated) {
        void 0 === animated && (animated = true);
        return __awaiter(this, void 0, void 0, function() {
          var _this = this;
          return __generator(this, function(_a) {
            if (animated) {
              this.panelLose.stopAllActions();
              this.panelLose.runAction(cc.sequence(cc.spawn(cc.scaleTo(.3, 0), cc.fadeOut(.3)), cc.callFunc(function() {
                _this.panelLose.active = false;
                _this.panelLose.opacity = 255;
              })));
            } else {
              this.panelLose.active = false;
              this.panelLose.opacity = 255;
            }
            return [ 2 ];
          });
        });
      };
      __decorate([ property(cc.Button) ], LoseView.prototype, "button", void 0);
      __decorate([ property(cc.Node) ], LoseView.prototype, "panelLose", void 0);
      LoseView = __decorate([ ccclass ], LoseView);
      return LoseView;
    }(cc.Component);
    exports.LoseView = LoseView;
    cc._RF.pop();
  }, {} ],
  Matches: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "8f3e1aZfqVMt5c5ETGIQtOG", "Matches");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.Matches = void 0;
    var SuperTile_1 = require("./superTiles/SuperTile");
    var Matches = function() {
      function Matches() {}
      Matches.prototype.hasAvailableMatches = function(board) {
        if (this.hasSuperTile(board)) return true;
        var visited = new Set();
        for (var x = 0; x < board.width; x++) for (var y = 0; y < board.height; y++) {
          var index = y * board.width + x;
          if (visited.has(index)) continue;
          var tile = board.getTile(x, y);
          if (!tile || tile.isEmpty) continue;
          var group = this.getAvaliableMatch(board, x, y);
          if (group.length >= 2) return true;
          group.forEach(function(t) {
            var tileIndex = t.y * board.width + t.x;
            visited.add(tileIndex);
          });
        }
        return false;
      };
      Matches.prototype.getAvaliableMatch = function(board, x, y) {
        var startTile = board.getTile(x, y);
        if (!startTile || startTile.isEmpty) return [];
        var visited = Array.from({
          length: board.width
        }, function() {
          return new Array(board.height).fill(false);
        });
        var group = [];
        var queue = [ [ x, y ] ];
        var targetColor = startTile.color;
        var directions = [ [ 1, 0 ], [ -1, 0 ], [ 0, 1 ], [ 0, -1 ] ];
        while (queue.length > 0) {
          var _a = queue.shift(), cx = _a[0], cy = _a[1];
          if (cx < 0 || cx >= board.width || cy < 0 || cy >= board.height) continue;
          if (visited[cx][cy]) continue;
          var tile = board.getTile(cx, cy);
          if (!tile || tile.isEmpty || tile.color !== targetColor) continue;
          visited[cx][cy] = true;
          group.push(tile);
          for (var _i = 0, directions_1 = directions; _i < directions_1.length; _i++) {
            var _b = directions_1[_i], dx = _b[0], dy = _b[1];
            queue.push([ cx + dx, cy + dy ]);
          }
        }
        return group.length >= 2 ? group : [];
      };
      Matches.prototype.hasSuperTile = function(board) {
        for (var x = 0; x < board.width; x++) for (var y = 0; y < board.height; y++) {
          var tile = board.getTile(x, y);
          if (tile instanceof SuperTile_1.SuperTile) return true;
        }
        return false;
      };
      return Matches;
    }();
    exports.Matches = Matches;
    cc._RF.pop();
  }, {
    "./superTiles/SuperTile": "SuperTile"
  } ],
  MaxBombSuperTileLogic: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "2ff1cmOzBRDq5km4wZWzUfu", "MaxBombSuperTileLogic");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.MaxBombSuperTileLogic = void 0;
    var SuperTileType_1 = require("./SuperTileType");
    var SuperTile_1 = require("./SuperTile");
    var DestroyEffect_1 = require("../effects/DestroyEffect");
    var MaxBombSuperTileLogic = function() {
      function MaxBombSuperTileLogic() {
        this.type = SuperTileType_1.SuperTileType.MAX_BOMB;
      }
      MaxBombSuperTileLogic.prototype.canProcess = function(ctx) {
        return ctx.selectedTile instanceof SuperTile_1.SuperTile && ctx.selectedTile.type == this.type;
      };
      MaxBombSuperTileLogic.prototype.onTileClick = function(ctx) {
        var tiles = this.activate(ctx.selectedTile, ctx.board);
        for (var _i = 0, tiles_1 = tiles; _i < tiles_1.length; _i++) {
          var tile = tiles_1[_i];
          ctx.tilesToRemove.add(tile);
        }
        var result = new DestroyEffect_1.DestroyEffect();
        result.tilesToRemove = tiles;
        return result;
      };
      MaxBombSuperTileLogic.prototype.activate = function(superTile, board) {
        var tiles = [];
        for (var x = 0; x < board.width; x++) for (var y = 0; y < board.height; y++) {
          var tile = board.getTile(x, y);
          tile && !tile.isEmpty && tiles.push(tile);
        }
        return tiles;
      };
      return MaxBombSuperTileLogic;
    }();
    exports.MaxBombSuperTileLogic = MaxBombSuperTileLogic;
    cc._RF.pop();
  }, {
    "../effects/DestroyEffect": "DestroyEffect",
    "./SuperTile": "SuperTile",
    "./SuperTileType": "SuperTileType"
  } ],
  MovesView: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "f32f4hpym5JlJNwd3sgCBcZ", "MovesView");
    "use strict";
    var __extends = this && this.__extends || function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || {
          __proto__: []
        } instanceof Array && function(d, b) {
          d.__proto__ = b;
        } || function(d, b) {
          for (var p in b) Object.prototype.hasOwnProperty.call(b, p) && (d[p] = b[p]);
        };
        return extendStatics(d, b);
      };
      return function(d, b) {
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    }();
    var __decorate = this && this.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if ("object" === typeof Reflect && "function" === typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) (d = decorators[i]) && (r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r);
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.MovesView = void 0;
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var MovesView = function(_super) {
      __extends(MovesView, _super);
      function MovesView() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      MovesView.prototype.init = function(moves) {
        this._moves = moves;
        this._currentDisplayMoves = moves.currentMoves;
      };
      MovesView.prototype.updateMoves = function(animated) {
        var _this = this;
        void 0 === animated && (animated = true);
        if (!animated) return new Promise(function(resolve) {
          _this.label.string = _this.label.string = "" + _this._moves.currentMoves;
          resolve();
        });
        return new Promise(function(resolve) {
          if (!_this.label) {
            resolve();
            return;
          }
          if (_this._currentDisplayMoves == _this._moves.currentMoves) {
            _this._currentDisplayMoves = _this._moves.currentMoves;
            _this.label.string = "" + _this._moves.currentMoves;
            resolve();
            return;
          }
          var oldMoves = _this._currentDisplayMoves;
          var newMoves = _this._moves.currentMoves;
          var difference = newMoves - oldMoves;
          if (0 === difference) {
            resolve();
            return;
          }
          _this.label.node.stopActionByTag(101);
          _this._currentDisplayMoves = newMoves;
          _this.label.string = "" + _this._currentDisplayMoves;
          var visualAction;
          visualAction = difference < 0 ? cc.sequence(cc.spawn(cc.scaleTo(.15, 1.2).easing(cc.easeOut(2)), cc.tintTo(.15, 255, 100, 100)), cc.spawn(cc.scaleTo(.25, 1).easing(cc.easeBackOut()), cc.tintTo(.25, 255, 255, 255)), cc.callFunc(function() {
            resolve();
          })) : cc.sequence(cc.spawn(cc.scaleTo(.15, 1.2).easing(cc.easeOut(2)), cc.tintTo(.15, 100, 255, 100)), cc.spawn(cc.scaleTo(.25, 1).easing(cc.easeBackOut()), cc.tintTo(.25, 255, 255, 255)), cc.callFunc(function() {
            resolve();
          }));
          visualAction.setTag(101);
          _this.label.node.runAction(visualAction);
        });
      };
      __decorate([ property(cc.Label) ], MovesView.prototype, "label", void 0);
      MovesView = __decorate([ ccclass ], MovesView);
      return MovesView;
    }(cc.Component);
    exports.MovesView = MovesView;
    cc._RF.pop();
  }, {} ],
  Moves: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "8680dr3NF9AA4YWIC7vAzmR", "Moves");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.Moves = void 0;
    var GameEvent_1 = require("../../GameEvent");
    var GameState_1 = require("../enums/GameState");
    var LoseEffect_1 = require("./effects/LoseEffect");
    var Moves = function() {
      function Moves(maxMoves) {
        this.onMovesChanged = new GameEvent_1.GameEvent();
        this._currentMoves = maxMoves;
        this.maxMoves = maxMoves;
      }
      Object.defineProperty(Moves.prototype, "currentMoves", {
        get: function() {
          return this._currentMoves;
        },
        set: function(value) {
          var _a;
          this._currentMoves = value;
          null === (_a = this.onMovesChanged) || void 0 === _a ? void 0 : _a.invoke(this.currentMoves);
        },
        enumerable: false,
        configurable: true
      });
      Moves.prototype.canProcess = function(ctx) {
        return true;
      };
      Moves.prototype.onPostTurn = function(ctx) {
        ctx.initialRemovedCount > 0 && this.decrementMove();
        if (!this.hasMovesLeft()) {
          ctx.setState(GameState_1.GameState.WIN);
          return new LoseEffect_1.LoseEffect();
        }
        return null;
      };
      Moves.prototype.decrementMove = function() {
        this._currentMoves > 0 && this.currentMoves--;
      };
      Moves.prototype.hasMovesLeft = function() {
        return this._currentMoves > 0;
      };
      Moves.prototype.reset = function() {
        this.currentMoves = this.maxMoves;
      };
      return Moves;
    }();
    exports.Moves = Moves;
    cc._RF.pop();
  }, {
    "../../GameEvent": "GameEvent",
    "../enums/GameState": "GameState",
    "./effects/LoseEffect": "LoseEffect"
  } ],
  NormalClickProcessor: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "0833f+5iKJOmpmT1U/ySgG+", "NormalClickProcessor");
    "use strict";
    var __spreadArrays = this && this.__spreadArrays || function() {
      for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
      for (var r = Array(s), k = 0, i = 0; i < il; i++) for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, 
      k++) r[k] = a[j];
      return r;
    };
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.NormalClickProcessor = void 0;
    var InputState_1 = require("./enums/InputState");
    var DestroyEffect_1 = require("./mechanics/effects/DestroyEffect");
    var ShakeEffect_1 = require("./mechanics/effects/ShakeEffect");
    var SuperTile_1 = require("./mechanics/superTiles/SuperTile");
    var NormalClickProcessor = function() {
      function NormalClickProcessor() {}
      NormalClickProcessor.prototype.canProcess = function(ctx) {
        return ctx.getInputState() == InputState_1.InputState.NORMAL;
      };
      NormalClickProcessor.prototype.onTileClick = function(ctx) {
        var match = ctx.matches.getAvaliableMatch(ctx.board, ctx.selectedTile.x, ctx.selectedTile.y);
        ctx.initialRemovedCount = match.length;
        if (0 == match.length) {
          var shakeEffect = new ShakeEffect_1.ShakeEffect();
          shakeEffect.tileToShake = ctx.selectedTile;
          return shakeEffect;
        }
        var toRemove = ctx.selectedTile instanceof SuperTile_1.SuperTile ? __spreadArrays(match, [ ctx.selectedTile ]) : __spreadArrays(match);
        for (var _i = 0, toRemove_1 = toRemove; _i < toRemove_1.length; _i++) {
          var tile = toRemove_1[_i];
          ctx.tilesToRemove.add(tile);
        }
        var destroyEffect = new DestroyEffect_1.DestroyEffect();
        destroyEffect.tilesToRemove = toRemove;
        return destroyEffect;
      };
      return NormalClickProcessor;
    }();
    exports.NormalClickProcessor = NormalClickProcessor;
    cc._RF.pop();
  }, {
    "./enums/InputState": "InputState",
    "./mechanics/effects/DestroyEffect": "DestroyEffect",
    "./mechanics/effects/ShakeEffect": "ShakeEffect",
    "./mechanics/superTiles/SuperTile": "SuperTile"
  } ],
  OverlayView: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "a6e77yI4KVMC7pUe7qUplnC", "OverlayView");
    "use strict";
    var __extends = this && this.__extends || function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || {
          __proto__: []
        } instanceof Array && function(d, b) {
          d.__proto__ = b;
        } || function(d, b) {
          for (var p in b) Object.prototype.hasOwnProperty.call(b, p) && (d[p] = b[p]);
        };
        return extendStatics(d, b);
      };
      return function(d, b) {
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    }();
    var __decorate = this && this.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if ("object" === typeof Reflect && "function" === typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) (d = decorators[i]) && (r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r);
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __awaiter = this && this.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var __generator = this && this.__generator || function(thisArg, body) {
      var _ = {
        label: 0,
        sent: function() {
          if (1 & t[0]) throw t[1];
          return t[1];
        },
        trys: [],
        ops: []
      }, f, y, t, g;
      return g = {
        next: verb(0),
        throw: verb(1),
        return: verb(2)
      }, "function" === typeof Symbol && (g[Symbol.iterator] = function() {
        return this;
      }), g;
      function verb(n) {
        return function(v) {
          return step([ n, v ]);
        };
      }
      function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
          if (f = 1, y && (t = 2 & op[0] ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 
          0) : y.next) && !(t = t.call(y, op[1])).done) return t;
          (y = 0, t) && (op = [ 2 & op[0], t.value ]);
          switch (op[0]) {
           case 0:
           case 1:
            t = op;
            break;

           case 4:
            _.label++;
            return {
              value: op[1],
              done: false
            };

           case 5:
            _.label++;
            y = op[1];
            op = [ 0 ];
            continue;

           case 7:
            op = _.ops.pop();
            _.trys.pop();
            continue;

           default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (6 === op[0] || 2 === op[0])) {
              _ = 0;
              continue;
            }
            if (3 === op[0] && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }
            if (6 === op[0] && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }
            if (t && _.label < t[2]) {
              _.label = t[2];
              _.ops.push(op);
              break;
            }
            t[2] && _.ops.pop();
            _.trys.pop();
            continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [ 6, e ];
          y = 0;
        } finally {
          f = t = 0;
        }
        if (5 & op[0]) throw op[1];
        return {
          value: op[0] ? op[1] : void 0,
          done: true
        };
      }
    };
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.OverlayView = void 0;
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var OverlayView = function(_super) {
      __extends(OverlayView, _super);
      function OverlayView() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      OverlayView.prototype.onEnable = function() {
        this._currentOpacity = this.ovelay.opacity;
      };
      OverlayView.prototype.show = function(animated) {
        void 0 === animated && (animated = true);
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            if (animated) {
              this.ovelay.opacity = 0;
              this.ovelay.active = true;
              this.ovelay.runAction(cc.fadeTo(.3, this._currentOpacity));
            } else this.ovelay.opacity = this._currentOpacity;
            return [ 2 ];
          });
        });
      };
      OverlayView.prototype.hide = function(animated) {
        void 0 === animated && (animated = true);
        return __awaiter(this, void 0, void 0, function() {
          var _this = this;
          return __generator(this, function(_a) {
            animated ? this.ovelay.runAction(cc.sequence(cc.fadeOut(.3), cc.callFunc(function() {
              _this.ovelay.active = false;
            }))) : this.ovelay.active = false;
            return [ 2 ];
          });
        });
      };
      __decorate([ property(cc.Node) ], OverlayView.prototype, "ovelay", void 0);
      OverlayView = __decorate([ ccclass ], OverlayView);
      return OverlayView;
    }(cc.Component);
    exports.OverlayView = OverlayView;
    cc._RF.pop();
  }, {} ],
  RadiusBombSuperTileLogic: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "13630YOrLZDi4/Rf9B0mdVh", "RadiusBombSuperTileLogic");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.RadiusBombSuperTileLogic = void 0;
    var SuperTileType_1 = require("./SuperTileType");
    var SuperTile_1 = require("./SuperTile");
    var DestroyEffect_1 = require("../effects/DestroyEffect");
    var RadiusBombSuperTileLogic = function() {
      function RadiusBombSuperTileLogic(bombRadius) {
        this.type = SuperTileType_1.SuperTileType.RADIUS_BOMB;
        this._bombRadius = bombRadius;
      }
      RadiusBombSuperTileLogic.prototype.canProcess = function(ctx) {
        return ctx.selectedTile instanceof SuperTile_1.SuperTile && ctx.selectedTile.type == this.type;
      };
      RadiusBombSuperTileLogic.prototype.canProcessTile = function(tile) {
        return tile instanceof SuperTile_1.SuperTile && tile.type == this.type;
      };
      RadiusBombSuperTileLogic.prototype.onTileClick = function(ctx) {
        var tiles = this.activate(ctx.selectedTile, ctx.board);
        for (var _i = 0, tiles_1 = tiles; _i < tiles_1.length; _i++) {
          var tile = tiles_1[_i];
          ctx.tilesToRemove.add(tile);
        }
        var result = new DestroyEffect_1.DestroyEffect();
        result.tilesToRemove = tiles;
        return result;
      };
      RadiusBombSuperTileLogic.prototype.activate = function(superTile, board) {
        var tiles = [];
        for (var dx = -this._bombRadius; dx <= this._bombRadius; dx++) for (var dy = -this._bombRadius; dy <= this._bombRadius; dy++) {
          var distance = Math.sqrt(dx * dx + dy * dy);
          if (distance <= this._bombRadius) {
            var tile = board.getTile(superTile.x + dx, superTile.y + dy);
            tile && !tile.isEmpty && tiles.push(tile);
          }
        }
        return tiles;
      };
      return RadiusBombSuperTileLogic;
    }();
    exports.RadiusBombSuperTileLogic = RadiusBombSuperTileLogic;
    cc._RF.pop();
  }, {
    "../effects/DestroyEffect": "DestroyEffect",
    "./SuperTile": "SuperTile",
    "./SuperTileType": "SuperTileType"
  } ],
  ScoreView: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "d2cc0s8AfxHxb0ObNchtox2", "ScoreView");
    "use strict";
    var __extends = this && this.__extends || function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || {
          __proto__: []
        } instanceof Array && function(d, b) {
          d.__proto__ = b;
        } || function(d, b) {
          for (var p in b) Object.prototype.hasOwnProperty.call(b, p) && (d[p] = b[p]);
        };
        return extendStatics(d, b);
      };
      return function(d, b) {
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    }();
    var __decorate = this && this.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if ("object" === typeof Reflect && "function" === typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) (d = decorators[i]) && (r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r);
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.ScoreView = void 0;
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var ScoreView = function(_super) {
      __extends(ScoreView, _super);
      function ScoreView() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      ScoreView.prototype.init = function(game) {
        this._score = game;
        this._currentDisplayScore = this._score.currentScore;
      };
      ScoreView.prototype.updateScore = function(animated) {
        var _this = this;
        void 0 === animated && (animated = true);
        if (!animated) return new Promise(function(resolve) {
          _this.label.string = _this._score.currentScore + "/" + _this._score.targetScore;
          resolve();
        });
        return new Promise(function(resolve) {
          if (!_this.label) {
            resolve();
            return;
          }
          if (_this._currentDisplayScore == _this._score.currentScore) {
            _this._currentDisplayScore = _this._score.currentScore;
            _this.label.string = _this._score.currentScore + "/" + _this._score.targetScore;
            resolve();
            return;
          }
          var oldScore = _this._currentDisplayScore;
          var newScore = _this._score.currentScore;
          var difference = newScore - oldScore;
          if (0 === difference) {
            resolve();
            return;
          }
          _this.label.node.stopActionByTag(100);
          var duration = .5;
          var steps = 20;
          var increment = difference / steps;
          var currentStep = 0;
          var counterAction = cc.repeat(cc.sequence(cc.delayTime(duration / steps), cc.callFunc(function() {
            currentStep++;
            _this._currentDisplayScore = Math.floor(oldScore + increment * currentStep);
            currentStep >= steps && (_this._currentDisplayScore = newScore);
            _this.label.string = _this._currentDisplayScore + "/" + _this._score.targetScore;
          })), steps);
          var visualAction = cc.sequence(cc.spawn(cc.scaleTo(.2, 1.3).easing(cc.easeOut(2)), cc.tintTo(.2, 255, 255, 100)), cc.spawn(cc.scaleTo(.3, 1).easing(cc.easeBackOut()), cc.tintTo(.3, 255, 255, 255)));
          var combinedAction = cc.spawn(counterAction, cc.sequence(visualAction, cc.callFunc(function() {
            resolve();
          })));
          combinedAction.setTag(100);
          _this.label.node.runAction(combinedAction);
        });
      };
      __decorate([ property(cc.Label) ], ScoreView.prototype, "label", void 0);
      ScoreView = __decorate([ ccclass ], ScoreView);
      return ScoreView;
    }(cc.Component);
    exports.ScoreView = ScoreView;
    cc._RF.pop();
  }, {} ],
  Score: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "7cde4BqeNhDO6LoXXiW2B8R", "Score");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.Score = void 0;
    var GameEvent_1 = require("../../GameEvent");
    var GameState_1 = require("../enums/GameState");
    var WinEffect_1 = require("./effects/WinEffect");
    var Score = function() {
      function Score(targetScore, scorePerTile) {
        this.onScoreChanged = new GameEvent_1.GameEvent();
        this._currentScore = 0;
        this.targetScore = targetScore;
        this.scorePerTile = scorePerTile;
      }
      Score.prototype.canProcess = function(ctx) {
        return true;
      };
      Score.prototype.onPostTurn = function(ctx) {
        this.addScore(this.calculateScore(ctx.tilesToRemove.size));
        if (this.hasReachedTarget()) {
          ctx.setState(GameState_1.GameState.WIN);
          return new WinEffect_1.WinEffect();
        }
        return null;
      };
      Object.defineProperty(Score.prototype, "currentScore", {
        get: function() {
          return this._currentScore;
        },
        set: function(value) {
          var _a;
          this._currentScore = value;
          null === (_a = this.onScoreChanged) || void 0 === _a ? void 0 : _a.invoke(this.currentScore);
        },
        enumerable: false,
        configurable: true
      });
      Score.prototype.calculateScore = function(tilesCount) {
        return tilesCount * tilesCount * this.scorePerTile;
      };
      Score.prototype.addScore = function(points) {
        this.currentScore += points;
      };
      Score.prototype.hasReachedTarget = function() {
        return this._currentScore >= this.targetScore;
      };
      Score.prototype.reset = function() {
        this.currentScore = 0;
      };
      return Score;
    }();
    exports.Score = Score;
    cc._RF.pop();
  }, {
    "../../GameEvent": "GameEvent",
    "../enums/GameState": "GameState",
    "./effects/WinEffect": "WinEffect"
  } ],
  ShakeEffect: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "0184bTXnVdPD5dXjNCkbCvS", "ShakeEffect");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.ShakeEffect = void 0;
    var ShakeEffect = function() {
      function ShakeEffect() {}
      return ShakeEffect;
    }();
    exports.ShakeEffect = ShakeEffect;
    cc._RF.pop();
  }, {} ],
  ShuffleEffect: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "f134eV/Zp9POKDjNp7G1j4G", "ShuffleEffect");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.ShuffleEffect = void 0;
    var ShuffleEffect = function() {
      function ShuffleEffect() {}
      return ShuffleEffect;
    }();
    exports.ShuffleEffect = ShuffleEffect;
    cc._RF.pop();
  }, {} ],
  Shuffle: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "5fc14noN1JKmrfrO3do9Xkt", "Shuffle");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.Shuffle = void 0;
    var ShuffleEffect_1 = require("./effects/ShuffleEffect");
    var Shuffle = function() {
      function Shuffle(maxAttempts) {
        this.maxAttempts = maxAttempts;
        this._attempts = maxAttempts;
      }
      Object.defineProperty(Shuffle.prototype, "attempts", {
        get: function() {
          return this._attempts;
        },
        enumerable: false,
        configurable: true
      });
      Shuffle.prototype.canProcess = function(ctx) {
        return true;
      };
      Shuffle.prototype.onPreTurn = function(ctx) {
        this.reset();
        var shuffled = false;
        while (this.shuffleAvaliable() && !ctx.matches.hasAvailableMatches(ctx.board)) {
          this.shuffle(ctx.board);
          shuffled = true;
        }
        if (shuffled && ctx.matches.hasAvailableMatches(ctx.board)) {
          var result = new ShuffleEffect_1.ShuffleEffect();
          result.tilesToShuffle = ctx.board.getAllTiles();
          return result;
        }
      };
      Shuffle.prototype.shuffleAvaliable = function() {
        return this._attempts > 0;
      };
      Shuffle.prototype.shuffle = function(board) {
        var _a;
        var allTiles = [];
        for (var x = 0; x < board.width; x++) for (var y = 0; y < board.height; y++) {
          var tile = board.getTile(x, y);
          tile && !tile.isEmpty && allTiles.push(tile);
        }
        for (var i = allTiles.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          _a = [ allTiles[j], allTiles[i] ], allTiles[i] = _a[0], allTiles[j] = _a[1];
        }
        var index = 0;
        for (var x = 0; x < board.width; x++) for (var y = 0; y < board.height; y++) if (index < allTiles.length) {
          var tile = allTiles[index];
          tile.setPosition(x, y);
          board.setTile(x, y, tile);
          index++;
        }
      };
      Shuffle.prototype.reset = function() {
        this._attempts = this.maxAttempts;
      };
      return Shuffle;
    }();
    exports.Shuffle = Shuffle;
    cc._RF.pop();
  }, {
    "./effects/ShuffleEffect": "ShuffleEffect"
  } ],
  Spawner: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "5a723gFA0VCILwuJJzptWh8", "Spawner");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.Spawner = void 0;
    var TileColor_1 = require("../enums/TileColor");
    var Tile_1 = require("../Tile");
    var SuperTile_1 = require("./superTiles/SuperTile");
    var TileSpawnEffect_1 = require("./effects/TileSpawnEffect");
    var Spawner = function() {
      function Spawner() {
        this.avaliableColors = Array();
      }
      Spawner.prototype.canProcess = function(ctx) {
        return true;
      };
      Spawner.prototype.onPreGame = function(game) {
        var toSpawn = this.fillWithRegularTiles(game.board);
        for (var _i = 0, toSpawn_1 = toSpawn; _i < toSpawn_1.length; _i++) {
          var tile = toSpawn_1[_i];
          game.board.setTile(tile.x, tile.y, tile);
        }
        var spawnEffect = new TileSpawnEffect_1.TileSpawnEffect();
        spawnEffect.tilesToSpawn = toSpawn;
        return spawnEffect;
      };
      Spawner.prototype.onPostGame = function(game) {
        game.board.clear();
      };
      Spawner.prototype.onPostTurn = function(ctx) {
        var toSpawn = this.fillWithRegularTiles(ctx.board);
        for (var _i = 0, toSpawn_2 = toSpawn; _i < toSpawn_2.length; _i++) {
          var tile = toSpawn_2[_i];
          ctx.board.setTile(tile.x, tile.y, tile);
        }
        var spawnEffect = new TileSpawnEffect_1.TileSpawnEffect();
        spawnEffect.tilesToSpawn = toSpawn;
        return spawnEffect;
      };
      Spawner.prototype.register = function(color) {
        this.avaliableColors.push(color);
      };
      Spawner.prototype.fillWithRegularTiles = function(board) {
        var tilesUpdated = new Array();
        for (var x = 0; x < board.width; x++) for (var y = 0; y < board.height; y++) if (null == board.getTile(x, y) || board.getTile(x, y).isEmpty) {
          var tile = this.createRandomRegularTile(x, y);
          board.setTile(x, y, tile);
          tilesUpdated.push(tile);
        }
        return tilesUpdated;
      };
      Spawner.prototype.createRandomRegularTile = function(x, y) {
        var color = Math.floor(Math.random() * this.avaliableColors.length);
        return new Tile_1.Tile(x, y, color);
      };
      Spawner.prototype.createSuperTile = function(x, y, type) {
        return new SuperTile_1.SuperTile(x, y, TileColor_1.TileColor.SPECIAL, type);
      };
      Spawner.prototype.createRegularTile = function(x, y, color) {
        return new Tile_1.Tile(x, y, color);
      };
      return Spawner;
    }();
    exports.Spawner = Spawner;
    cc._RF.pop();
  }, {
    "../Tile": "Tile",
    "../enums/TileColor": "TileColor",
    "./effects/TileSpawnEffect": "TileSpawnEffect",
    "./superTiles/SuperTile": "SuperTile"
  } ],
  SuperTileFactory: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "a31beqOcY5C0IZXEOYF7lyt", "SuperTileFactory");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.SuperTileFactory = void 0;
    var SuperTileType_1 = require("./SuperTileType");
    var SuperTileFactory = function() {
      function SuperTileFactory() {
        this._thresholds = [];
      }
      SuperTileFactory.prototype.register = function(type, threshold) {
        this._thresholds.push({
          threshold: threshold,
          type: type
        });
      };
      SuperTileFactory.prototype.getType = function(tilesRemoved) {
        var available = this._thresholds.filter(function(t) {
          return tilesRemoved >= t.threshold;
        });
        if (0 == available.length) return SuperTileType_1.SuperTileType.NONE;
        var random = Math.floor(Math.random() * available.length);
        return available[random].type;
      };
      return SuperTileFactory;
    }();
    exports.SuperTileFactory = SuperTileFactory;
    cc._RF.pop();
  }, {
    "./SuperTileType": "SuperTileType"
  } ],
  SuperTileLogic: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "afb138VjedIzaFux1e1jszn", "SuperTileLogic");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    cc._RF.pop();
  }, {} ],
  SuperTileSpawnEffect: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "66995FdfW1AG7NOQAQOvxs/", "SuperTileSpawnEffect");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.SuperTileSpawnEffect = void 0;
    var SuperTileSpawnEffect = function() {
      function SuperTileSpawnEffect() {}
      return SuperTileSpawnEffect;
    }();
    exports.SuperTileSpawnEffect = SuperTileSpawnEffect;
    cc._RF.pop();
  }, {} ],
  SuperTileType: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "1c888xJwrlAUL8ylGnSftXA", "SuperTileType");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.SuperTileType = void 0;
    var SuperTileType;
    (function(SuperTileType) {
      SuperTileType[SuperTileType["HORIZONTAL"] = 0] = "HORIZONTAL";
      SuperTileType[SuperTileType["VERTICAL"] = 1] = "VERTICAL";
      SuperTileType[SuperTileType["RADIUS_BOMB"] = 2] = "RADIUS_BOMB";
      SuperTileType[SuperTileType["MAX_BOMB"] = 3] = "MAX_BOMB";
      SuperTileType[SuperTileType["NONE"] = -1] = "NONE";
    })(SuperTileType = exports.SuperTileType || (exports.SuperTileType = {}));
    cc._RF.pop();
  }, {} ],
  SuperTiles: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "b4a1cOPyG9FcpLN5K/4fTM4", "SuperTiles");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.SuperTiles = void 0;
    var SuperTileType_1 = require("./SuperTileType");
    var SuperTile_1 = require("./SuperTile");
    var SuperTileFactory_1 = require("./SuperTileFactory");
    var SuperTileSpawnEffect_1 = require("../effects/SuperTileSpawnEffect");
    var SuperTiles = function() {
      function SuperTiles() {
        this._logics = new Map();
        this._typeFactory = new SuperTileFactory_1.SuperTileFactory();
      }
      SuperTiles.prototype.register = function(logic, threshold) {
        this._logics.set(logic.type, logic);
        this._typeFactory.register(logic.type, threshold);
      };
      SuperTiles.prototype.canProcess = function(ctx) {
        return true;
      };
      SuperTiles.prototype.onTileClick = function(ctx) {
        if (!(ctx.selectedTile instanceof SuperTile_1.SuperTile)) {
          var superType = this.getSuperTileType(ctx.initialRemovedCount);
          if (superType == SuperTileType_1.SuperTileType.NONE) return null;
          ctx.tilesToRemove.delete(ctx.board.getTile(ctx.selectedTile.x, ctx.selectedTile.y));
          var superTile = ctx.spawner.createSuperTile(ctx.selectedTile.x, ctx.selectedTile.y, superType);
          ctx.board.setTile(ctx.selectedTile.x, ctx.selectedTile.y, superTile);
          var effect = new SuperTileSpawnEffect_1.SuperTileSpawnEffect();
          effect.superTile = superTile;
          return effect;
        }
        for (var _i = 0, _a = Array.from(this._logics.values()); _i < _a.length; _i++) {
          var logic = _a[_i];
          if (logic.canProcess(ctx)) return logic.onTileClick(ctx);
        }
      };
      SuperTiles.prototype.getSuperTileType = function(tilesRemoved) {
        return this._typeFactory.getType(tilesRemoved);
      };
      SuperTiles.prototype.activate = function(superTile, board) {
        var logic = this._logics.get(superTile.type);
        return logic ? logic.activate(superTile, board) : [];
      };
      return SuperTiles;
    }();
    exports.SuperTiles = SuperTiles;
    cc._RF.pop();
  }, {
    "../effects/SuperTileSpawnEffect": "SuperTileSpawnEffect",
    "./SuperTile": "SuperTile",
    "./SuperTileFactory": "SuperTileFactory",
    "./SuperTileType": "SuperTileType"
  } ],
  SuperTile: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "2082aFxIdxItpGW+YJGydML", "SuperTile");
    "use strict";
    var __extends = this && this.__extends || function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || {
          __proto__: []
        } instanceof Array && function(d, b) {
          d.__proto__ = b;
        } || function(d, b) {
          for (var p in b) Object.prototype.hasOwnProperty.call(b, p) && (d[p] = b[p]);
        };
        return extendStatics(d, b);
      };
      return function(d, b) {
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    }();
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.SuperTile = void 0;
    var Tile_1 = require("../../Tile");
    var SuperTile = function(_super) {
      __extends(SuperTile, _super);
      function SuperTile(x, y, color, type) {
        var _this = _super.call(this, x, y, color) || this;
        _this.type = type;
        return _this;
      }
      return SuperTile;
    }(Tile_1.Tile);
    exports.SuperTile = SuperTile;
    cc._RF.pop();
  }, {
    "../../Tile": "Tile"
  } ],
  SwapEffect: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "6a44a3cKgVCa6MVSnhm2Kl6", "SwapEffect");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.SwapEffect = void 0;
    var SwapEffect = function() {
      function SwapEffect() {}
      return SwapEffect;
    }();
    exports.SwapEffect = SwapEffect;
    cc._RF.pop();
  }, {} ],
  TeleportBooster: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "cd235ZO1FBJQ5aRKxOhiNSz", "TeleportBooster");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.TeleportBooster = void 0;
    var GameEvent_1 = require("../../../GameEvent");
    var BoosterType_1 = require("../../enums/BoosterType");
    var InputState_1 = require("../../enums/InputState");
    var SwapEffect_1 = require("../effects/SwapEffect");
    var TeleportBooster = function() {
      function TeleportBooster(count) {
        this.type = BoosterType_1.BoosterType.TELEPORT;
        this.initialInputState = InputState_1.InputState.TELEPORT_PHASE_ONE;
        this.onCountChanged = new GameEvent_1.GameEvent();
        this._maxCount = count;
        this._count = count;
      }
      TeleportBooster.prototype.canProcess = function(ctx) {
        return this.canUse();
      };
      TeleportBooster.prototype.onTileClick = function(ctx) {
        if (!this.canUse()) return [];
        if (!this._firstTile) {
          this._firstTile = ctx.selectedTile;
          ctx.setInputState(InputState_1.InputState.TELEPORT_PHASE_TWO);
          return null;
        }
        ctx.board.swapTiles(this._firstTile, ctx.selectedTile);
        var effect = new SwapEffect_1.SwapEffect();
        effect.left = this._firstTile;
        effect.right = ctx.selectedTile;
        this._firstTile = null;
        this.setCount(this._count - 1);
        ctx.setInputState(InputState_1.InputState.NORMAL);
        return effect;
      };
      TeleportBooster.prototype.getCount = function() {
        return this._count;
      };
      TeleportBooster.prototype.canUse = function() {
        return this._count > 0;
      };
      TeleportBooster.prototype.reset = function() {
        this.setCount(this._maxCount);
        this._firstTile = null;
      };
      TeleportBooster.prototype.setCount = function(value) {
        this._count = value;
        this.onCountChanged.invoke(this._count);
      };
      return TeleportBooster;
    }();
    exports.TeleportBooster = TeleportBooster;
    cc._RF.pop();
  }, {
    "../../../GameEvent": "GameEvent",
    "../../enums/BoosterType": "BoosterType",
    "../../enums/InputState": "InputState",
    "../effects/SwapEffect": "SwapEffect"
  } ],
  TileColor: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "ee044krjV5NH56pcD/FIZ/6", "TileColor");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.TileColor = void 0;
    var TileColor;
    (function(TileColor) {
      TileColor[TileColor["RED"] = 0] = "RED";
      TileColor[TileColor["BLUE"] = 1] = "BLUE";
      TileColor[TileColor["GREEN"] = 2] = "GREEN";
      TileColor[TileColor["YELLOW"] = 3] = "YELLOW";
      TileColor[TileColor["PURPLE"] = 4] = "PURPLE";
      TileColor[TileColor["SPECIAL"] = 5] = "SPECIAL";
      TileColor[TileColor["EMPTY"] = -1] = "EMPTY";
    })(TileColor = exports.TileColor || (exports.TileColor = {}));
    cc._RF.pop();
  }, {} ],
  TileSpawnEffect: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "bf93cuFvNJLLZJSm9sBxxzW", "TileSpawnEffect");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.TileSpawnEffect = void 0;
    var TileSpawnEffect = function() {
      function TileSpawnEffect() {}
      return TileSpawnEffect;
    }();
    exports.TileSpawnEffect = TileSpawnEffect;
    cc._RF.pop();
  }, {} ],
  TileViewPool: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "e642ccsMD1Jm4kM88JHsefy", "TileViewPool");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.TileViewPool = void 0;
    var SuperTile_1 = require("../mechanics/superTiles/SuperTile");
    var TileView_1 = require("./TileView");
    var TileViewPool = function() {
      function TileViewPool() {
        this.regularTilesSprites = new Map();
        this.superTilesSprites = new Map();
      }
      TileViewPool.prototype.registerRegularTile = function(color, sprite) {
        this.regularTilesSprites.set(color, sprite);
      };
      TileViewPool.prototype.registerSuperTile = function(type, sprite) {
        this.superTilesSprites.set(type, sprite);
      };
      TileViewPool.prototype.init = function(prefab, preinstantiatedCount) {
        this.prefab = prefab;
        this.pool = new cc.NodePool(TileViewPool.TILES_POOL_NAME);
        for (var i = 0; i < preinstantiatedCount; i++) {
          var tileView = cc.instantiate(this.prefab);
          this.pool.put(tileView);
        }
      };
      TileViewPool.prototype.terminate = function() {
        this.pool.clear();
      };
      TileViewPool.prototype.get = function(tile) {
        var node = this.pool.get();
        null == node && (node = cc.instantiate(this.prefab));
        var view = node.getComponent(TileView_1.default);
        if (tile instanceof SuperTile_1.SuperTile) {
          var sprite = this.superTilesSprites.get(tile.type);
          view.setSpriteFrame(sprite);
        } else {
          var sprite = this.regularTilesSprites.get(tile.color);
          view.setSpriteFrame(sprite);
        }
        return view;
      };
      TileViewPool.prototype.put = function(tileView) {
        this.pool.put(tileView.node);
      };
      TileViewPool.TILES_POOL_NAME = "TilesPool";
      return TileViewPool;
    }();
    exports.TileViewPool = TileViewPool;
    cc._RF.pop();
  }, {
    "../mechanics/superTiles/SuperTile": "SuperTile",
    "./TileView": "TileView"
  } ],
  TileView: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "ad713u6Fd5B26+VYCB9cWSt", "TileView");
    "use strict";
    var __extends = this && this.__extends || function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || {
          __proto__: []
        } instanceof Array && function(d, b) {
          d.__proto__ = b;
        } || function(d, b) {
          for (var p in b) Object.prototype.hasOwnProperty.call(b, p) && (d[p] = b[p]);
        };
        return extendStatics(d, b);
      };
      return function(d, b) {
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    }();
    var __decorate = this && this.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if ("object" === typeof Reflect && "function" === typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) (d = decorators[i]) && (r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r);
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var TileView = function(_super) {
      __extends(TileView, _super);
      function TileView() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.sprite = null;
        return _this;
      }
      TileView.prototype.setSpriteFrame = function(spriteFrame) {
        if (spriteFrame) {
          this.node.active = true;
          this.sprite.spriteFrame = spriteFrame;
        } else this.node.active = false;
      };
      TileView.prototype.getPosition = function() {
        return this.node.position;
      };
      TileView.prototype.animateShake = function() {
        this.node.stopActionByTag(999);
        var originalPos = this.node.position.clone();
        var shakeDistance = 10;
        var shakeSpeed = .05;
        var shakeAction = cc.sequence(cc.moveBy(shakeSpeed, -shakeDistance, 0), cc.moveBy(shakeSpeed, 2 * shakeDistance, 0), cc.moveBy(shakeSpeed, 2 * -shakeDistance, 0), cc.moveBy(shakeSpeed, shakeDistance, 0), cc.moveTo(0, originalPos.x, originalPos.y));
        shakeAction.setTag(999);
        this.node.runAction(shakeAction);
      };
      __decorate([ property(cc.Sprite) ], TileView.prototype, "sprite", void 0);
      TileView = __decorate([ ccclass ], TileView);
      return TileView;
    }(cc.Component);
    exports.default = TileView;
    cc._RF.pop();
  }, {} ],
  Tile: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "47fd5mz3tVEXZ11SnAmsDI3", "Tile");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.Tile = void 0;
    var TileColor_1 = require("./enums/TileColor");
    var Tile = function() {
      function Tile(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
      }
      Object.defineProperty(Tile.prototype, "isEmpty", {
        get: function() {
          return this.color == TileColor_1.TileColor.EMPTY;
        },
        enumerable: false,
        configurable: true
      });
      Tile.prototype.setPosition = function(x, y) {
        this.x = x;
        this.y = y;
      };
      return Tile;
    }();
    exports.Tile = Tile;
    cc._RF.pop();
  }, {
    "./enums/TileColor": "TileColor"
  } ],
  TurnContext: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "3bcd3/+U1dCDZu99UFzz5Gx", "TurnContext");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    cc._RF.pop();
  }, {} ],
  TurnProcessor: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "53df3nEnk5Iz4bdDirSa2Zz", "TurnProcessor");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    cc._RF.pop();
  }, {} ],
  WinEffect: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "11106EQAXtEIZh3h/hvbaJ3", "WinEffect");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.WinEffect = void 0;
    var WinEffect = function() {
      function WinEffect() {}
      return WinEffect;
    }();
    exports.WinEffect = WinEffect;
    cc._RF.pop();
  }, {} ],
  WinView: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "1fd5a8HdBdO+ZnUN9fL9qBw", "WinView");
    "use strict";
    var __extends = this && this.__extends || function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || {
          __proto__: []
        } instanceof Array && function(d, b) {
          d.__proto__ = b;
        } || function(d, b) {
          for (var p in b) Object.prototype.hasOwnProperty.call(b, p) && (d[p] = b[p]);
        };
        return extendStatics(d, b);
      };
      return function(d, b) {
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        d.prototype = null === b ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    }();
    var __decorate = this && this.__decorate || function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if ("object" === typeof Reflect && "function" === typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) (d = decorators[i]) && (r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r);
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __awaiter = this && this.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var __generator = this && this.__generator || function(thisArg, body) {
      var _ = {
        label: 0,
        sent: function() {
          if (1 & t[0]) throw t[1];
          return t[1];
        },
        trys: [],
        ops: []
      }, f, y, t, g;
      return g = {
        next: verb(0),
        throw: verb(1),
        return: verb(2)
      }, "function" === typeof Symbol && (g[Symbol.iterator] = function() {
        return this;
      }), g;
      function verb(n) {
        return function(v) {
          return step([ n, v ]);
        };
      }
      function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
          if (f = 1, y && (t = 2 & op[0] ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 
          0) : y.next) && !(t = t.call(y, op[1])).done) return t;
          (y = 0, t) && (op = [ 2 & op[0], t.value ]);
          switch (op[0]) {
           case 0:
           case 1:
            t = op;
            break;

           case 4:
            _.label++;
            return {
              value: op[1],
              done: false
            };

           case 5:
            _.label++;
            y = op[1];
            op = [ 0 ];
            continue;

           case 7:
            op = _.ops.pop();
            _.trys.pop();
            continue;

           default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (6 === op[0] || 2 === op[0])) {
              _ = 0;
              continue;
            }
            if (3 === op[0] && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }
            if (6 === op[0] && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }
            if (t && _.label < t[2]) {
              _.label = t[2];
              _.ops.push(op);
              break;
            }
            t[2] && _.ops.pop();
            _.trys.pop();
            continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [ 6, e ];
          y = 0;
        } finally {
          f = t = 0;
        }
        if (5 & op[0]) throw op[1];
        return {
          value: op[0] ? op[1] : void 0,
          done: true
        };
      }
    };
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.WinView = void 0;
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var WinView = function(_super) {
      __extends(WinView, _super);
      function WinView() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      WinView.prototype.init = function(game) {
        var _this = this;
        this._game = game;
        this.button.node.on("click", function() {
          _this._game.finish();
          _this._game.start();
        });
      };
      WinView.prototype.show = function() {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            this.panelWin.scale = 0;
            this.panelWin.active = true;
            this.panelWin.runAction(cc.spawn(cc.scaleTo(.3, 1), cc.fadeIn(.3)));
            return [ 2 ];
          });
        });
      };
      WinView.prototype.hide = function(animated) {
        void 0 === animated && (animated = true);
        return __awaiter(this, void 0, void 0, function() {
          var _this = this;
          return __generator(this, function(_a) {
            if (animated) {
              this.panelWin.stopAllActions();
              this.panelWin.runAction(cc.sequence(cc.spawn(cc.scaleTo(.3, 0), cc.fadeOut(.3)), cc.callFunc(function() {
                _this.panelWin.active = false;
                _this.panelWin.opacity = 255;
              })));
            } else {
              this.panelWin.active = false;
              this.panelWin.opacity = 255;
            }
            return [ 2 ];
          });
        });
      };
      __decorate([ property(cc.Button) ], WinView.prototype, "button", void 0);
      __decorate([ property(cc.Node) ], WinView.prototype, "panelWin", void 0);
      WinView = __decorate([ ccclass ], WinView);
      return WinView;
    }(cc.Component);
    exports.WinView = WinView;
    cc._RF.pop();
  }, {} ]
}, {}, [ "GameEvent", "BlastGame", "Bootstrap", "NormalClickProcessor", "Tile", "TurnContext", "TurnProcessor", "BoosterType", "GameState", "InputState", "TileColor", "Board", "Boosters", "Gravity", "Input", "Matches", "Moves", "Score", "Shuffle", "Spawner", "BombBooster", "Booster", "TeleportBooster", "DestroyEffect", "GravityEffect", "LoseEffect", "ShakeEffect", "ShuffleEffect", "SuperTileSpawnEffect", "SwapEffect", "TileSpawnEffect", "WinEffect", "LineSuperTileLogic", "MaxBombSuperTileLogic", "RadiusBombSuperTileLogic", "SuperTile", "SuperTileFactory", "SuperTileLogic", "SuperTileType", "SuperTiles", "BoardView", "BoosterView", "GameViewController", "LoseView", "MovesView", "OverlayView", "ScoreView", "TileView", "TileViewPool", "WinView" ]);
//# sourceMappingURL=index.js.map
