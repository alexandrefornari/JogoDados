window.onload = init;

//Stage, canvas e a fila de carregamento
var stage, queue, canvas, ctx;


//Constantes das telas do jogo:
const INICIAL = 0;
const SETTINGS = 1;
const ABOUT = 2;
const RULES = 3;
const DIFFICULT = 4;
const PLAYING = 5;
const FEEDBACK = 6;
const RESULT = 7;

//Níveis de dificuldade do jogo:
const EASY = 0;
const MEDIUM = 1;
const HARD = 2;

const SCALE = 30;

//Tela atual
var currentScreen = INICIAL;
var currentLevel;

//Número de jogadores (1 ou 2)
var nPlayers = 1;
var backgroundImage;
var dados;

//Botoes utilizados no jogo
var bt_start, bt_rules, bt_help, bt_settings;
var bt_facil, bt_medio, bt_dificil, bt_menu;
var bt_confirmar, bt_niveis, bt_recomecar;
var bt_ok;
var feedback = "";
var textFeedback;


//Inicia o aplicativo
function init(){
    
    $("#equacao").hide();
    $("#resposta").hide();
    
    canvas = document.getElementById("game");
    ctx = canvas.getContext("2d");
    stage = new createjs.Stage("game");
    createjs.Touch.enable(stage);
    stage.enableMouseOver();
    queue = new createjs.LoadQueue(false);
    queue.addEventListener("complete", initComplete);
    queue.loadManifest([{id:"background", src:"resources/inicial.png"},
                        {id:"bt_start", src:"resources/bt_jogar.png"},
                        {id:"bt_settings", src:"resources/bt_settings.png"},
                        {id:"bt_about", src:"resources/bt_about.png"},
                        {id:"bt_rules", src:"resources/bt_rules.png"},
                        {id:"bt_about", src:"resources/bt_about.png"},
                        {id:"bt_facil", src:"resources/bt_facil.png"},
                        {id:"bt_medio", src:"resources/bt_medio.png"},
                        {id:"bt_dificil", src:"resources/bt_dificil.png"},
                        {id:"bt_menu", src:"resources/bt_menu.png"},
                        {id:"bt_confirmar", src:"resources/bt_confirmar.png"},
                        {id:"bt_niveis", src:"resources/bt_niveis.png"},
                        {id:"bt_recomecar", src:"resources/bt_recomecar.png"},
                        {id:"bt_ok", src:"resources/bt_ok.png"},
                        {id:"dice1", src:"resources/dice1.png"},
                        {id:"dice2", src:"resources/dice2.png"},
                        {id:"dice3", src:"resources/dice3.png"},
                        {id:"dice4", src:"resources/dice4.png"},
                        {id:"dice5", src:"resources/dice5.png"},
                        {id:"dice6", src:"resources/dice6.png"}]);
    
    screenLoader.x = 90;
    screenLoader.y = 380;
    stage.addChild(screenLoader);
    //screenLoader.graphics.beginFill("#000000").drawRect(0,0,300,20);
    //screenLoader.graphics.beginFill("#ffffff").drawRect(1,1,298,18);
    textLoader.x = 200;
    textLoader.y = 350;
    stage.addChild(textLoader);
    
    //createjs.Ticker.addListener(window);
    createjs.Ticker.addEventListener("tick", tick);
    createjs.Ticker.useRAF = true;
    createjs.Ticker.setFPS(60);
    
    textFeedback = new createjs.Text("", "20px Arial", "#ff7700");
    textFeedback.lineWidth = 300;
    textFeedback.x = 80;
    textFeedback.y = 200;
}

var screenLoader = new createjs.Shape();
var textLoader = new createjs.Text("Loading...", "20px Arial", "#000000");

//Função para atualizar a atividade em 60FPS
function tick(event) {
    var progress = queue.progress;
    screenLoader.graphics.beginFill("#000000").drawRect(0,0,300,20);
    screenLoader.graphics.beginFill("#ffffff").drawRect(1,1,298,18);
    screenLoader.graphics.beginFill("#ff0000").drawRect(1,1,298 * progress,18);
    updateScreen();
    console.log(progress);
}


var screenLoader = new createjs.Shape();


//Assim que o carregamento do assetx estiver completo:
function initComplete(event){
    //backgroundImage = new createjs.Bitmap(queue.getResult("background"));
    //stage.addChild(backgroundImage);

    createjs.Ticker.removeEventListener("tick", tick);
    stage.removeChild(screenLoader);
    stage.removeChild(textLoader);
    
    bt_start = createButton("bt_start", 240, 250, startHandler);
    
    bt_facil = createButton("bt_facil", 240, 300, setDifficult);
    bt_medio = createButton("bt_medio", 240, 450, setDifficult);
    bt_dificil = createButton("bt_dificil", 240, 600, setDifficult);
    bt_menu = createButton("bt_menu", 240, 760, goToMenu);
    
    bt_confirmar = createButton("bt_confirmar", 240, 690, evaluate);
    bt_niveis = createButton("bt_niveis", 90, 760, startHandler);
    bt_recomecar = createButton("bt_recomecar", 390, 760, restart);
    
    bt_ok = createButton("bt_ok", 240, 760, restart);
    
    dados = new Dados(2);
    dados.visual.x = 60;
    dados.visual.y = 200;
    
    loadScreen(currentScreen);
}

//Ao clicar no botao JOGAR
function startHandler(event){
    unloadScreen();
    loadScreen(DIFFICULT);
}

//Ao clicar no botao facil, medio ou dificil
function setDifficult(event){
    switch (event.target.name){
        case "bt_facil":
            currentLevel = EASY;
            dados.setN(2);
            break;
        case "bt_medio":
            currentLevel = MEDIUM;
            dados.setN(3);
            break;
        case "bt_dificil":
            currentLevel = HARD;
            dados.setN(4);
            break;
    }
    unloadScreen();
    loadScreen(PLAYING);
}

//Volta ao menu principal.
function goToMenu(event){
    unloadScreen();
    loadScreen(INICIAL);
}

//Avalia o que foi inserido na resposta
function evaluate(event){
    //Verifica se todos os campos estão preenchidos
    var input = $("#equacao").val();
    var resultado = $("#resposta").val();
    
    while (input.indexOf(" ") >= 0) {
        input = input.replace(" ", "");
    }
    while (resultado.indexOf(" ") >= 0) {
        resultado = resultado.replace(" ", "");
    }
    
    //Caso um dos campos esteja em branco, envia uma mensagem ao usuário.
    if (input == "" || resultado == "") {
        alert("Você precisa preencher os dados antes de avaliar.");
        return;
    }
    
    //Avalia o que foi respondido
    var result = dados.getResult();
    
    //console.log("Equacao digitada: " + input);
    //console.log("Resultado digitado: " + resultado);
    
    var soma = 0;
    
    for(var i = 0; i < result.length; i++){
        //console.log("É par? " + result[i] % 2);
        if(result[i] % 2 != 0){
            result[i] *= -1;
        }
        soma += result[i];
        console.log("Soma = " + soma);
        
        //console.log("buscando: " + result[i] + " | indice: " + input.indexOf(result[i]));
        if(input.indexOf(result[i]) > -1){
            input = input.replace(result[i].toString(), "");
        }
        //console.log("Equacao restante: " + input);
    }
    while(input.indexOf("+") >= 0) {
        input = input.replace("+", "");
    }
    
    //console.log("Equacao final: " + input);
    //console.log("Soma digitada: " + resultado + " | soma esperada: " + soma);
    
    //Avalia o resultado
    feedback = "";
    if (input.length == 0) {
        //console.log("Equacao correta");
        feedback += "A equação digitada está correta!";
    }else{
        //console.log("Sobrou: " + input + " na equacao.");
        feedback += "Preste atenção nos valores sorteados e tente novamente."
    }
    
    if (soma.toString() == resultado) {
        //console.log("Soma correta");
        feedback += "\nO resultado está correto!";
    }else{
        //console.log("Soma incorreta: " + soma);
        feedback += "\nA soma está incorreta. A soma correta seria " + soma;
    }
    //console.log("Soma correta? " + soma.toString() == resultado);
    //console.log("Equacao correta? " + input.length);
    
    unloadScreen();
    loadScreen(FEEDBACK);
}

//Lançar os dados novamente
function restart(event){
    unloadScreen();
    loadScreen(PLAYING);
}

//Desenha a tela de acordo com a necessidade.
function loadScreen(n){
    currentScreen = n;
    switch (n){
        case INICIAL:
            stage.addChild(bt_start);
            break;
        case SETTINGS:
            
            break;
        case ABOUT:
            
            break;
        case RULES:
            
            break;
        case DIFFICULT:
            stage.addChild(bt_facil);
            stage.addChild(bt_medio);
            stage.addChild(bt_dificil);
            stage.addChild(bt_menu);
            break;
        case PLAYING:
            dados.sort();
            
            stage.addChild(bt_menu);
            stage.addChild(bt_recomecar);
            stage.addChild(bt_niveis);
            stage.addChild(bt_confirmar);
            stage.addChild(dados.visual);
            
            $("#equacao").val("");
            $("#resposta").val("");
            $("#equacao").show();
            $("#resposta").show();
            break;
        case FEEDBACK:
            textFeedback.text = feedback;
            stage.addChild(textFeedback);
            stage.addChild(bt_ok);
            break;
        case RESULT:
            
            break;
    }
    updateScreen();
}

//Descarrega a tela e os botões que estão carregados
function unloadScreen(){
    switch (currentScreen){
        case INICIAL:
            stage.removeChild(bt_start);
            break;
        case SETTINGS:
            
            break;
        case ABOUT:
            
            break;
        case RULES:
            
            break;
        case DIFFICULT:
            stage.removeChild(bt_facil);
            stage.removeChild(bt_medio);
            stage.removeChild(bt_dificil);
            stage.removeChild(bt_menu);
            break;
        case PLAYING:
            
            stage.removeChild(bt_menu);
            stage.removeChild(bt_recomecar);
            stage.removeChild(bt_niveis);
            stage.removeChild(bt_confirmar);
            stage.removeChild(dados.visual);
            
            $("#equacao").hide();
            $("#resposta").hide();
            break;
        case FEEDBACK:
            stage.removeChild(bt_ok);
            stage.removeChild(textFeedback);
            break;
        case RESULT:
            
            break;
    }
    updateScreen();
}

//Atualiza a tela.
function updateScreen(){
    stage.update();
}


//Função para criar os botoes
function createButton(id, posX, posY, func){
    var bt = new createjs.MovieClip();
    bt.name = id;
    var img = new createjs.Bitmap(queue.getResult(id));
    bt.addChild(img);
    img.x = -queue.getResult(id).width/2;
    img.y = -queue.getResult(id).height/2;
    bt.x = posX;
    bt.y = posY;
    bt.addEventListener("click", func);
    bt.addEventListener("mouseover", overBtn);
    bt.addEventListener("mouseout", outBtn);
    return bt;
}
//Mouse over no botao
function overBtn(event){
    var bt = event.target;
    bt.scaleX = 1.1;
    bt.scaleY = 1.1;
    updateScreen();
}
//MouseOut no botao
function outBtn(event){
    var bt = event.target;
    bt.scaleX = 1;
    bt.scaleY = 1;
    updateScreen();
}



//Classe dos dados que serão animados
//O que utilizar pra animacao em 3d???
function Dados(nDados){
    this.dado1 = new Dado();
    this.dado2 = new Dado();
    this.dado3 = new Dado();
    this.dado4 = new Dado();
    
    this.dados = [this.dado1, this.dado2, this.dado3, this.dado4];
    
    this.visual = new createjs.MovieClip();
    
    this.n = null;
    this.result = null;

    this.setN = function (n){
        this.removeAll();
        switch (n) {
            case 2:
                this.dado1.visual.x = 0;
                this.dado1.visual.y = 100;
                //this.dado1.visual.scaleX = -0.8;
                
                this.dado2.visual.x = 200;
                this.dado2.visual.y = 100;
                
                this.visual.addChild(this.dado1.visual);
                this.visual.addChild(this.dado2.visual);
                break;
            case 3:
                this.dado1.visual.x = 0;
                this.dado1.visual.y = 0;
                
                this.dado2.visual.x = 200;
                this.dado2.visual.y = 0;
                
                this.dado3.visual.x = 95;
                this.dado3.visual.y = 200;
                
                this.visual.addChild(this.dado1.visual);
                this.visual.addChild(this.dado2.visual);
                this.visual.addChild(this.dado3.visual);
                break;
            case 4:
                this.dado1.visual.x = 0;
                this.dado1.visual.y = 0;
                
                this.dado2.visual.x = 200;
                this.dado2.visual.y = 0;
                
                this.dado3.visual.x = 0;
                this.dado3.visual.y = 200;
                
                this.dado4.visual.x = 200;
                this.dado4.visual.y = 200;
                
                this.visual.addChild(this.dado1.visual);
                this.visual.addChild(this.dado2.visual);
                this.visual.addChild(this.dado3.visual);
                this.visual.addChild(this.dado4.visual);
                break;
        }
        this.n = n;
    }
    
    this.removeAll = function(){
        switch (this.n) {
            case null:
                return;
            case 2:
                this.visual.removeChild(this.dado1.visual);
                this.visual.removeChild(this.dado2.visual);
                break;
            case 3:
                this.visual.removeChild(this.dado1.visual);
                this.visual.removeChild(this.dado2.visual);
                this.visual.removeChild(this.dado3.visual);
                break;
            case 4:
                this.visual.removeChild(this.dado1.visual);
                this.visual.removeChild(this.dado2.visual);
                this.visual.removeChild(this.dado3.visual);
                this.visual.removeChild(this.dado4.visual);
                break;
        }
    }
    
    this.getResult = function(){
        return this.result;
    }
    
    this.sort = function(){
        var i = 0;
        this.result = [];
        while (i < this.n){
            //result.push(Math.ceil(Math.random() * 6));
            this.result.push(this.dados[i].sort());
            this.dados[i].play();
            i++;
        }
        //console.log(this.result);
    }
    
    this.setN(nDados);
    
}


function Dado() {
    this.count = 0;
    this.interval = null;
    
    //this.faces = null;
    //this.face = null;
    //this.visual = null;
    //this.sortedNumber = 0;

    //this.init = function(){
        this.faces = [new createjs.Bitmap(queue.getResult("dice1")),
                new createjs.Bitmap(queue.getResult("dice2")),
                new createjs.Bitmap(queue.getResult("dice3")),
                new createjs.Bitmap(queue.getResult("dice4")),
                new createjs.Bitmap(queue.getResult("dice5")),
                new createjs.Bitmap(queue.getResult("dice6"))];
        this.sortedNumber = Math.ceil(Math.random() * 6);
        this.face = this.faces[this.sortedNumber - 1];
        this.visual = new createjs.MovieClip();
        this.visual.scaleX = this.visual.scaleY = 0.8;
        this.visual.addChild(this.face);
    //}
    
    this.getSorted = function(){
        return this.sortedNumber;
    }
    
    this.sort = function() {
        if (!this.isPLaying) this.sortedNumber = Math.ceil(Math.random() * 6);
        return this.sortedNumber;
        //this.play();
    }
    
    this.isPLaying = false;
    this.play = function() {
        if (this.isPLaying) return;
        var self = this;
        this.count = 1;
        this.isPLaying = true;
        this.interval = setInterval(function(){self.playing();}, 50);
    }

    this.playing = function() {
        this.count += 1;
        if (this.count < 20) {
            this.visual.removeChild(this.face);
            this.face = this.faces[Math.ceil(Math.random() * 6) - 1];
            this.visual.addChild(this.face);
        }else{
            this.visual.removeChild(this.face);
            this.face = this.faces[this.sortedNumber - 1];
            this.visual.addChild(this.face);
            this.stop();
        }
        updateScreen();
    }

    this.stop = function() {
        clearInterval(this.interval);
        this.isPLaying = false;
    }
    
}


