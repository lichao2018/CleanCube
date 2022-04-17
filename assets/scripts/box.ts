
import { _decorator, Component, Node, Sprite, Color } from 'cc';
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
        this.getComponent(Sprite).color = Color.WHITE;
    }
}

