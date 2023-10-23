//#region
import * as readlinePromises from "node:readline/promises";
const rl = readlinePromises.createInterface({
  input: process.stdin,
  output: process.stdout
});
//#endregion

const ERR = -1; // BARE FEIL
const CORRECT = 10; // Helt riktig 
const PARTIAL = 0; // Delvis riktig

const BLACK = 0; 
const RED = 1;
const GREEN = 2;
const YELLOW = 3;
const BLUE = 4;
const MAGENTA = 5;
const CYAN = 6;
const WHITE = 7; 

let gameOver = false;
let tilgjengeligeForsok = await askUser("How many attempts do you need (max 10) ? ")
let antallForsok = tilgjengeligeForsok;
const sequence = createSequence([RED,GREEN,YELLOW,BLUE,MAGENTA,CYAN])

let gameState = []

do{ 

  console.clear();
  printBoard();
  console.log("");
  printLegend();
  console.log("");
  const guess = await askUserForGuess();// HEr skal ting komme fra spiller.
  const evaluation = evaluateGuess(sequence,guess)
  gameOver = isGameOver(evaluation);
  console.log(prityPrint( evaluation));
  antallForsok--;

  gameState.push({guess, evaluation});

}while(!gameOver && antallForsok > 0)

console.log(`Du krukte ${tilgjengeligeForsøk-antallForsok}`);
console.log(`Riktig svar var ${sequence}`);

async function askUser(question,options = "*"){
  
  let answer;

  const answerParser = (answer) => {
      if(options === "*"){
        return true;
      } else if(Array.isArray(options)){
        return (options.indexOf(answer) != -1);
      } else{
        return options.includes(answer)
      }
  }

  let correct = false;
  do{
     answer =  await rl.question(question);
     correct = answerParser(answer)
     console.log(correct);
  } while(!correct)

  return answer;

}


function printBoard(){
  for(let i in gameState){
    console.log(`${prityPrint(gameState[i].evaluation)}  |  ${prityPrint(gameState[i].guess)}`)
 }
 for(let i = gameState.length; i < tilgjengeligeForsok; i++){
   console.log(`${prityPrint([0,0,0,0])}  |  ${prityPrint([WHITE,WHITE,WHITE,WHITE])}`)
 }
}

function prityPrint(source){
  let output = "";
  for(let i = 0; i < source.length; i++){
    
    let symbole = "✵"
    let color = source[i];
    if(color === CORRECT){
      color = GREEN;
      symbole = "◉";
    } else if(color === PARTIAL){
      color = WHITE;
      symbole = "◉";
    } else if( color === ERR){
      color = WHITE;
      symbole = "x";
    }
    output += `\x1b[3${color}m ${symbole} \x1b[0m`;
  }

  return output;
}

function printLegend(){
  console.log(`x = wrong, ◉ = partial, \x1b[3${GREEN}m ◉ \x1b[0m= correct`)
}

async function askUserForGuess(){
  console.log("Your sequence (using , to seperate values)");
  return (await askUser("> ")).split(",");
}

function isGameOver(evaluation){
  let sum = evaluation.reduce((total,curr) => total+curr,0);
  return sum === (CORRECT*evaluation.length);
}

function evaluateGuess(sourceSequence,guessSequence){

  let correct = [ERR,ERR,ERR,ERR]
  let partial = [...correct]

  let listPos = 0;
  for(const i in  sourceSequence){
    const peg = sourceSequence[i];
    const guessedPeg = guessSequence[i] * 1;
    if(guessedPeg  === peg){
      correct[i] = CORRECT; 
    }
  }


  listPos = 0;
  for(const guessedPeg of guessSequence ){
    if(sourceSequence.indexOf((guessedPeg *1)) != -1){
      partial[listPos] = PARTIAL; 
    }
    listPos ++;
  }

  let output = [];
  for(let i = 0; i < sourceSequence.length; i++ ){
    if(correct[i] === CORRECT){
      output[i] = CORRECT;
    } else if (partial[i] === PARTIAL){
      output[i] = PARTIAL;
    } else{
      output[i] = ERR
    }
  }

 // Vi stokker resultatet slik at det ikke er en 1:1 mapping på plass
  return output.sort( () => .5 - Math.random() );
}

function createSequence(source,length = 4,duplicates = true){

  let sequence = []
  
  while(sequence.length < length){
    const index = Math.floor(Math.random() * source.length)
    const colorPeg = source[index];
   
    if(!duplicates){
      if(sequence.indexOf(colorPeg) === -1){
        sequence.push(colorPeg);
      }
    } else{
      sequence.push(colorPeg);
    }

  }

  return sequence;

}

process.exit();