
import { _decorator, Component, Node, Sprite, Color, instantiate, tween, Vec2, Vec3, director } from 'cc';
import {game} from './game';
const { ccclass, property } = _decorator;
 
@ccclass('box')
export class box extends Component {
    testpro:number = 111;
    _game:game;

    onLoad() {
        console.log("box onload");
        this.node.on("touch-start", this.on_touch_start, this);
        this.node.on("touch-end", this.on_touch_end, this);
    }

    start () {
        console.log("box start");
        // [3]
    }

    // update (deltaTime: number) {
    //     // [4]
    // }

    setGame(game:game){
        this._game = game;
    }

    on_touch_start(){
        console.log("touch start");
    }

    on_touch_end(){
        console.log("touch end");
        if (this.getComponent(Sprite).color == Color.WHITE) {
            console.log("click white box");
            return;
        }
        this._game.clickBox(this);
    }

    clear(){
        var cloneBox = instantiate(this.node);
        cloneBox.parent = this.node.parent;
        cloneBox.setPosition(this.node.position);
        var cloneBoxScript:any = cloneBox.getComponent("box");
        cloneBoxScript.playClearAnimation();

        this.getComponent(Sprite).color = this._game.defaultColor;
        //todo 添加消除动画

        
        //todo 动画结束时清除方块对象
    }

    playClearAnimation(){
        tween(this.node.position)
            .to(0.1, new Vec3(this.node.position.x, this.node.position.y - 10, 0), 
                {
                    easing: "fade",
                    onUpdate:(target: Vec3, ratio: number) => {
                        console.log("target:    " + target)
                        this.node.position = target
                    },
                    onComplete:(target:object) => {
                        console.log("play clear animation oncomplete")
                        this.node.destroy();
                    }
                })
            .start();
    }
}

