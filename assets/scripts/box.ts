
import { _decorator, Component, Node, Sprite, Color, instantiate, tween, Vec2, Vec3, director } from 'cc';
import {game} from './game';
const { ccclass, property } = _decorator;
 
@ccclass('box')
export class box extends Component {
    testpro:number = 111;
    _game:game;

    onLoad() {
        this.node.on("touch-start", this.on_touch_start, this);
        this.node.on("touch-end", this.on_touch_end, this);
    }

    start () {
        // [3]
    }

    // update (deltaTime: number) {
    //     // [4]
    // }

    setGame(game:game){
        this._game = game;
    }

    on_touch_start(){
    }

    on_touch_end(){
        if (this.getComponent(Sprite).color == Color.WHITE) {
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
    }

    playClearAnimation(){
        tween(this.getComponent(Sprite))
        .to(0.1, {color:Color.TRANSPARENT}, {
            easing:"fade",
            onUpdate:(target: Color, ratio: number) => {
                this.getComponent(Sprite).color = new Color(this.getComponent(Sprite).color.r, this.getComponent(Sprite).color.g, this.getComponent(Sprite).color.b, target.a)
            },
            onComplete:(target:object) => {
                this.node.destroy();
            }
        }).start();
    }
}

