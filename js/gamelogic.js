$(document).ready(function() {

    let lightState = true;

            $("#switchOff").click(function (){
                if (lightState){
                    turnLamp.volume = 0.2;
                    turnLamp.play();
                    $("#bulbs").attr('src', '/images/off.png').animate({height: "-=10"}).animate({height: "+=10"});
                    lightState = false;
                }
            });

            $("#switchOn").click(function (){
                if (!lightState){
                    turnLamp.volume = 0.2;
                    turnLamp.play();
                    $("#bulbs").attr('src', '/images/on.png').animate({height: "-=10"}).animate({height: "+=10"});
                    lightState = true;
                }
            });

    document.getElementById("helpButton").hidden = true;
    document.getElementById("lightpanel").hidden = true;

    /*          idea: 2 dimenziós tömb, mint pálya (relációk könnyen kezelhetők), tic-tac-toe-hoz hasonló
                pl.:
                let map1 = [
    *           [ "o", "o", "o", "o", "o" ],
                [ "o", "o", "o", "o", "o" ],
                [ "o", "o", "o", "o", "o" ],
                [ "o", "o", "o", "x", "o" ],
                [ "o", "o", "x", "x", "x" ]]. ahol

                Az "x" -> "on"
                Az "o" -> "off"
    *  */

    function generateLightField(mapNumber) {
        // PÁLYÁK
        let maps = [
            [   [ "o", "o", "o", "o", "o" ],
                [ "o", "o", "o", "o", "o" ],
                [ "o", "o", "o", "o", "o" ],
                [ "o", "o", "o", "x", "o" ],
                [ "o", "o", "x", "x", "x" ]
            ],
            [   [ "o", "o", "o", "o", "o" ],
                [ "o", "o", "o", "o", "o" ],
                [ "o", "o", "x", "o", "o" ],
                [ "o", "x", "x", "x", "o" ],
                [ "x", "x", "x", "x", "x" ]
            ],
            [   [ "x", "x", "x", "x", "x" ],
                [ "o", "o", "o", "o", "o" ],
                [ "o", "o", "o", "o", "o" ],
                [ "o", "o", "o", "o", "o" ],
                [ "x", "x", "x", "x", "x" ]
            ],
            [   [ "x", "o", "o", "x", "x" ],
                [ "o", "o", "x", "o", "x" ],
                [ "o", "x", "o", "x", "o" ],
                [ "x", "o", "x", "o", "o" ],
                [ "x", "x", "o", "o", "x" ]
            ],
            [   [ "x", "o", "o", "o", "o" ],
                [ "o", "x", "o", "o", "o" ],
                [ "o", "o", "x", "o", "o" ],
                [ "o", "o", "o", "x", "o" ],
                [ "o", "o", "o", "o", "x" ]
            ],
            [   [ "x", "x", "o", "o", "o" ],
                [ "x", "x", "o", "o", "o" ],
                [ "o", "o", "x", "o", "o" ],
                [ "o", "o", "o", "o", "x" ],
                [ "o", "o", "o", "x", "x" ]
            ],
        ];

        // kiválasztott pálya
        return maps[mapNumber - 1];
    }

    // VÁLTOZÓK
    let userCanClick = false;
    let timerStarted = false;
    let startTime;
    let stepsCounter = 0;
    let timerInterval;
    let arrayOfScoreboards = [];
    let mapNumber;
    let lightField;
    let solutionField;
    let usedHelp = false;
    let clickSound = new Audio('/audio/clicksound.wav');
    let mapSelectSound = new Audio('/audio/mapselect.wav');
    let victorySound = new Audio('/audio/winner.wav');
    let turnLamp = new Audio('/audio/lampsound.wav');
    let backgroundMusic = document.getElementById("backgroundmusic");
    backgroundMusic.volume = 0.1;

    $(".mapCell").click(function() {
        // pálya számának kimentése
        mapNumber = $(this).text();
        mapSelectSound.play();
        usedHelp = false;
        document.getElementById("lightpanel").hidden = false;
        document.getElementById("helpButton").hidden = false;

        // megadott pályaszám alapján pálya generálása
        lightField = generateLightField(mapNumber);

        // full reset
        resetGame();
        repaintPanel();
        attachClickListener();
    });

    // kattintás event listener / GAME LOGIC
    function attachClickListener(){


        $("#lightpanel").off("click").on("click", function(e) {

        if(!userCanClick) {
            return false;
        }
        clickSound.play();

        if (!timerStarted && !usedHelp){
            startTime = new Date().getTime();
            startTimer();
            timerStarted = true;
        }
        stepsCounter++;
        // relatív koordináták meghatározása
        // e -> abszolút x, y koord.
        // relx, rely -> relatív x, y koord. #lightpanel-en belül
        // relx/rely = clickevent abszolút x/y - #lightpanel.getX/getY
        let pos = $("#lightpanel").position();
        let relx = e.pageX - pos.left;
        let rely = e.pageY - pos.top;
        //console.log("relx =" + relx);
        //console.log("rely =" + rely);

        // bekattintott node meghatározása
        // 5 x 5 -ös grid, 1 node 100 px
        let yCoord = Math.floor(rely / 100);
        let xCoord = Math.floor(relx / 100);
        //console.log("xCoord =" + xCoord);
        //console.log("yCoord =" + yCoord);

        // bekattintott node (x, y)
        lightField[yCoord][xCoord] = lightField[yCoord][xCoord] === "x" ? "o" : "x";

        // környező node-ok if exists (vagyis boundary-n belül van):

        // felső node (x, y-1)
        if(yCoord-1 >= 0) {
            lightField[yCoord-1][xCoord] = lightField[yCoord-1][xCoord] === "x" ? "o" : "x";
        }

        // alsó node (x, y+1)
        if(yCoord+1 < 5) {
            lightField[yCoord+1][xCoord] = lightField[yCoord+1][xCoord] === "x" ? "o" : "x";
        }

        // bal oldali node (x-1, y)
        if(xCoord-1 >= 0) {
            lightField[yCoord][xCoord-1] = lightField[yCoord][xCoord-1] === "x" ? "o" : "x";
        }

        // jobb oldali node (x+1, y)
        if(xCoord+1 < 5) {
            lightField[yCoord][xCoord+1] = lightField[yCoord][xCoord+1] === "x" ? "o" : "x";
        }
        repaintPanel();
        if(usedHelp){
            repaintSolutionPanel();
        }
    });}

    attachClickListener();

    // scoreboard eltűntetése
    $('.map-heading').click(function() {
        $(this).next('.score-details').slideToggle();
    });

    // repaint / JÁTÉKTÉR MEGRAJZOLÁSA
    function repaintPanel() {

        let canvas = document.getElementById("lightpanel");

        // <canvas> check
        if (!canvas.getContext){
            alert("A böngésződ nem tudja megjeleníteni a játékhoz szükséges <canvas> elementet!");
        } else {
            clear();
            let ctx = canvas.getContext("2d");

            // NODE KÉSZÍTŐ
            let allLightsAreOff = true;
            for(let i = 0; i < lightField.length; i++) {
                for (let j = 0; j < lightField[i].length; j++) {

                    // Körök params
                    ctx.lineWidth = 3;
                    ctx.strokeStyle = "#e8c21b";

                    // Rajzolás start
                    ctx.beginPath();

                    // arc( x, y, radius, startAngle, endAngle, anticlockwise)
                    ctx.arc(j * 100 + 50, i * 100 + 50, 40, 0, Math.PI*2, true);
                    ctx.stroke();

                    // kitöltés ellenőrzés / fill
                    if(lightField[i][j] === "x") {
                        ctx.fillStyle = "#FFBD38";
                        ctx.beginPath();
                        ctx.arc(j * 100 + 50, i * 100 + 50, 38, 0, Math.PI*2, true);
                        ctx.fill();

                        // gamestate még nem kezdődött el, false!
                        allLightsAreOff = false;
                    }

                }
            }

            // Sikeres kirakás / ENDGAME SCENARIO
            if(allLightsAreOff && !usedHelp) {
                victorySound.play();
                // Click off
                userCanClick = false;
                stopTimer();
                let endTime = new Date();
                let timeDiff = endTime - startTime;
                let seconds = Math.floor (timeDiff / 1000);

                $("#timer").text("Idő: "+ seconds + " sec");
                $("#stepsCounter").text("Lépésszám: "+ stepsCounter);
                document.getElementById("helpButton").hidden = true;
                document.getElementById("lightpanel").hidden = true;

                let playerName = prompt("Gratulálok! Sikeresen teljesítetted a pályát!\nKérlek írd be a neved:");
                if (playerName) {
                    // score objektum gen + fill
                    let score = {
                        name: playerName,
                        time: seconds,
                        steps: stepsCounter
                    };
                    addScore(score, mapNumber);
                } else{
                    alert("Kérlek add meg a neved, hogy felkerülj a toplistára!")
                }
            }else if(allLightsAreOff && usedHelp){
                userCanClick = false;
                document.getElementById("lightpanel").hidden = true;
            } else {
                $("#stepsCounter").text("Lépésszám: "+ stepsCounter);
            }
        }
    }

    // CANVAS CLEAR
    function clear() {
        let canvas = document.getElementById("lightpanel");
        let ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, 500, 500);
    }
    // TIMER
    function startTimer() {
        startTime = new Date().getTime();
        // újra és újra hívjuk az update-et másodpercenként
        timerInterval = setInterval(updateTimer, 1000);
    }
    function stopTimer() {
        clearInterval(timerInterval);
    }
    function updateTimer() {
        if (timerStarted) {
            let currentTime = new Date().getTime();
            let elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
            $("#timer").text("Idő: " + elapsedSeconds + " sec");
        } else {
            $("#timer").text("Idő: 0 sec");
        }
    }
    // JÁTÉK RESET
    function resetGame() {
        // timer + steps reset,
        // lehessen újra kattintani
        timerStarted = false;
        startTime = 0;
        stepsCounter = 0;
        userCanClick = true;
        stopTimer();
        updateTimer();
    }

    // SCOREBOARD
    function addScore(score, mapNumber){
        if (!arrayOfScoreboards[mapNumber]) {
            arrayOfScoreboards[mapNumber] = []; // új scoreboard ha nincs még rekord
        }
        arrayOfScoreboards[mapNumber].push(score);
        updateScoreboard(arrayOfScoreboards[mapNumber], mapNumber);
    }
    // sorbarendezés kirakási idő szerint
    function updateScoreboard(scores) {
        scores.sort(function (a, b){
            return a.time - b.time;
        })
        let scoreList = document.getElementById("scoreList" + mapNumber); //pálya specifikus scoreboard

        // scoreboard reset
        scoreList.innerHTML = "";

        // pontszámok hozzáadása a toplistához
        scores.forEach(function (score) {
            let listItem = document.createElement("li");
            listItem.textContent = "Név: " + score.name + ", idő: " + score.time + " sec, lépések: " + score.steps;
            scoreList.appendChild(listItem);
        });
    }
    $("#helpButton").click(function() {
        usedHelp = true;
        lightField = generateLightField(mapNumber);
        solutionField = generateSolutionField(mapNumber);
        resetGame();
        repaintPanel();
        repaintSolutionPanel();
    });
    function generateSolutionField(mapNumber){
        let solutions = [
            [   [ "o", "o", "o", "o", "o" ],
                [ "o", "o", "o", "o", "o" ],
                [ "o", "o", "o", "o", "o" ],
                [ "o", "o", "o", "o", "o" ],
                [ "o", "o", "o", "1", "o" ]
            ],
            [   [ "o", "o", "1", "o", "o" ],
                [ "o", "1", "1", "1", "o" ],
                [ "1", "o", "o", "o", "1" ],
                [ "1", "o", "o", "o", "1" ],
                [ "o", "o", "1", "o", "o" ]
            ],
            [   [ "1", "o", "1", "o", "1" ],
                [ "o", "1", "o", "1", "o" ],
                [ "o", "1", "1", "1", "o" ],
                [ "1", "1", "1", "1", "1" ],
                [ "o", "o", "o", "o", "o" ]
            ],
            [   [ "o", "o", "o", "1", "o" ],
                [ "1", "o", "1", "o", "o" ],
                [ "1", "o", "o", "o", "1" ],
                [ "o", "o", "1", "o", "1" ],
                [ "o", "1", "o", "o", "o" ]
            ],
            [   [ "o", "o", "1", "o", "1" ],
                [ "1", "1", "1", "o", "1" ],
                [ "o", "o", "1", "o", "o" ],
                [ "1", "o", "1", "1", "1" ],
                [ "1", "o", "1", "o", "o" ]
            ],
            [   [ "o", "o", "o", "1", "o" ],
                [ "1", "1", "1", "1", "1" ],
                [ "1", "o", "1", "o", "o" ],
                [ "o", "1", "1", "o", "1" ],
                [ "o", "o", "1", "o", "o" ]
            ],
        ];
        return solutions[mapNumber - 1];
    }
    function repaintSolutionPanel() {

        let canvas = document.getElementById("lightpanel");

        // <canvas> check
        if (!canvas.getContext){
            alert("A böngésződ nem tudja megjeleníteni a játékhoz szükséges <canvas> elementet!");
        } else {
            let ctx = canvas.getContext("2d");

            //clear
            clear();

            // lightField + solutionField
            for (let i = 0; i < lightField.length; i++) {
                for (let j = 0; j < lightField[i].length; j++) {

                    // lightField node-ok
                    ctx.lineWidth = 3;
                    ctx.strokeStyle = "#e8c21b";
                    ctx.beginPath();
                    ctx.arc(j * 100 + 50, i * 100 + 50, 40, 0, Math.PI * 2, true);
                    ctx.stroke();

                    if (lightField[i][j] === "x") {
                        ctx.fillStyle = "#FFBD38";
                        ctx.beginPath();
                        ctx.arc(j * 100 + 50, i * 100 + 50, 38, 0, Math.PI * 2, true);
                        ctx.fill();
                    }

                    // solutionField node-ok
                    if (solutionField[i][j] === "1") {
                        ctx.fillStyle = "#00FF00";
                        ctx.beginPath();
                        ctx.arc(j * 100 + 50, i * 100 + 50, 10, 0, Math.PI * 2, true);
                        ctx.fill();
                    }
                }
        }
    }
        canvas.addEventListener("click", function (event) {
            let rect = canvas.getBoundingClientRect();
            let x = event.clientX - rect.left;
            let y = event.clientY - rect.top;

            // Kattintás megkeresése
            let col = Math.floor(x / 100);
            let row = Math.floor(y / 100);

            // Ha solution node, akkor eltűntetjük
            if (solutionField[row][col] === "1") {
                solutionField[row][col] = "o";
                repaintSolutionPanel();
            }
        });
    }
});