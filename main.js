const size = [6,8];
let wordleNum = sessionStorage.getItem("date");
let isInfinite = sessionStorage.getItem("isInfinite") == "true";

console.log(`Wordle Number : ${wordleNum}`)
console.log(`Is Infinite   : ${isInfinite}`)

/**
 * Name idea
 * - Wrongle
 */

class Board {

    static board

    constructor(){
        // Store one board for HTML, one for Referencing Later
        this.boardHTML = document.getElementById("board")
        this.currGuess = 0
        Board.board = this
        this.board = []
        for (let i = 0; i < size[1]; i++ ){
            let rowH = document.createElement("wordlegrid")
            let rowA = []
            rowH.classList.add("row")
            for(let k = 0 ; k < size[0]; k++){
                let cell = document.createElement("button")
                cell.classList.add("cell")
                cell.innerHTML = '\u2060';
                rowH.appendChild(cell)
                rowA.push(cell)
                cell.onclick = function(){
                    cellClick(k,i)
                }
            }
            this.boardHTML.appendChild(rowH)
            this.board.push(rowA)
        }
    }

    static getBoard(){
        return Board.board
    }

    updateGuess(letters){
        // Updates the words displayed on the board
        if (Guess.win != 0){return} // Prevents Updating if game is won or lost
        for(let i = 0; i < size[0] ; i++){
            this.clearCell(i)
        }
        for(let i = 0; i < letters.length ; i++){
            this.updateCell(i,letters,null,false)
        }  
    }

    clearCell(i){
        this.board[this.currGuess][i].innerHTML = "\u2060"
    }

    updateCell(i,letters,htmlClass,playAnim){
        this.updateAnyCell(i,this.currGuess,letters[i],htmlClass,playAnim)
    }

    updateAnyCell(i,row,letter,htmlClass,playAnim=false){
        let cell = this.board[row][i]
        cell.innerHTML = letter.toUpperCase()
        if(playAnim){
            setTimeout(function(){
                cell.classList.add('flip')
                setTimeout(function(){
                    if (htmlClass != null){
                        cell.classList.add(htmlClass)
                    }    
                    setTimeout(function(){
                        cell.classList.remove('flip')
                    },0.35 * 1000)
                },0.35 * 1000)
            },0.35 * 1000 * i)
        }else{
            if (htmlClass != null){
                cell.classList.add(htmlClass)
            }
        }
    }

    guessed(){
        this.currGuess++
    }

    getHTML(){
        return this.boardHTML
    }

    setUnknown(cellNum,row){
        if (row >= this.currGuess && Guess.win == 0) return
        if (cellNum == -1) return
        let cell = this.board[row][cellNum]
        let letter = cell.innerHTML.toLowerCase()
        if (cell.classList.contains("cellUnknown")){
            cell.classList.remove("cellUnknown")
            this.updateAnyCell(cellNum,row,letter,Guess.guesses[row].colors[cellNum])
            Keyboard.getKeyboard().letters[letter].removeState("cellUnknown")
            Keyboard.getKeyboard().letters[letter].addState(Guess.guesses[row].colors[cellNum])
        }else{
            cell.classList.remove(Guess.guesses[row].colors[cellNum])
            this.removeUnknownFromLine(row)
            this.updateAnyCell(cellNum,row,letter,"cellUnknown")
            Keyboard.getKeyboard().letters[letter].addState("cellUnknown")
            Keyboard.getKeyboard().letters[letter].removeState(Guess.guesses[row].colors[cellNum])
        }
    }

    removeUnknownFromLine(row){
        for(let cellNum = 0; cellNum < size[0] ;cellNum++){
            if (row >= this.currGuess) return
            let cell = this.board[row][cellNum]
            let letter = cell.innerHTML.toLowerCase()
            if (cell.classList.contains("cellUnknown")){
                cell.classList.remove("cellUnknown")
                this.updateAnyCell(cellNum,row,letter,Guess.guesses[row].colors[cellNum])
                Keyboard.getKeyboard().letters[letter].removeState("cellUnknown")
                Keyboard.getKeyboard().letters[letter].addState(Guess.guesses[row].colors[cellNum])
            }
        }
    }

    showUnknowns(){
        for(let rowNum = 0; rowNum <= this.currGuess ; rowNum++){
            this.removeUnknownFromLine(rowNum)
            this.setUnknown(Guess.guesses[rowNum].wrongLetterNum,rowNum)     
        }
    }
}

class Keyboard {

    static keyboard

    constructor(){
        Keyboard.keyboard = this
        this.letters = {}
        
        let lettersList = "qwertyuiop_asdfghjkl_EzxcvbnmD"
        lettersList = lettersList.split("_")

        this.board = document.getElementById("keyboard")
        

        lettersList.forEach(letterRow => {
            let row = document.createElement("lettergrid")
            row.classList.add("row")
            this.board.appendChild(row)

            let indivLetters = letterRow.split("")
            indivLetters.forEach(letter => {
                if (letter != "E" && letter != "D"){
                    this.letters[letter] = new Letter(letter)
                    row.appendChild(this.letters[letter].getHTML())
                }else if (letter == "E"){
                    this.letters[letter] = new Letter("enter")
                    this.letters[letter].setSpecial()
                    row.appendChild(this.letters[letter].getHTML())
                }else {
                    this.letters[letter] = new Letter("delete")
                    this.letters[letter].setSpecial()
                    row.appendChild(this.letters[letter].getHTML())
                }
            })
        })     

        document.addEventListener("keydown", function(event){
            if (event.key === "Enter"){
                event.preventDefault()
            }
            Keyboard.getKeyboard().addPress(event.key.toLowerCase())
        })

        this.guessLetters = []
    }

    static getKeyboard(){
        return Keyboard.keyboard
    }

    addPress(key){
        if (Guess.win != 0){
            return
        }
        if ("qwertyuiopasdfghjklzxcvbnm".includes(key)){
            if (this.guessLetters.length < 6){
                this.guessLetters.push(key)
            }
        }
        if (key == "enter"){
            this.guessWord()
        }
        if (key == "delete" || key == "backspace"){
            this.guessLetters.pop()
        }
        Board.getBoard().updateGuess(this.guessLetters)
    }

    guessWord(){
        if (this.guessLetters.length < 6){
            this.wordError("Word is not long enough...")
            return
        }
        let word = ""
        this.guessLetters.forEach(letter => {
            word = word + letter
        })
        let hasGuessed = false
        Guess.guesses.forEach(guess => {
            if(guess.word == word){
                hasGuessed = true
            }
        })
        if (hasGuessed){
            this.wordError("You've already guessed this...")
            //return
        }

        
        if (!wordleLangList.includes(word)){
            this.wordError("Word does not exist...")
            return
        }
        new Guess(word)
        Board.getBoard().updateGuess(this.guessLetters)
        Board.getBoard().guessed()
        this.guessLetters = []
    }

    getGuessLetters(){
        return this.guessLetters
    }

    wordError(code){
        let center = document.getElementById("center")
        let warning = document.createElement("warning")
        warning.id = "warning"
        warning.innerHTML = code
        center.appendChild(warning)
        if (Guess.win == 0){
            setTimeout(function(){
                center.removeChild(warning)
            },3 * 1000)
        }
    }

    kill(){
        this.board.remove()
    }
}

class Letter {
    constructor (letter){
        this.letter = letter
        this.stateStr = ""
        this.state = []
        this.html = document.createElement("button")
        this.html.onclick = function(){
            Keyboard.getKeyboard().addPress(letter.toLowerCase())
        }
        this.html.classList.add("key")
        this.html.textContent = letter.charAt(0).toUpperCase() + letter.slice(1);
    }

    addState(color){
        //if (!this.state.includes(color)){
            this.state.push(color)
            this.updateState()
        //}
    }

    removeState(color){
        this.state.splice(this.state.indexOf(color),1)
        this.updateState()
    }

    updateState(){
        if (this.stateStr != "") this.html.classList.remove(this.stateStr)
        this.stateStr = ""
        if (this.state.includes("cellCorrect")) this.stateStr = this.stateStr+"g"
        if (this.state.includes("cellWrong")) this.stateStr = this.stateStr+"w"
        if (this.state.includes("cellMisplaced")) this.stateStr = this.stateStr+"y"
        if (this.state.includes("cellUnknown")) this.stateStr = this.stateStr+"p"
        if (this.stateStr != "") {
            this.html.classList.add(this.stateStr)
            this.html.classList.add("gradientOutline")
        }
    }

    getHTML(){
        return this.html
    }

    setSpecial(){
        this.html.classList.add("special")
    }
}

class Guess {

    static win = 0
    static trueWord = ""
    static guesses = []
    static goodjob = [
        "Well Done",
        "Excellent",
        "Fantastic",
        "Impressive",
        "Nailed It",
        "Outstanding",
        "Superb",
        "Way to Go",
        "Exceptional",
        "Bravo",
        "Hats Off to You",
        "Top-Notch",
        "Applause for You",
        "Magnificent",
        "Double Thumbs Up",
        "Hooray",
        "A+ Effort",
    ]

    constructor (word){
        Guess.guesses.push(this)
        this.word = word
        this.wrongLetterNum = Guess.getWrongLetterNum()
        this.win = false
        this.colors = [] // Default Colors 
        if (Guess.getTrueWord() == word){
            this.wrongLetterNum = -1 // So no letters get changed
            Guess.win = 1
            console.log("We have a winner!")
            Keyboard.getKeyboard().wordError(Guess.goodjob[Math.floor(Math.random()*(Guess.goodjob.length))])
        }else if (Guess.guesses.length >= size[1]){
            Guess.win = -1
            Keyboard.getKeyboard().wordError(Guess.trueWord)
        }
        let i = 0 
        let trueLetters = Guess.getTrueWord().split("")
        let letters = word.split("")
        let board = Board.getBoard()
        letters.forEach(letter => {
            let color = ""
            color = this.getColor(letters,i,trueLetters)
            this.colors.push(color)
            board.updateCell(i,letters,color,true)
            Keyboard.getKeyboard().letters[letter].addState(color)
            i++
        })
        if (Guess.win != 0){
            Board.getBoard().showUnknowns()
            Keyboard.getKeyboard().kill()
            new Results
        }
    }

    getColor(letters,pos,trueLetters){
        let letter = letters[pos]
        let color = "cellWrong"
        if (letter == trueLetters[pos]){
            if (pos != this.wrongLetterNum) trueLetters[pos] = "!" // So yellows can't access
            color = "cellCorrect"
        }
        else if (trueLetters.includes(letter)){

            /**
             * How to fix Yellow issue
             * Yellow issue occurs when theres 2 letters of the same kind
             * POSSIBLE SCENARIOS
             * DEF: Letter Early, and Letter Late, LE and LL
             * - LE has a match later, but LL should be green.
             * - LE is green, but LL should be green.
             * 
             * 
             * HOW TO SOLVE
             * Run a backwards loop, removeing instances of the LL in the true word.
             * Make sure to check what color the letter is, before continuing though.
             */

            let tempTrueLetters = trueLetters.slice() // Create a temp
            let sum = 0
            for (let i = 0; i < letters.length-1 ; i++){
                let currLetter = letters[i]
                this.getSimpleColor(currLetter, i, tempTrueLetters)
                if (tempTrueLetters[i] == letter){
                    sum++
                }
                if (currLetter == letter && i < pos && this.wrongLetterNum != i){
                    sum--
                }
            }
            if (sum > 0){
                color = "cellMisplaced"
            }            
        }
        if (pos == this.wrongLetterNum){
            return Guess.pickWrong(color)
        }
        return color
    }

    // A Case to get a color, without worrying about Yellow cases
    getSimpleColor(letter,pos,trueLetters){
        let color = "cellWrong"
        if (letter == trueLetters[pos]){
            if (pos != this.wrongLetterNum) trueLetters[pos] = "!"
            color = "cellCorrect"
        }
        else if (trueLetters.includes(letter)){
            color = "cellMisplaced"
        }
        if (pos == this.wrongLetterNum){
            return Guess.pickWrong(color)
        }
        return color
    }


    static pickWrong(color){
        let range = [0,0,0]
        switch(color){
            case("cellCorrect"):
                range = [0,3,4]
                break
            case("cellMisplaced"):
                range = [2,0,4]
                break
            case("cellWrong"):
                range = [2,4,0]
                break
        }
        let high = 0
        range.forEach(num => {if (high < num){high = num}})
        let rand = Math.floor(Math.random() * (high+1))
        if (rand < range[0]){
            return "cellCorrect"
        }else if (rand <= range[1]){
            return "cellMisplaced"
        }else {
            return "cellWrong"
        }
    }

    static getWrongLetterNum(){
        let num = Math.floor(Math.random()*6)
        return num
    }

    static getTrueWord(){
        if (Guess.trueWord == ""){
            if (isInfinite){
                Guess.trueWord = wordleWordsList[Math.floor(Math.random()*wordleWordsList.length-1)]
            }else{
                // Word has not been found, create it
                //Guess.trueWord = wordleWordsList[Math.floor(Math.random() * wordleWordsList.length)]
                //Guess.trueWord = "sprout" And Sport
                //Guess.trueWord = "lauras" And Aurura
                let wordleWordsListCopy = wordleWordsList.slice()
                let usedWords = []
                const rng = new RNG(1+(Math.floor(RNG.getOffset()+wordleNum)/(wordleWordsList.length-1)))
                let num = 0
                for (let i = 0 ; i < (RNG.getOffset()+wordleNum)%(wordleWordsList.length-1) ; i++){
                    num = rng.nextInt(0,wordleWordsListCopy.length-1)
                    usedWords.push(wordleWordsListCopy[num])
                    wordleWordsListCopy.splice(num,1)
                }
                console.log(usedWords)
                Guess.trueWord = wordleWordsListCopy[rng.nextInt(0,wordleWordsListCopy.length-1)]
                console.log(Guess.trueWord)
            }
        }
        return Guess.trueWord
    }
}


class Results {
    constructor(){
        this.html = document.getElementById("endPanel")
        let share = document.createElement("button")
        share.classList.add('gameSelect')
        share.innerHTML = "Share"
        share.onclick = function(){
            Results.shareResults()
        }
        this.html.appendChild(share)
        let back = document.createElement("button")
        let row = document.createElement("buttonRow")
        row.appendChild(back)
        this.html.appendChild(row)
        back.classList.add('gameSelect')
        back.innerHTML = "Back To Menu"
        back.onclick = function(){
            window.location.href = "./index.html"
        }
    }

    static shareResults(){
        let shareString = `WorXle #${RNG.getOffset()-20749}`
        if(Guess.win == 1){
            shareString = `${shareString} ${Guess.guesses.length}/8\r\n`
        }else{
            shareString = `${shareString} X/8\r\n`
        }
        Guess.guesses.forEach(guess => {
            let i = 0
            guess.colors.forEach(color => {
                if(guess.wrongLetterNum == i){
                    shareString = `${shareString}🟪`
                }else{
                    switch(color){
                        case("cellCorrect"):
                            shareString = `${shareString}🟩`
                            break
                        case("cellMisplaced"):
                            shareString = `${shareString}🟨`
                            break
                        case("cellWrong"):
                            shareString = `${shareString}⬛`
                            break
                    }
                }
                i++
            })
            shareString = `${shareString}\r\n`
        })
        navigator.clipboard.writeText(shareString);
    }
}


class RNG {
    //https://www.xjavascript.com/blog/seeding-the-random-number-generator-in-javascript/#linear-congruential-generators-lcg
    // I have no clue how to take a good pseudorandom number, so heres just a basic one.
    constructor(seed) {
        this.seed = seed;
        this.a = 1103515245; // glibc LCG parameters (widely used)
        this.c = 12345;
        this.m = 2 ** 31; // 2^31 ensures 32-bit output
    }

    // Returns a float in [0, 1)
    next() {
        this.seed = (this.a * this.seed + this.c) % this.m;
        return this.seed / this.m;
    }

    // Returns an integer in [min, max]
    nextInt(min, max) {
        const range = max - min + 1;
        return Math.floor(this.next() * range) + min;
    }

    static getSeed(day){
        const mod = wordleWordsList.length-1
        return (RNG.getOffset()+day)%mod+1
    }

    static getOffset(){
        const date = Date.now()
        const dateOffset = new Date(1970,1,1)
        let timedif = date - dateOffset
        return parseInt(Math.ceil(timedif / (1000 * 3600 * 24)))+30 // Why the +30? I don't know!
    }
}

function keyClick(letter){
    console.log(`key:${letter}`)
}

function cellClick(x,y){
    console.log(`x:${x},y:${y}`)
    if (Guess.win != 0) return
    Board.getBoard().setUnknown(x,y)
}

function addTitle(){
    let title = document.createElement('text')
    document.getElementById('titleArea').appendChild(title)
    if (isInfinite){
        title.innerHTML = "Random Worxle"
    }
}

function main(){
    addTitle()
    new Board()
    new Keyboard()
}


document.addEventListener('DOMContentLoaded', () => {
    main()
})



