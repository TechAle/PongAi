let DebugMode = Boolean();
DebugMode = false;
/// Movimenti
// Lista tasti
var listaTasti =
    {
        'w': 0,
        's': 0,
        'i': 0,
        'k': 0
    };
// Dimensioni dei giocatori
const dim =
    {
        altezza: 40,
        larghezza: 9,
        r: 5,
        distMuro: 10,
        maxX: 600,
        maxY: 600,
        xSchermo: 800,
        ySchermo: 700
    };
const yVar = dim.ySchermo - dim.maxY;

// Funzione per ottenere un numero intero casuale
// https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.ceil(max) + 1; // Ho aggiunto + 1 per rendere il nostro max incluso
    return Math.floor(Math.random() * (max - min)) + min; //Il max è escluso e il min è incluso
}


class Palla {
    constructor() {
        // Angolatura della palla
        this.ang = Math.random(0.3, 0.7).toPrecision(2);
        // Settaggio della direzione
        this.dir = getRandomInt(0, 1);
        // Velocità base
        this.vel = 12;
        this.velX = this.vel * Math.cos(this.ang);
        if (this.dir === 1)
            this.velX *= -1;
        this.velY = this.vel * Math.sin(this.ang);
        if (getRandomInt(0, 1) === 0)
            this.velY *= -1;
        // Settaggio delle sue coordinate
        this.posY = yVar + dim.maxY/2;
        this.posX = dim.maxX / 2;

    }

    disegno() {
        // Controllo delle collisioni
        this.collisioni();
        // Disegno
        fill(255, 255, 255);
        noStroke();
        circle(this.posX, this.posY, dim.r);
    }

    collisioni() {
        /// Controllo collisioni con muri
        // Muri orizzontali ( 1. del disegno )
        if (this.posY + dim.r > dim.maxY + yVar || this.posY - dim.r < yVar) {
            // Controllo la velocità
            if ( this.velY > 0 && this.posY > dim.maxY - 10 || this.velY < 0 && this.posY < 10 + yVar) {
                this.velY *= -1;
            }
        }
        /// Muri verticali
        // Controllo della sua direzione
        if (this.dir === 1) {
            // Controllo collisione personaggio
            if (
                (pl1.x + dim.larghezza > this.posX - dim.r + palla1.velX/4 && pl1.x < this.posX - dim.r)
                && (this.posY >= pl1.y - dim.r && this.posY < pl1.y + dim.altezza + dim.r * 1.5)) {
                // Calcolo della pendenza del rimbalzo
                this.ang = map(this.posY, pl1.y, pl1.y + dim.altezza, -1, 1);
                this.velX = this.vel * Math.cos(this.ang);
                this.velY = this.vel * Math.sin(this.ang);
                // Setto la direzione
                this.dir = 0;

            }
            // Controllo la collisione
            else if (this.posX - dim.r <= 0) {
                this.velX *= -1;
                this.dir = 0;
                let dataP = new Date();
                print("Perso " + dataP.getHours() + " " + dataP.getMinutes() + " " + this.dir)
                pl1.score += 1;
                barraSopra();
            }
        } else { // + palla1.velX / 4
            if ((pl2.x > palla1.posX - dim.r && pl2.x - dim.larghezza < palla1.posX + dim.r )
                && (palla1.posY >= pl2.y - dim.r && palla1.posY < pl2.y + dim.altezza + dim.r)) {
                this.ang = map(this.posY, pl2.y, pl2.y + dim.altezza, -1, 1);
                this.velX = this.vel * Math.cos(this.ang) * -1;
                this.velY = this.vel * Math.sin(this.ang);
                // Setto la direzione
                this.dir = 1;

            }
            // Controllo collisione
            else if (this.posX + dim.r + 2 >= dim.maxX) {
                this.velX *= -1;
                this.dir = 1;
                let dataP = new Date();
                print("Perso " + dataP.getHours() + " " + dataP.getMinutes() + " " + this.dir)
                pl2.score += 1;
                barraSopra();
            }

        }

        // Calcolo movimento
        this.posX += this.velX;
        this.posY += this.velY;
    }

}

// Classe giocatore
class Giocatore {
    constructor(n, bot) {
        // Controlla se sarà un ai o no
        this.bot = bot;
        // Velocità del giocatore
        this.vel = 12;
        // Posizione y del giocatore
        this.y = dim.maxY / 2 + yVar;
        // Se il giocatore è del primo team o no
        this.plNum = n;
        if (this.plNum === 0) {
            // Posizionamento a sinistra
            this.x = dim.distMuro;
            this.larghezza = dim.larghezza;
        } else {
            // Posizionamento a destra
            this.x = dim.maxX - dim.distMuro;
            this.larghezza = -dim.larghezza;
        }
        // Se è un bot, aggiungi questa funzione che descrive
        if (this.bot === 1) {
            this.mom = 0;
        }
        this.score = 0;

    }

    muoviSotto() {
        // Controllo le collisioni con il muro superiore
        if (this.y + dim.altezza < dim.maxY + yVar)
            this.y += this.vel;
    }

    muoviSopra() {
        // Controllo le collisioni con il muro inferiore
        if (this.y > yVar)
            this.y -= this.vel;
    }

    disegno() {

        // Se è un robot
        if ( this.bot === 1)
            // Controlla se è il suo turno
            if ( this.plNum != palla1.dir)
                // Avvia l'intelligenza artificiale
                this.ai();
        // Disegno del primo giocatore
        fill(255, 255, 255);
        // Togliere il contorno
        noStroke();
        // Disegno
        rect(this.x, this.y, this.larghezza, dim.altezza);

    }

    // Funzione responsabile al corretto funzionamento delle intelligenze artificiali
    ai(){
        // Se è la prima volta, raccogli le prime posizioni
        if ( this.mom === 0 || (palla1.dir != prevDirezione) )
            this.primoAi();
        // Raccolgo altre 2 coordidnate
        else if (this.mom === 1)
            this.secondoAi();
        // Calcolo la traiettoria
        else if ( this.mom === 2 )
            this.predict();
        // movimento dell'intelligenza artificiale
        else if ( this.mom === 3 )
            this.aiMov()




    }

    aiMov(){
        // Movimento a seconda della posizione
        if ( this.y + this.posGo > this.yDest )
            this.muoviSopra();
        else
            this.muoviSotto();
        // Se è più o meno vicino al punto desiderato, fermati
        if ( this.y + this.posGo + this.vel / 2 > this.yDest && this.y + this.posGo - this.vel / 2 < this.yDest ) {
            this.mom += 1;
        }
    }

    // Raccogli le prime posizioni
    primoAi(){
        this.posXprima = palla1.posX;
        this.posYprima = palla1.posY;
        this.mom = 1;
    }


    secondoAi(){
        this.probPosXdopo = palla1.posX;
        this.probPosYdopo = palla1.posY;
        this.mom = 2;
    }

    predict(){


        let c, d, coef, q, xDest, posXdopo, posYdopo;

        let primaEntrata = 0,
            cicli = 0;

        // Per vedere su quale muro rimbalzerà
        if ( this.plNum ) {
            xDest = dim.maxX - dim.distMuro - dim.larghezza - dim.r;
        }
        else {
            xDest = dim.distMuro + dim.larghezza + dim.r;
        }

        do {
            /// Controllo i punti
            if ( primaEntrata === 0 ) {
                cancellaLinee();
                // Se non sono ordinati
                if (!(this.posYprima > this.probPosYdopo > palla1.posY || palla1.posY > this.probPosYdopo > this.posYprima)){
                    this.posYprima = this.probPosYdopo;
                    this.posXprima = this.probPosXdopo;
                }
                posXdopo = palla1.posX;
                posYdopo = palla1.posY;
                primaEntrata = 1;

            } else {

                let prevPosXPrima = posXdopo,
                    prevPosYPrima = posYdopo;

                // Trovo con quale asse intersecherà
                if ( this.posYprima - posYdopo >= 0 )
                    this.posYprima = dim.r + yVar;
                else
                    this.posYprima = dim.maxY - dim.r + yVar;

                // Trovo intersezione asse delle X
                this.posXprima = (this.posYprima - q) / coef;

                // porto la X a dopo
                posXdopo = posXdopo + (this.posXprima - posXdopo) * 2;

                aggiungiLinea(prevPosXPrima,prevPosYPrima,this.posXprima,this.posYprima)

            }

            // Calcolo i vari dati (guardare la documentazione per maggiori chiarimenti)
            c = posXdopo - this.posXprima;
            d = posYdopo - this.posYprima;

            coef = d/c;
            q = (-this.posXprima)/c*d+this.posYprima;

            this.yDest = xDest * coef + q;

            cicli += 1;


        }while ((this.yDest <= yVar + dim.r || this.yDest >= dim.maxY - dim.r + yVar) && cicli < 100);
        // porto
        this.mom += 1;
        aggiungiLinea(this.posXprima,this.posYprima,xDest,this.yDest)

        // Libero la memoria
        this.posXprima = this.posYprima = this.probPosXdopo = this.probPosYdopo = null;
        this.posGo = getRandomInt(dim.altezza/2 - dim.r, dim.altezza/2 + dim.r );



    }

    rimbalzo(coef, q){
        // Inizializzo variabili
        let y0,
            x0;
        // Se il coefficente è < di 0 perciò la y sarà per forza 0 e perciò
        // la x0 diventerà la q
        if (coef <= 0)
        {
            y0 = yVar;
        }
        else
        {
            y0 = dim.maxY;
        }
        x0 = (dim.maxY - pl2.q) - pl2.coef;
        coef = -1/coef;
        q = coef * this.posYLinea + y0;


    }

}

// Creazione classe associata al giocatore
let pl1 = new Giocatore(0, 1);
let pl2 = new Giocatore(1, 1);
let palla1 = new Palla();

// Detecta che il tasto venga premuto
function keyTyped() {

    switch (key) {
        case 'w':
            if (pl1.bot === 0)
                listaTasti['w'] = 1;
            break;
        case 's':
            if (pl1.bot === 0)
                listaTasti['s'] = 1;
            break;
        case 'i':
            if (pl2.bot === 0)
                listaTasti['i'] = 1;
            break;
        case 'k':
            if (pl2.bot === 0)
                listaTasti['k'] = 1;
            break;

    }
}


// Detecta che venga rilasciato
function keyReleased() {
    switch (key) {
        case 'w':
            listaTasti['w'] = 0;
            break;
        case 's':
            listaTasti['s'] = 0;
            break;
        case 'i':
            listaTasti['i'] = 0;
            break;
        case 'k':
            listaTasti['k'] = 0;
            break;
    }
}

// Creazione del canvas
function setup() {
    createCanvas(dim.xSchermo, dim.ySchermo);
    barraSopra();
    bottoniSopra();
}

let linee = [];

function aggiungiLinea(posXprima,posYprima,posXdopo,posYdopo){
    linee.push({"posXprima" : posXprima,
                "posYprima" : posYprima,
                "posXdopo" : posXdopo,
                "posYdopo" : posYdopo});
}

function disegnaLinee() {
    for (let i = 0 ; i < linee.length ; i++ ) {
        stroke(125);
        strokeWeight(4)
        line(linee[i]["posXprima"], linee[i]["posYprima"], linee[i]["posXdopo"], linee[i]["posYdopo"])
    }

}

function cancellaLinee(){
    let lung = linee.length
    for (let i = 0 ; i <= lung; i++ )
         linee.pop()
}

var ricSopra,
    ricSotto;

function stoppa(){
    if ( palla1.velX >= 0 )
        ricSopra = 1;
    else
        ricSopra = -1;
    if ( palla1.velY >= 0 )
        ricSotto = 1;
    else
        ricSotto = -1;

    palla1.velY = palla1.velX = 0;
}

function avvia(){
    palla1.velX = palla1.vel * Math.cos(palla1.ang) * ricSopra;
    palla1.velY = palla1.vel * Math.sin(palla1.ang);
}

let prevDirezione = palla1.dir;

// Ripetitore di tutto
function draw() {
    backDraw();
    // Disegno la palla
    palla1.disegno();
    // Disegno giocatore
    pl1.disegno();
    pl2.disegno();
    // Movimento di tutti i giocatori
    movimento();
    stroke(125);
    strokeWeight(4)
    if ( DebugMode )
        disegnaLinee();
    prevDirezione = palla1.dir;

}

function dashLine(yin, yfin, x, rip){
    // Acquisizione della lunghezza della linea
    let lineLen = yfin / rip;
    // Setto il colore e la dimensione
    stroke(255);
    strokeWeight(2)
    // Disegno
    for (i = 0 ; i < rip ; i++){
        line(x, yin + lineLen * i + 5, x, yin + lineLen * i + lineLen)
    }
}

function backDraw(){
    // Creazione del background
    noStroke();
    fill(0, 0, 0);
    rect(0, yVar, dim.maxX, dim.maxY);
    // Linea al centro
    dashLine(yVar,dim.maxY,dim.maxX/2,70);
    // Linea sul lato superiore
    fill(125,125,125);
    rect(0, yVar - 20, dim.maxX, 20);
}



function barraSopra() {
    noStroke();
    fill(255, 255, 255);
    rect(dim.maxX/4, 0, dim.maxX/2, yVar - 20);
    // Numeri
    fill(0, 0, 0);
    textSize(80);
    text(pl2.score, 150, yVar - 30);
    let spost = 1,
        copiaScore = pl1.score;

    while (copiaScore > 9) {
        copiaScore /= 10;
        spost += 1;
    }

    text(pl1.score, dim.maxX - (spost * 50) - 150, yVar - 30);
}

function mousePressed() {
    print(mouseX)
    if (mouseY > 15 && mouseY < 15 + yVar - 50) {
        if (mouseX < 110) {
            if (mouseX > 10) {

                if (pl1.bot === 0)
                    pl1.bot = 1;
                else
                    pl1.bot = 0;
                bottoniSopra();
            }
        }
        else
            if (mouseX < dim.maxX - 10)
                if (mouseX > dim.maxX - 10 - 100) {
                    if (pl2.bot === 0)
                        pl2.bot = 1;
                    else
                        pl2.bot = 0;
                    bottoniSopra();
                    print("cambioDestr");
                }
    }

}

function bottoniSopra() {
    let botPl1 = "on",
        botPl2 = "on";


    if (pl1.bot === 0)
        botPl1 = "off";
    if (pl2.bot === 0)
        botPl2 = "off;"

    stroke(0);
    strokeWeight(4);
    fill(255, 255, 255);
    rect(10, 15, 100, yVar - 50);
    textSize(30);
    noStroke();
    fill(0, 0, 0);
    text("bot", (100 - 15) / 2 - 15 / 2, yVar - 50);
    textSize(15);
    text(botPl1, 100/2, yVar - 39);
    stroke(0);
    strokeWeight(4);
    fill(255, 255, 255);
    rect(dim.maxX - 10, 15, -100, yVar - 50);
    textSize(30);
    noStroke();
    fill(0, 0, 0);
    text("bot", dim.maxX - (100 - 15), yVar - 50);
    textSize(15);
    text(botPl2, dim.maxX - 100 / 2 - 15 * 1.3, yVar - 39);
}



// Controllo dei tasti premuti
function movimento() {
    // Itera per ogni tasto che può essere premuto
    for (let property in listaTasti)
        switch (property) {
            case 'w':
                if (listaTasti[property])
                    pl1.muoviSopra();
                break;
            case 's':
                if (listaTasti[property])
                    pl1.muoviSotto();
                break;
            case 'i':
                if (listaTasti[property])
                    pl2.muoviSopra();
                break;
            case 'k':
                if (listaTasti[property])
                    pl2.muoviSotto();

        }
}
