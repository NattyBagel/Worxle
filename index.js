let num = 0

let next = document.getElementById("next")
let back = document.getElementById("back")
let worxle = document.getElementById("worxle")
let infinite = document.getElementById("infinite")

next.onclick = function(){
    console.log("+1")
    setDate(1)
}

back.onclick = function(){
    console.log("-1")
    setDate(-1)
}

worxle.onclick = function(){
    sessionStorage.setItem("isInfinite","false");
    sessionStorage.setItem("date",""+num);
    window.location.href = "https://nattybagel.github.io/Worxle/worxle.html"
}

infinite.onclick = function(){
    sessionStorage.setItem("isInfinite","true");
    sessionStorage.setItem("date","-1");
    window.location.href = "https://nattybagel.github.io/Worxle/worxle.html"
}

function setDate(newNum){
    num = Math.min(num + newNum,0)
    next.disabled = num >= 0
    if (num == 0){
        worxle.innerHTML = "Today's Worxle"
    }else if (num == -1){
        worxle.innerHTML = "Yesterday's Worxle"
    }else{
        worxle.innerHTML = `${Math.abs(num)} Days Agos Worxle`
    }
}


class Title {
    constructor(){
        let title = "worxle"
        let boardHTML = document.getElementById("board")
        let rowH = document.createElement("wordlegrid")
        rowH.classList.add("row")
        this.row = []
        for(let k = 0 ; k < 6; k++){
            let cell = document.createElement("button")
            cell.classList.add("cell","largeCell")
            cell.innerHTML = title.charAt(k).toUpperCase()
            rowH.appendChild(cell)
            this.row.push(cell)
        }
        boardHTML.appendChild(rowH)
    }

    run(){
        for (let k = 0 ; k < 6 ; k++){
            let cell = this.row[k]
            setTimeout(function(){
                cell.classList.add('flip')
                setTimeout(function(){
                    if (k != 3){
                        cell.classList.add("cellCorrect")
                    }else{
                        cell.classList.add("cellUnknown")
                    }
                    setTimeout(function(){
                        cell.classList.remove('flip')
                    },0.35 * 1000)
                },0.35 * 1000)
            },0.35 * 1000 * k)
        }
    }
}

let title = new Title()
title.run()