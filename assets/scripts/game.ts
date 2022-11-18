
import { _decorator, Component, Node, view, Vec3, Prefab, director, instantiate, Color, Sprite, AudioClip, AudioSource, Label } from 'cc';
import {box} from './box';
const { ccclass, property } = _decorator;
 
@ccclass('game')
export class game extends Component {

    @property(Number) 
    ROW_NUM:number = 8;
    @property(Number)
    COL_NUM:number = 6;
    @property(Color)
    defaultColor:Color = new Color().fromHEX("#8ea2a2");
    @property(Prefab)
    boxPrefab:Prefab = null;
    _boxSize:number;
    _boxArray = [];
    @property([Color])
    colorArray:Color[] = [Color.GREEN, Color.RED, Color.BLUE];
    @property(Number)
    countDownTime:number = 60;
    @property(Number)
    rewardTime:number = 2;
    @property(Number)
    punishTime:number = 5;
    //错误音效
    wrongAudioEffect:AudioSource;
    rightAudioEffect:AudioSource;
    scoreLabel:Label;
    countDownTimeLabel:Label;
    score:number = 0;
    _gameStop:boolean;

    onLoad() {
        this.wrongAudioEffect = this.getComponents(AudioSource)[0];
        this.rightAudioEffect = this.getComponents(AudioSource)[1];
        this.scoreLabel = this.node.parent.getChildByName("score").getComponent(Label);
        this.countDownTimeLabel = this.node.parent.getChildByName("time").getComponent(Label);
        var refresh = this.node.parent.getChildByName("refresh");
        refresh.on("touch-start", this.onRefresh, refresh);

        this._boxSize = Math.floor(view.getVisibleSize().width/this.COL_NUM);
        for (var row:number = 0; row < this.ROW_NUM; row++ ) {
            var y:number = row * this._boxSize + this._boxSize/2;
            var boxRowArray = [];
            for (var col: number = 0; col < this.COL_NUM; col++) {
                var x:number = col * this._boxSize + this._boxSize/2;
                var position:Vec3 = new Vec3(x, y, 0);
                //随机设置box颜色，默认白色
                var rand:number = Math.floor(Math.random() * (this.colorArray.length + 1));
                // var color:Color = Color.WHITE;
                // color.fromHEX("#8ea2a2")
                var color:Color = this.defaultColor;
                if(rand < this.colorArray.length){
                    color = this.colorArray[rand];
                }
                var box = this.createBox(position, color);
                boxRowArray[col] = box;
            }
            this._boxArray[row] = boxRowArray;
        }
        //计时
        this.schedule(this.timeCallback, 1);
    }

    timeCallback = function(){
        this.countDownTime -= 1;
        this.countDownTimeLabel.string = this.countDownTime;
        if(this.countDownTime < 0){
            this.gameStop();
        }
    };

    retiming(){
        this.countDownTimeLabel.string = this.countDownTime + "";
        this.unschedule(this.timeCallback);
        this.schedule(this.timeCallback, 1);
    }

    onRefresh(){
        director.loadScene("game-portrait");
    }

    start () {
        // [3]
        console.log("game start");
    }

    createBox(position:Vec3, color:Color):Node{
        var box = instantiate(this.boxPrefab);
        box.setPosition(position);
        box.getComponent(Sprite).color = color;
        this.node.addChild(box);
        var boxScript:any = box.getComponent("box");
        boxScript.setGame(this);
        return box;
    }

    clickBox(box:box) {
        if(this._gameStop){
            return;
        }
        if (!this.compareColor(box.getComponent(Sprite).color, this.defaultColor)) {
            this.clickWrong();
            return;
        }
        var col = (box.node.position.x - this._boxSize/2) / this._boxSize;
        console.log(box.node.position.x + "," + this._boxSize/2 + "," + this._boxSize);
        var row = (box.node.position.y - this._boxSize/2) / this._boxSize;
        console.log("clickbox x:" + box.node.position.x + ", y : " + box.node.position.y);
        console.log("clickbox col:" + col + ", row : " + row);
        this.clearCrossBoxs(col, row);
    }

    clearCrossBoxs(crossCol: number, crossRow:number) {
        var clearBoxs = [];
        for (var row: number = crossRow-1; row >= 0; row--) {
            var box = this._boxArray[row][crossCol];
            if (!this.compareColor(box.getComponent(Sprite).color, this.defaultColor)) {
                clearBoxs.push(box);
                console.log("1find box col : " + crossCol + ", row : " + row);
                break;
            }
        }
        for (var row: number = crossRow+1; row < this.ROW_NUM; row++) {
            var box = this._boxArray[row][crossCol];
            if (!this.compareColor(box.getComponent(Sprite).color, this.defaultColor)) {
                clearBoxs.push(box);
                console.log("2find box col : " + crossCol + ", row : " + row);
                break;
            }
        }
        for (var col: number = crossCol-1; col >= 0; col--) {
            var box = this._boxArray[crossRow][col];
            if (!this.compareColor(box.getComponent(Sprite).color, this.defaultColor)) {
                clearBoxs.push(box);
                console.log("3find box col : " + col + ", row : " + crossRow);
                break;
            }
        }
        for (var col: number = crossCol+1; col < this.COL_NUM; col++) {
            var box = this._boxArray[crossRow][col];
            if (!this.compareColor(box.getComponent(Sprite).color, this.defaultColor)) {
                clearBoxs.push(box);
                console.log("4find box col : " + col + ", row : " + crossRow);
                break;
            }
        }
        this.findClearBox(clearBoxs);
    }

    findClearBox(clearBoxs: any[]) {
        for (var i = 0; i < clearBoxs.length; i++) {
            var colorI = clearBoxs[i].getComponent(Sprite).color;
            if(colorI == Color.WHITE){
                continue;
            }
            for (var j = i + 1; j < clearBoxs.length; j++) {
                console.log(clearBoxs[i].getComponent(Sprite).color + ", " + clearBoxs[j].getComponent(Sprite).color);
                var colorJ = clearBoxs[j].getComponent(Sprite).color;
                if (this.compareColor(colorI, colorJ)) {
                    console.log(i + " clear");
                    clearBoxs[i]["clear"] = true;
                    clearBoxs[j]["clear"] = true;
                }
            }
        }
        var wrongClick = true;
        for (var i = 0; i < clearBoxs.length; i++) {
            if (clearBoxs[i]["clear"]) {
                wrongClick = false;
                this.score += 10;
                this.clearBox(clearBoxs[i]);
            }
        }
        if(wrongClick){
            this.clickWrong();
        }else{
            this.clickRight();
        }
    }

    clickWrong(){
        this.wrongAudioEffect.play();
        this.score -= 10;
        this.scoreLabel.string = "score:" + this.score;
        this.countDownTime -= this.punishTime;
        this.retiming();
    }

    clickRight(){
        this.countDownTime += this.rewardTime;
        this.rightAudioEffect.play();
        this.scoreLabel.string = "score:" + this.score;
        this.retiming();
    }

    clearBox(box: Node) {
        var boxScript:any = box.getComponent("box");
        boxScript.clear();
    }

    compareColor(colorA:Color, colorB:Color):boolean{
        if(colorA.r == colorB.r && colorA.g == colorB.g && colorA.b == colorB.b){
            return true;
        }
        return false;
    }

    gameStop(){
        this._gameStop = true;
        this.unschedule(this.timeCallback);
        var stopLabel = this.node.parent.getChildByName("stop").getComponent(Label);
        stopLabel.enabled = true;
        stopLabel.string = "游戏结束，得分：" + this.score;
    }

    // update (deltaTime: number) {
    //     // [4]
    // }
}

