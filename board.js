const board=document.getElementById("board");
const boardId=localStorage.getItem("currentBoard");

let cards=[];
let topZ=1;

/* ZOOM */

let zoomLevel=1;

/* HISTORY */

let historyStack=[];
let redoStack=[];

function saveState(){

const snapshot=JSON.stringify(cards);

if(historyStack.length>0){

if(historyStack[historyStack.length-1]===snapshot){
return;
}

}

historyStack.push(snapshot);

if(historyStack.length>50){
historyStack.shift();
}

redoStack=[];

}

/* ADD TEXT CARD */

function addTextCard(){

saveState();

const cardData={

id:Date.now(),
type:"text",

title:"Title",
body:"Write here...",

color:"#ffff88",

x:100,
y:100,

width:220,
height:150

};

cards.push(cardData);

saveCards();

createCardElement(cardData);

}

/* ADD TODO CARD */

function addTodoCard(){

saveState();

const cardData={

id:Date.now(),
type:"todo",

title:"Title",

items:["Task no"],

color:"#ffff88",

x:100,
y:100,

width:220,
height:180

};

cards.push(cardData);

saveCards();

createCardElement(cardData);

}

/* ADD TEXT CARD AT POSITION */

function addTextCardAt(x,y){

saveState();

const cardData={

id:Date.now(),
type:"text",

title:"Title",
body:"Write here...",

color:"#ffff88",

x:Math.max(10,x),
y:Math.max(10,y),

width:220,
height:150

};

cards.push(cardData);

saveCards();

const newCard=createCardElement(cardData);

setTimeout(function(){

const title=newCard.querySelector(".title");

if(title){

title.focus();
selectAllText(title);

}

},50);

}

/* CREATE CARD */

function createCardElement(cardData){

const card=document.createElement("div");

card.className="card";
card.dataset.id=cardData.id;

card.style.left=cardData.x+"px";
card.style.top=cardData.y+"px";

card.style.width=(cardData.width||220)+"px";
card.style.height=(cardData.height||150)+"px";

card.style.background=cardData.color||"#ffff88";

/* TEXT CARD */

if(cardData.type==="text"){

card.innerHTML=`

<div class="drag">☰</div>
<div class="delete">✖</div>
<div class="duplicate">⧉</div>

<div class="cardColor">
<input type="color" class="colorPicker">
</div>

<div class="resize"></div>

<div class="title" contenteditable="true">
${cardData.title}
</div>

<div class="body" contenteditable="true">
${cardData.body}
</div>

`;

}

/* TODO CARD */

if(cardData.type==="todo"){

card.innerHTML=`

<div class="drag">☰</div>
<div class="delete">✖</div>
<div class="duplicate">⧉</div>

<div class="cardColor">
<input type="color" class="colorPicker">
</div>

<div class="resize"></div>

<div class="title" contenteditable="true">
${cardData.title}
</div>

<ul class="todoList">

${cardData.items.map(i=>`<li contenteditable="true">${i}</li>`).join("")}

</ul>

<button class="addItem">+ Item</button>

`;

}

board.appendChild(card);

/* Z INDEX */

topZ++;
card.style.zIndex=topZ;

card.addEventListener("mousedown",function(){

topZ++;
card.style.zIndex=topZ;

});

/* DELETE */

card.querySelector(".delete").onclick=function(e){

e.stopPropagation();

saveState();

card.remove();

cards=cards.filter(
c=>c.id!==cardData.id
);

saveCards();

};

/* DUPLICATE */

card.querySelector(".duplicate").onclick=function(e){

e.stopPropagation();

saveState();

const copy=JSON.parse(
JSON.stringify(cardData)
);

copy.id=Date.now();

copy.x+=30;
copy.y+=30;

cards.push(copy);

saveCards();

createCardElement(copy);

};

/* COLOR */

const picker=card.querySelector(".colorPicker");

picker.value=cardData.color||"#ffff88";

picker.onclick=e=>e.stopPropagation();

picker.oninput=function(e){

e.stopPropagation();

saveState();

cardData.color=picker.value;

card.style.background=cardData.color;

saveCards();

};

/* TITLE AUTO SELECT */

const titleDiv=card.querySelector(".title");

if(titleDiv){

titleDiv.onclick=function(){

if(titleDiv.innerText==="Title"){
selectAllText(titleDiv);
}

};

titleDiv.onfocus=function(){

if(titleDiv.innerText==="Title"){
selectAllText(titleDiv);
}

};

}

/* BODY AUTO SELECT */

const bodyDiv=card.querySelector(".body");

if(bodyDiv){

bodyDiv.onclick=function(){

if(bodyDiv.innerText==="Write here..."){
selectAllText(bodyDiv);
}

};

bodyDiv.onfocus=function(){

if(bodyDiv.innerText==="Write here..."){
selectAllText(bodyDiv);
}

};

}

/* TODO */

if(cardData.type==="todo"){

const list=card.querySelector(".todoList");
const addBtn=card.querySelector(".addItem");

function setupTodoPlaceholder(li){

li.onclick=function(){

if(li.innerText==="Task no"){
selectAllText(li);
}

};

li.onfocus=function(){

if(li.innerText==="Task no"){
selectAllText(li);
}

};

}

list.querySelectorAll("li").forEach(setupTodoPlaceholder);

addBtn.onclick=function(e){

e.stopPropagation();

saveState();

const li=document.createElement("li");

li.contentEditable=true;

li.innerText="Task no";

setupTodoPlaceholder(li);

list.appendChild(li);

updateTodo(cardData,list);

};

list.oninput=function(){

saveState();

updateTodo(cardData,list);

};

}

/* DRAG */

makeDraggable(card,cardData);

/* RESIZE */

makeResizable(card,cardData);

return card;

}

/* DRAG */

function makeDraggable(card,cardData){

const drag=card.querySelector(".drag");

let dragging=false;

let offsetX=0;
let offsetY=0;

drag.onmousedown=function(e){

e.stopPropagation();

saveState();

dragging=true;

offsetX=e.clientX-card.offsetLeft;
offsetY=e.clientY-card.offsetTop;

};

document.addEventListener("mousemove",function(e){

if(!dragging)return;

card.style.left=(e.clientX-offsetX)+"px";
card.style.top=(e.clientY-offsetY)+"px";

cardData.x=card.offsetLeft;
cardData.y=card.offsetTop;

});

document.addEventListener("mouseup",function(){

if(dragging) saveCards();

dragging=false;

});

}

/* RESIZE */

function makeResizable(card,cardData){

const resize=card.querySelector(".resize");

let resizing=false;

let startX,startY,startW,startH;

resize.onmousedown=function(e){

e.stopPropagation();

saveState();

resizing=true;

startX=e.clientX;
startY=e.clientY;

startW=card.offsetWidth;
startH=card.offsetHeight;

};

document.addEventListener("mousemove",function(e){

if(!resizing)return;

const w=startW+(e.clientX-startX);
const h=startH+(e.clientY-startY);

card.style.width=w+"px";
card.style.height=h+"px";

cardData.width=w;
cardData.height=h;

});

document.addEventListener("mouseup",function(){

if(resizing) saveCards();

resizing=false;

});

}

/* SAVE */

function saveCards(){

localStorage.setItem(
"cards_"+boardId,
JSON.stringify(cards)
);

}

/* LOAD */

function loadCards(){

const saved=localStorage.getItem(
"cards_"+boardId
);

if(!saved)return;

cards=JSON.parse(saved);

cards.forEach(createCardElement);

}

/* TODO SAVE */

function updateTodo(cardData,list){

cardData.items=[];

list.querySelectorAll("li").forEach(li=>{
cardData.items.push(li.innerText);
});

saveCards();

}

/* BOARD SIZE */

function resizeBoard(){

const w=document.getElementById("boardWidth").value;
const h=document.getElementById("boardHeight").value;

board.style.width=w+"px";
board.style.height=h+"px";

localStorage.setItem(
"boardSize_"+boardId,
JSON.stringify({w,h})
);

}

/* ZOOM */

function zoomIn(){

zoomLevel+=0.1;

if(zoomLevel>3) zoomLevel=3;

board.style.transform="scale("+zoomLevel+")";
board.style.transformOrigin="top left";

}

function zoomOut(){

zoomLevel-=0.1;

if(zoomLevel<0.3) zoomLevel=0.3;

board.style.transform="scale("+zoomLevel+")";
board.style.transformOrigin="top left";

}

/* UNDO REDO */

document.addEventListener("keydown",function(e){

if(e.ctrlKey && e.key==="z"){

if(historyStack.length===0)return;

redoStack.push(JSON.stringify(cards));

cards=JSON.parse(historyStack.pop());

reloadBoard();

}

if(e.ctrlKey && e.key==="y"){

if(redoStack.length===0)return;

historyStack.push(JSON.stringify(cards));

cards=JSON.parse(redoStack.pop());

reloadBoard();

}

});

function reloadBoard(){

board.innerHTML="";

cards.forEach(createCardElement);

saveCards();

}

/* SELECT TEXT */

function selectAllText(element){

const range=document.createRange();
range.selectNodeContents(element);

const selection=window.getSelection();

selection.removeAllRanges();
selection.addRange(range);

}

/* DOUBLE CLICK ADD */

window.addEventListener("load",function(){

board.addEventListener("dblclick",function(e){

if(e.target.closest(".card")) return;

const rect=board.getBoundingClientRect();

const x=e.clientX-rect.left;
const y=e.clientY-rect.top;

addTextCardAt(x,y);

});

});

/* START */

loadCards();

/* LOAD SIZE */

const savedSize=localStorage.getItem(
"boardSize_"+boardId
);

if(savedSize){

const size=JSON.parse(savedSize);

board.style.width=size.w+"px";
board.style.height=size.h+"px";

document.getElementById("boardWidth").value=size.w;
document.getElementById("boardHeight").value=size.h;

}

/* STRING CONNECTIONS */
let connections=[];
let activeConnection=null;
let connectionPreview=null;

function connectionsKey(){ return "connections_"+boardId; }
function saveConnections(){ localStorage.setItem(connectionsKey(),JSON.stringify(connections)); }
function loadConnections(){
const saved=localStorage.getItem(connectionsKey());
connections=saved?JSON.parse(saved):[];
}

function ensureConnectionLayer(){
let layer=document.getElementById("connectionLayer");
if(layer)return layer;
board.style.position="relative";
layer=document.createElementNS("http://www.w3.org/2000/svg","svg");
layer.id="connectionLayer";
layer.setAttribute("aria-hidden","true");
layer.style.cssText="position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none;z-index:1";
const defs=document.createElementNS("http://www.w3.org/2000/svg","defs");
const marker=document.createElementNS("http://www.w3.org/2000/svg","marker");
marker.setAttribute("id","stringArrow"); marker.setAttribute("viewBox","0 0 10 10");
marker.setAttribute("refX","8"); marker.setAttribute("refY","5");
marker.setAttribute("markerWidth","6"); marker.setAttribute("markerHeight","6"); marker.setAttribute("orient","auto");
const arrow=document.createElementNS("http://www.w3.org/2000/svg","path");
arrow.setAttribute("d","M 0 0 L 10 5 L 0 10 z"); arrow.setAttribute("fill","#735b43");
marker.appendChild(arrow); defs.appendChild(marker); layer.appendChild(defs); board.prepend(layer);
return layer;
}

function cardPoint(card,side){
const points={
left:{x:card.offsetLeft,y:card.offsetTop+card.offsetHeight/2},
right:{x:card.offsetLeft+card.offsetWidth,y:card.offsetTop+card.offsetHeight/2},
top:{x:card.offsetLeft+card.offsetWidth/2,y:card.offsetTop},
bottom:{x:card.offsetLeft+card.offsetWidth/2,y:card.offsetTop+card.offsetHeight}
};
return points[side]||points.right;
}

function sideVector(side){
return {left:{x:-1,y:0},right:{x:1,y:0},top:{x:0,y:-1},bottom:{x:0,y:1}}[side]||{x:1,y:0};
}

function stringPath(from,to,fromSide,toSide){
const curve=Math.max(55,Math.min(150,Math.hypot(to.x-from.x,to.y-from.y)/2));
const startDirection=sideVector(fromSide);
const endDirection=sideVector(toSide);
return "M "+from.x+" "+from.y+
" C "+(from.x+startDirection.x*curve)+" "+(from.y+startDirection.y*curve)+
", "+(to.x-endDirection.x*curve)+" "+(to.y-endDirection.y*curve)+
", "+to.x+" "+to.y;
}

function addStringPath(layer,from,to,fromSide,toSide,isPreview){
const path=document.createElementNS("http://www.w3.org/2000/svg","path");
path.setAttribute("d",stringPath(from,to,fromSide,toSide));
path.setAttribute("fill","none"); path.setAttribute("stroke",isPreview?"#b99b77":"#735b43");
path.setAttribute("stroke-width",isPreview?"2":"3"); path.setAttribute("stroke-linecap","round");
path.setAttribute("stroke-dasharray",isPreview?"5 5":"1 6");
if(!isPreview)path.setAttribute("marker-end","url(#stringArrow)");
layer.appendChild(path); return path;
}

function renderConnections(){
const layer=ensureConnectionLayer();
[...layer.querySelectorAll(".connectionString")].forEach(path=>path.remove());
connections=connections.filter(connection=>document.querySelector('.card[data-id="'+connection.from+'"]')&&document.querySelector('.card[data-id="'+connection.to+'"]'));
connections.forEach(connection=>{
const from=document.querySelector('.card[data-id="'+connection.from+'"]');
const to=document.querySelector('.card[data-id="'+connection.to+'"]');
const fromSide=connection.fromSide||"right";
const toSide=connection.toSide||"left";
const path=addStringPath(layer,cardPoint(from,fromSide),cardPoint(to,toSide),fromSide,toSide,false);
path.classList.add("connectionString");
});
}

function nearestSide(card,event){
const rect=card.getBoundingClientRect();
const distances={left:Math.abs(event.clientX-rect.left),right:Math.abs(event.clientX-rect.right),top:Math.abs(event.clientY-rect.top),bottom:Math.abs(event.clientY-rect.bottom)};
return Object.keys(distances).reduce((closest,side)=>distances[side]<distances[closest]?side:closest,"left");
}

function decorateCardForConnections(card,cardData){
if(card.querySelector(".connectionHandle"))return;
const positions={left:"left:-10px;top:50%;transform:translateY(-50%)",right:"right:-10px;top:50%;transform:translateY(-50%)",top:"top:-10px;left:50%;transform:translateX(-50%)",bottom:"bottom:-10px;left:50%;transform:translateX(-50%)"};
Object.entries(positions).forEach(([side,position])=>{
const handle=document.createElement("button");
handle.type="button"; handle.className="connectionHandle"; handle.dataset.side=side;
handle.title="Drag from this edge to connect cards"; handle.setAttribute("aria-label","Connect from "+side+" edge");
handle.textContent="●";
handle.style.cssText="position:absolute;"+position+";width:18px;height:18px;border:2px solid #735b43;border-radius:50%;background:#f8ead2;color:#735b43;line-height:10px;padding:0;cursor:crosshair;z-index:5";
card.appendChild(handle);
handle.addEventListener("mousedown",function(event){
event.preventDefault(); event.stopPropagation();
activeConnection={from:String(cardData.id),fromSide:side,start:cardPoint(card,side)};
const layer=ensureConnectionLayer();
connectionPreview=addStringPath(layer,activeConnection.start,activeConnection.start,side,side,true);
connectionPreview.classList.add("connectionPreview");
});
});
card.querySelector(".delete").addEventListener("click",function(){
connections=connections.filter(connection=>String(connection.from)!==String(cardData.id)&&String(connection.to)!==String(cardData.id));
saveConnections(); renderConnections();
});
}

const originalCreateCardElement=createCardElement;
createCardElement=function(cardData){ const card=originalCreateCardElement(cardData); decorateCardForConnections(card,cardData); return card; };
loadConnections();
document.querySelectorAll(".card").forEach(card=>{
const cardData=cards.find(item=>String(item.id)===String(card.dataset.id));
if(cardData)decorateCardForConnections(card,cardData);
});
renderConnections();

document.addEventListener("mousemove",function(event){
if(activeConnection&&connectionPreview){
const rect=board.getBoundingClientRect();
const point={x:(event.clientX-rect.left)/zoomLevel,y:(event.clientY-rect.top)/zoomLevel};
connectionPreview.setAttribute("d",stringPath(activeConnection.start,point,activeConnection.fromSide,activeConnection.fromSide));
}
if(event.buttons)renderConnections();
});

document.addEventListener("mouseup",function(event){
if(!activeConnection)return;
const target=event.target.closest(".card");
if(target&&String(target.dataset.id)!==activeConnection.from){
const toSide=nearestSide(target,event);
const exists=connections.some(connection=>String(connection.from)===activeConnection.from&&String(connection.to)===String(target.dataset.id)&&connection.fromSide===activeConnection.fromSide&&(connection.toSide||"left")===toSide);
if(!exists){
connections.push({id:Date.now(),from:activeConnection.from,to:String(target.dataset.id),fromSide:activeConnection.fromSide,toSide});
saveConnections();
}
}
if(connectionPreview)connectionPreview.remove();
connectionPreview=null; activeConnection=null; renderConnections();
});
