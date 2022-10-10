import * as Write from '../utils/write.mjs'
import * as GameConstants from '../utils/const.mjs'
import * as assets from '../assets.mjs'
import { keyStatus } from '../utils/io.mjs';

const SNAKE_HEAD = "S";
const SNAKE_BODY = "█"
const FOOD = "O"
const EMPTY = " "

const UP = -1;
const DOWN = 1;
const LEFT = -1;
const RIGHT = 1;
const NO_MOVMENT = 0;

let currentLevel = 0;
let dificultyLevel = 0
let baseMap = [];
let playMap = ""
let bounds = null;
let snake = null;

let elapsedTimeSinceLastUpdate = 0;
let refreshLimit = 80; 

let isGameOver = false;
let countdownValue =0;

let hasFood = false;
let food = createBodySegment(FOOD,0,0,NO_MOVMENT,NO_MOVMENT);
let foodTimer = 0;

const eventHandlers = {
    onChangeGameStateEventHandler:null
}

function ready(difLevel){
    isGameOver = false;
    countdownValue = 0;
    dificultyLevel = difLevel || 0;
    currentLevel = 0;
    playMap = assets.LEVELS[currentLevel];
    bounds = Write.strBounds(playMap)

    let sp = findStartPosition(playMap);
    let snake_head = createBodySegment(SNAKE_HEAD,sp.row,sp.col,UP,NO_MOVMENT);
    let body = createBodySegment(SNAKE_BODY,sp.row+1,sp.col,UP,NO_MOVMENT);
    snake = [snake_head,body];

    playMap = playMap.replace(SNAKE_HEAD, EMPTY);
    baseMap = playMap.split("\n");
    
    for(let i = 0; i < baseMap.length; i++){
        let row = baseMap[i].split("");
        baseMap[i] = row;
    }
}

function update(keyStates, timeDelta){
    let dirty = false;
    let head = snake[0];
    let tail = snake[snake.length-1];

    elapsedTimeSinceLastUpdate += timeDelta;
    
    if(isGameOver){
        countdownValue -= timeDelta;
        if(countdownValue <= 0){
            eventHandlers.onChangeGameStateEventHandler(GameConstants.GAME_STATES.MENU,null);
        }
        return; 
    }

    if(keyStates.up || keyStates.down){
        if(keyStates.up){
            head.vy = UP;
        } else {
            head.vy = DOWN;
        }
        head.vx = NO_MOVMENT;
    }  else if(keyStates.left || keyStates.right){
        head.vx = keyStates.left ? LEFT:RIGHT;
        head.vy = NO_MOVMENT;
    }


    if(elapsedTimeSinceLastUpdate >= refreshLimit){
        
        elapsedTimeSinceLastUpdate = 0;
        dirty = true;

        baseMap[tail.row][tail.col] = EMPTY;

        for(let i = snake.length-1; i > 0; i--){
            let currentBodySegment = snake[i];
            baseMap[currentBodySegment.row][currentBodySegment.col] = EMPTY;
            let nextBodySegment = snake[i-1];
            currentBodySegment = {... nextBodySegment};
            currentBodySegment.symbole = SNAKE_BODY;
            snake[i]= currentBodySegment;
            baseMap[currentBodySegment.row][currentBodySegment.col] = currentBodySegment.symbole;
        }

        head.row += head.vy;
        head.col += head.vx; 

        const newHeadLocation = baseMap[head.row][head.col];

        if( newHeadLocation !== EMPTY){
            
            if(newHeadLocation === FOOD){
                foodTimer = 1000;
                hasFood = false;
                let segment = createBodySegment(SNAKE_BODY,tail.row,tail.col,NO_MOVMENT,NO_MOVMENT);
                segment.col -= tail.vx;
                segment.row -= tail.vy;
                snake.push( segment);
            } else{ 
                head.row -= head.vy;
                head.col -= head.vx;
                isGameOver = true;
                countdownValue = 2500;
            }
        }

        baseMap[head.row][head.col] = head.symbole;

        if(hasFood === false && foodTimer <= 0){
            let foodPos = seedFood(baseMap);
            food.row = foodPos.row;
            food.col = foodPos.col;
            hasFood = true;
        } else if(hasFood){
            baseMap[food.row][food.col] = food.symbole;
        }

        foodTimer -= timeDelta;

        playMap = (baseMap.map(e => e.join(""))).join("\n")

    }
 
    resetUserInput(keyStates)
    
    return dirty;
}

function draw(dirty, timeDelta){
    if(dirty){
       Write.centerd(playMap)
       if(isGameOver){
        Write.centerd(assets.GAMEOVER);
       }
    }
}

function resetUserInput(keyStates){
    keyStates.up = keyStates.down = keyStates.left = keyStates.right = false;
}

function createBodySegment(symbole,row,col,vericalMovment,horisontalMovment){
    return {symbole,row,col,vx:horisontalMovment,vy:vericalMovment}
}

function findStartPosition(map){
    const mapSegements = map.split("\n");
    let row = -1;
    let col = -1;
    for (let i = 0; i < mapSegements.length; i++) {
        const segment = mapSegements[i];
        col = segment.indexOf(SNAKE_HEAD);
        if(col !== -1){
            row = i
            break;
        }
    }

    if(row === -1 || col === -1){
        throw Error("Map does not contain starting position")
    }

    return {row,col}
}

function seedFood(map){

    const minRow = 1;
    const maxRow = map.length;
    const minCol = 1;
    const maxCol = map[0].length;

    let row = 0;
    let col = 0;

    do{
        row = Math.round(Math.random() * (maxRow-minRow)) + minRow;
        col = Math.round(Math.random() * (maxCol-minCol)) + minCol;
    } while(map[row][col] !== EMPTY)

    return {row, col}
}

export {
    ready,
    update,
    draw, 
    eventHandlers
}

