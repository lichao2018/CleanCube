
import { _decorator, Component, Node, view, Vec3, Prefab, director, instantiate, Color, Sprite, AudioClip, AudioSource, Label, UITransform } from 'cc';
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
    _rewardTime:number = 1;
    rewardTime:number = 0;
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
        this.countDownTimeLabel = this.node.parent.getChildByPath("timeFrameOut/timeFrameIn/time").getComponent(Label);
        this.countDownTimeLabel.string = this.countDownTime + "";
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
                boxRowArray[col] = box.getChildByName("body");
            }
            this._boxArray[row] = boxRowArray;
        }
        //计时
        this.schedule(this.timeCallback, 1);
    }

    timeCallback = function(){
        if(this.noClickBox()){
            this.gameStop();
            return;
        }
        this.countDownTime -= 1;
        if(this.countDownTime <= 0){
            this.countDownTime = 0;
        }
        this.countDownTimeLabel.string = this.countDownTime + "";
        if(this.countDownTime <= 0){
            this.gameStop();
        }
    };

    retiming(){
        if(this.countDownTime <= 0){
            this.countDownTime = 0;
        }
        this.countDownTimeLabel.string = this.countDownTime + "";
        this.unschedule(this.timeCallback);
        if(this.countDownTime <= 0){
            this.gameStop();
            return;
        }
        if(this.noClickBox()){
            this.gameStop();
            return;
        }
        this.schedule(this.timeCallback, 1);
    }

    noClickBox = function():boolean{
        for (var i:number = 0; i < this._boxArray.length; i++ ) {
            var boxRowArray = this._boxArray[i]
            for (var j: number = 0; j < boxRowArray.length; j++) {
                var box = boxRowArray[j];
                if (!this.compareColor(box.getComponent(Sprite).color, this.defaultColor)) {
                    continue;
                }
                var clearBox = this.clearCrossBoxs(j, i);
                if(this.findClearBox(clearBox, false)){
                    return false;
                }
            }
        }
        return true;
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
        box.getChildByName("body").getComponent(Sprite).color = color;
        box.getComponent(UITransform).width = this._boxSize;
        box.getComponent(UITransform).height = this._boxSize;
        box.getChildByName("background").getComponent(UITransform).width = this._boxSize;
        box.getChildByName("background").getComponent(UITransform).height = this._boxSize;
        box.getChildByName("body").getComponent(UITransform).width = this._boxSize * 0.9;
        box.getChildByName("body").getComponent(UITransform).height = this._boxSize * 0.9;
        this.node.addChild(box);
        var boxScript:any = box.getChildByName("body").getComponent("box");
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
        var col = (box.node.getParent().position.x - this._boxSize/2) / this._boxSize;
        var row = (box.node.getParent().position.y - this._boxSize/2) / this._boxSize;
        var clearBox = this.clearCrossBoxs(col, row);
        if(this.findClearBox(clearBox, true)){
            this.clickRight();
        }else{
            this.clickWrong();
        }
    }

    clearCrossBoxs(crossCol: number, crossRow:number) : any{
        var clearBoxs = [];
        for (var row: number = crossRow-1; row >= 0; row--) {
            var box = this._boxArray[row][crossCol];
            if (!this.compareColor(box.getComponent(Sprite).color, this.defaultColor)) {
                clearBoxs.push(box);
                break;
            }
        }
        for (var row: number = crossRow+1; row < this.ROW_NUM; row++) {
            var box = this._boxArray[row][crossCol];
            if (!this.compareColor(box.getComponent(Sprite).color, this.defaultColor)) {
                clearBoxs.push(box);
                break;
            }
        }
        for (var col: number = crossCol-1; col >= 0; col--) {
            var box = this._boxArray[crossRow][col];
            if (!this.compareColor(box.getComponent(Sprite).color, this.defaultColor)) {
                clearBoxs.push(box);
                break;
            }
        }
        for (var col: number = crossCol+1; col < this.COL_NUM; col++) {
            var box = this._boxArray[crossRow][col];
            if (!this.compareColor(box.getComponent(Sprite).color, this.defaultColor)) {
                clearBoxs.push(box);
                break;
            }
        }
        return clearBoxs;
    }

    findClearBox(clearBoxs: any[], clearBox:boolean) :boolean{
        for (var i = 0; i < clearBoxs.length; i++) {
            var colorI = clearBoxs[i].getComponent(Sprite).color;
            if(colorI == Color.WHITE){
                continue;
            }
            for (var j = i + 1; j < clearBoxs.length; j++) {
                var colorJ = clearBoxs[j].getComponent(Sprite).color;
                if (this.compareColor(colorI, colorJ)) {
                    clearBoxs[i]["clear"] = true;
                    clearBoxs[j]["clear"] = true;
                }
            }
        }
        var wrongClick = true;
        this.rewardTime = 0;
        for (var i = 0; i < clearBoxs.length; i++) {
            if (clearBoxs[i]["clear"]) {
                wrongClick = false;
                if(clearBox){
                    this.score += 10;
                    this.rewardTime += this._rewardTime;
                    this.clearBox(clearBoxs[i]);
                }
            }
        }
        return !wrongClick;
    }

    clickWrong(){
        if(this._gameStop){
            return;
        }
        this.wrongAudioEffect.play();
        this.score -= 10;
        this.scoreLabel.string = "" + this.score;
        this.countDownTime -= this.punishTime;
        this.retiming();
    }

    clickRight(){
        if(this._gameStop){
            return;
        }
        this.countDownTime += this.rewardTime;
        this.rightAudioEffect.play();
        this.scoreLabel.string = "" + this.score;
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

