//#region
import * as readlinePromises from "node:readline/promises";
const rl = readlinePromises.createInterface({
  input: process.stdin,
  output: process.stdout
});
//#endregion

const ERR = -1; // BARE FEIL
const CORRECT = 7; // Helt riktig 
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
let tilgjengeligeForsøk = 10
let antallForsok = tilgjengeligeForsøk;
const sequence = createSequence([RED,GREEN,YELLOW,BLUE,MAGENTA,CYAN])

let gameState = []

do{ 

  //console.clear();
  for(let i in gameState){
     console.log(`${colorize(gameState[i].evaluation)}  |  ${gameState[i].guess}`)
  }

  const guess = await askUserForGuess();// HEr skal ting komme fra spiller.
  const evaluation = evaluateGuess(sequence,guess)
  gameOver = isGameOver(evaluation);
  console.log(colorize( evaluation));
  antallForsok--;

  gameState.push({guess, evaluation});

}while(!gameOver && antallForsok > 0)

console.log(`Du krukte ${tilgjengeligeForsøk-antallForsok}`);
console.log(`Riktig svar var ${sequence}`);

function colorize(source){
  let output = "";
  for(let i = 0; i < source.length; i++){
    const color = source[i] === CORRECT ? RED:WHITE;
    const symbole = source[i] === CORRECT || source[i] === PARTIAL ? "*":"◽️";
    output += `\x1b[3${color}m ${symbole} \x1b[0m`;
  }

  return output;
}

async function askUserForGuess(){
  console.log("Your sequence (using , to seperate values)");
  return (await rl.question("> ")).split(",");
}

function isGameOver(evaluation){
  let sum = 0;
  for(const res of evaluation){
    sum += res;
  }

  return sum === 28;
}

function evaluateGuess(sourceSequence,guessSequence){

  let correct = [ERR,ERR,ERR,ERR]
  let partial = [...correct]

  let listPos = 0;
  for(const i in  sourceSequence){
    const peg = sourceSequence[i];
    const guessedPeg = guessSequence[i] * 1;
    console.log(`${peg} : ${guessedPeg} = ${peg === guessedPeg}`)
    if(guessedPeg  === peg){
      correct[i] = CORRECT; 
    }
  }


  listPos = 0;
  for(const guessedPeg of guessSequence ){
    if(sourceSequence.indexOf((guessedPeg *1)) != -1 && partial[listPos] != CORRECT){
      
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
  return output;//output.sort( () => .5 - Math.random() );
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