//Timer for when people are on tasks, it clocks you in.
//current projects

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let window_height = window.innerHeight - 185;
let window_width = window.innerWidth;

canvas.width = window_width;
canvas.height = window_height;

let canvas_width = canvas.width;
let canvas_height = canvas.height;
let offset_x;
let offsex_y;

let get_offset = function(){
  let canvas_offsets = canvas.getBoundingClientRect();
  offset_x = canvas_offsets.left;
  offset_y = canvas_offsets.top;
}

get_offset();
window.onscroll = function() {get_offset();}
window.onresize = function() {get_offset();}
canvas.onresize = function() {get_offset();}

let areas = [];
let people = [];
let sites = [];
let peopleSites = [];
let legend = [];
let tasks = [];
let builds = [];
people = loadListFromCookie('people'); 
peopleSites = loadListFromCookie('peopleSites'); 
tasks = loadListFromCookie('tasks'); 
builds = loadListFromCookie('builds'); 
let borderSize = 2;
let boxColor = "#F1ECE9"
let currentPerson = null;
let currentTask = null;
let current_shape_index = null;
let is_dragging = false;
let isDraggingTask = false;
let isResizing = false;
let page = "dc";
let startX;
let startY;


const container = document.getElementById("buildContainer");
const buildNoBox = document.getElementById("buildNo");
const phaseBox = document.getElementById("phase");
const racksBox = document.getElementById("racks");
const traysBox = document.getElementById("trays");
const sloEndBox = document.getElementById("sloEnd");

let is_mouse_in_shape = function(x, y, shape){
  let shape_left = shape.x;
  let shape_right = shape.x + shape.width;
  let shape_top = shape.y;
  let shape_bottom = shape.y + shape.height;

  if (x > shape_left && x < shape_right && y > shape_top && y < shape_bottom){
    return true;
  }
  return false;
}

let mouseDown = function(e) {
  if (e.button === 0) {
    e.preventDefault();
    startX = parseInt(e.clientX - offset_x);
    startY = parseInt(e.clientY - offset_y);

    let index = 0;
    let taskIndex = 0;
    let boxIndex = 0;

    if (page === "dc") {
      for (let task of tasks) {
        if (is_mouse_in_shape(startX, startY, task)) {
          currentTask = taskIndex;
          isDraggingTask = true;
          is_dragging = false;
        }
        taskIndex++;        
      }
      for (let person of people) {
        if (is_mouse_in_shape(startX, startY, person)) {
          currentPerson = index;
          is_dragging = true;
          isDraggingTask = false;
        }
        index++;
      } 
    } else if (page === "sites") {
      for (let person of peopleSites) {
        if (is_mouse_in_shape(startX, startY, person)) {
          currentPerson = index;
          is_dragging = true;
          isDraggingTask = false;
        }
        index++;
      }
    }
  }
}
let mouseUp = function(e){
  e.preventDefault();
  let mX = parseInt(e.clientX - offset_x);
  let mY = parseInt(e.clientY - offset_y);
  if (!is_dragging && !isDraggingTask){
    return;
  }
  for (task of tasks){
    let currentTask = tasks.indexOf(task);
    for (person of people){
      let links = task.linkedPeople
      let currentPerson = links.indexOf(person);
      if (is_dragging && page == "dc" && is_mouse_in_shape(mX, mY, task) && is_mouse_in_shape(mX, mY, person)){
        if (currentPerson != -1){
          links.splice(currentPerson, 1)
        }
        links.push(person)
        if(links.length < 7){
          person.x = task.x + 15 
          person.y = task.y + 40 + ((links.length - 1) * 55)
        } else if (links.length < 13){
          person.x = task.x + 130 
          person.y = task.y + 40 + ((links.length - 7) * 55)
        } else if (links.length < 19){
          person.x = task.x + 245
          person.y = task.y + 40 + ((links.length - 13) * 55)
        } else {
          person.x = task.x + 360
          person.y = task.y + 40 + ((links.length - 19) * 55)
        }
        drawAreas();    
      } else if (is_dragging && page == "dc" && !is_mouse_in_shape(mX, mY, task) && is_mouse_in_shape(mX, mY, person) && currentPerson != -1){
        links.splice(currentPerson, 1)
        for (let i = currentPerson; i < links.length; i++){
          let nextPerson = links[i];
          if (links.indexOf(nextPerson) < 6){
            nextPerson.x = task.x + 15 
            nextPerson.y = task.y + 40 + ((links.indexOf(nextPerson)) * 55)
          } else if (links.indexOf(nextPerson) < 12){
            nextPerson.x = task.x + 130 
            nextPerson.y = task.y + 40 + ((links.length - 7) * 55)
          } else if (links.indexOf(nextPerson) < 16){
            nextPerson.x = task.x + 245 
            nextPerson.y = task.y + 40 + ((links.length - 13) * 55)
          } else {
            nextPerson.x = task.x + 360 
            nextPerson.y = task.y + 40 + ((links.length - 19) * 55)
          }
        }
        drawAreas();
      }
    }
  }
  
  is_dragging = false;
  isDraggingTask = false
}
let mouseOut = function(e){
  e.preventDefault();
  if (!is_dragging && !isDraggingTask){
    return;
  }
  is_dragging = false;
  isDraggingTask = false;
}
let mouseMove = function(e){
  if (!is_dragging && !isDraggingTask){
    return
  }
  let mouseX = parseInt(e.clientX - offset_x);
  let mouseY = parseInt(e.clientY - offset_y);
  
  let dx = mouseX - startX;
  let dy = mouseY - startY;
  if (is_dragging && page == "dc"){
    e.preventDefault();
    
    let current_shape = people[currentPerson];
    
    current_shape.x += dx;
    current_shape.y += dy;
    
    drawAreas();

    startX = mouseX;
    startY = mouseY;
  } else if (is_dragging && page == "sites"){
    e.preventDefault();

    let current_shape = peopleSites[currentPerson];
    
    current_shape.x += dx;
    current_shape.y += dy;

    drawSites();

    startX = mouseX;
    startY = mouseY;
  } else if (isDraggingTask){
    e.preventDefault();

    let current_task = tasks[currentTask];
    
    current_task.x += dx;
    current_task.y += dy;
    drawAreas();

    startX = mouseX;
    startY = mouseY;

    current_task.linkedPeople.forEach((person) => {
      person.x += dx;
      person.y += dy;
    });
  } 
}

canvas.addEventListener('contextmenu', function(event) {
  event.preventDefault(); 
  const mouseX = event.clientX - canvas.getBoundingClientRect().left;
  const mouseY = event.clientY - canvas.getBoundingClientRect().top;

  if (page == "dc"){
    for (let i = people.length - 1; i >= 0; i--) {
      const person = people[i];
      if (
        mouseX >= person.x &&
        mouseX <= person.x + person.width &&
        mouseY >= person.y &&
        mouseY <= person.y + person.height
      ) {
        people.splice(i, 1);
        drawAreas()
        return;
      }
    }
    for (let i = tasks.length - 1; i >= 0; i--) {
      const task = tasks[i];
      if (
        mouseX >= task.x &&
        mouseX <= task.x + task.width &&
        mouseY >= task.y &&
        mouseY <= task.y + task.height
      ) {
        tasks.splice(i, 1);
        drawAreas()
        break;
      }
    }
  } else if (page == "sites"){
    for (let i = peopleSites.length - 1; i >= 0; i--) {
      const person = peopleSites[i];
      if (
        mouseX >= person.x &&
        mouseX <= person.x + person.width &&
        mouseY >= person.y &&
        mouseY <= person.y + person.height
      ) {
        peopleSites.splice(i, 1);
        drawSites()
        break;
      }
    }
  } else if(page == "builds"){
    for (let i = builds.length - 1; i >= 0; i--) {
      let build = builds[i];
      if (
        mouseY >= i * (canvas.height/5 - borderSize) &&
        mouseY <= i * (canvas.height/5 - borderSize) + canvas.height/5 - borderSize*2
      ) {
        builds.splice(i, 1);
        drawBuilds()
        break;
      }
    }
  }
});
canvas.addEventListener('dblclick', function(e) {
  e.preventDefault();
  let mX = e.clientX - canvas.getBoundingClientRect().left;
  let mY = e.clientY - canvas.getBoundingClientRect().top;

  if (page == "dc"){ 
    for (let i = people.length - 1; i >= 0; i--) {
      let person = people[i];
      if (
        mX >= person.x &&
        mX <= person.x + person.width &&
        mY >= person.y &&
        mY <= person.y + person.height
      ) {
        let newName = prompt("Enter a new name for this person:");
        if (newName === null || newName === "") {
          alert("Name required.");
          return;
        }
        person.name = newName;
        ctx.font = 'bold 22px Roboto ';
        let textWidth = ctx.measureText(person.name).width
        person.width = textWidth + 30;
        drawAreas()
        break;
      }
    }
    for (let i = tasks.length - 1; i >= 0; i--) {
      let task = tasks[i];
      if (
        mX >= task.x &&
        mX <= task.x + task.width &&
        mY >= task.y &&
        mY <= task.y + task.height
      ) {
        let newName = prompt("Enter a new name for this task:");
        if (newName === null || newName === "") {
          alert("Name required.");
          return;
        }
        task.name = newName;
        drawAreas()
        break;
      }
    }
  } else if (page == "sites"){
    for (let i = peopleSites.length - 1; i >= 0; i--) {
      let person = peopleSites[i];
      if (
        mX >= person.x &&
        mX <= person.x + person.width &&
        mY >= person.y &&
        mY <= person.y + person.height
      ) {
        let newName = prompt("Enter a new name for this person:");
        if (newName === null || newName === "") {
          alert("Name required.");
          return;
        }
        person.name = newName;
        ctx.font = 'bold 22px Roboto ';
        let textWidth = ctx.measureText(person.name).width
        person.width = textWidth + 30;
        drawSites()
        break;
      }
    }
  }
});

canvas.onmousedown = mouseDown;
canvas.onmouseup = mouseUp;
canvas.onmouseout = mouseOut;
canvas.onmousemove = mouseMove;

//Classes
class Person {
  constructor(x, y, height, color, name){
    this.x = x;
    this.y = y; 
    ctx.font = 'bold 22px Roboto ';
    let textWidth = ctx.measureText(name).width
    this.width = textWidth + 30;
    this.height = height;
    this.color = color;
    this.name = name;
  }
}
class Box {
  constructor(x, y, width, height, color){
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
  }
}
class Task {
  constructor(x, y, width, height, color, name){
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.name = name;
    this.linkedPeople = [];
  }
}
class Build {
  constructor(buildNo, phase, racks, trays, sloEnd){
    this.buildNo = buildNo;
    this.phase = phase;
    this.racks = racks;
    this.trays = trays;
    this.sloEnd = sloEnd;
  }
}

areas.push(new Box(0 + borderSize, 0 + borderSize, canvas.width - borderSize*2, canvas.height/2 - borderSize*2, "blue"));
areas.push(new Box(0 + borderSize, canvas.height/2 + borderSize, canvas.width - borderSize*2, canvas.height/2 - borderSize*15, "red"));

sites.push(new Box(0 + borderSize, 0 + borderSize, canvas.width - borderSize*2, canvas.height/2 - borderSize*2, "green"));
sites.push(new Box(0 + borderSize, canvas.height/2 + borderSize, canvas.width/5 - borderSize*2, canvas.height/2 - borderSize*15, "blue"));
sites.push(new Box(canvas.width/5 + borderSize, canvas.height/2 + borderSize, canvas.width/5 - borderSize*2, canvas.height/2 - borderSize*15, "brown"));
sites.push(new Box(canvas.width*2/5 + borderSize, canvas.height/2 + borderSize, canvas.width/5 - borderSize*2, canvas.height/2 - borderSize*15, "black"));
sites.push(new Box(canvas.width*3/5 + borderSize, canvas.height/2 + borderSize, canvas.width/5 - borderSize*2, canvas.height/2 - borderSize*15, "red"));
sites.push(new Box(canvas.width*4/5 + borderSize, canvas.height/2 + borderSize, canvas.width/5 - borderSize*2, canvas.height/2 - borderSize*15, "purple"));

legend.push(new Box(canvas.width - 63, canvas.height/2 - 154 - borderSize*2, 63 - borderSize*2, 154, "black"))
legend.push(new Box(canvas.width - 61, canvas.height/2 - 152 - borderSize*2, 59 - borderSize*2, 25, "#F1E984"))
legend.push(new Box(canvas.width - 61, canvas.height/2 - 127 - borderSize*2, 59 - borderSize*2, 25, "#8BF184"))
legend.push(new Box(canvas.width - 61, canvas.height/2 - 102 - borderSize*2, 59 - borderSize*2, 25, "#F18484"))
legend.push(new Box(canvas.width - 61, canvas.height/2 - 77 - borderSize*2, 59 - borderSize*2, 25, "#ACACAC"))
legend.push(new Box(canvas.width - 61, canvas.height/2 - 52 - borderSize*2, 59 - borderSize*2, 25, "#E984F1"))
legend.push(new Box(canvas.width - 61, canvas.height/2 - 27 - borderSize*2, 59 - borderSize*2, 25, "#84F1E0"))




//Create a new person (works on either page)
function createPerson(role) {
  
  const name = prompt("Please enter your name:");
  if (name === null || name === "") {
    alert("Name required.");
    return;
  }
  let color;
  switch(role){
    case "spares":
      color = "#F18484";
      break;
    case "builds":
      color = "#8BF184";
      break;
    case "sprint":
      color = "#ACACAC";
      break;
    case "temp":
      color = "#84F1E0";
      break;
    case "manager":
      color = "#F1E984";
      break;
    case "reverse":
      color = "#E984F1";
      break;
  } 
  if (page == "dc"){
    people.push(new Person(canvas.width/2 - name.length/2*22 + 27, 100, 50, color, name));
    drawAreas(); 
  } else if (page == "sites"){
    peopleSites.push(new Person(canvas.width/2 - name.length/2*22 + 27, 100, 50, color, name));
    drawSites();
  }
}

//Create a new task (only works on DC Areas and moves to that page)
function createTask(){
  const taskDescription = window.prompt('Enter task name:');
  if (taskDescription === null || taskDescription === "") {
    alert("Name required.");
    return;
  }
  tasks.push(new Task(canvas.width/2 - 150, borderSize*2, canvas.width/4, canvas.height*7/16, "#D1CFCE", taskDescription));
  drawAreas();
}
function drawTasks(){
  for(let j of tasks){
    drawRoundedBox(j.x, j.y, j.width, j.height, j.color)
    ctx.font = "bold 26px Roboto";
    ctx.fillStyle = "black"
    ctx.fillText(j.name, j.x + j.width/2 - ctx.measureText(j.name).width/2,  j.y + 30)
  }

}

//Draw the legend on both the DC and Sites pages
function drawLegend(){
  for(let i = 0; i < legend.length; i++){
    ctx.fillStyle = legend[i].color;
    ctx.fillRect(legend[i].x, legend[i].y, legend[i].width, legend[i].height);
  }
  ctx.font = "bold 11px Roboto";
  ctx.fillStyle = "black"
  ctx.fillText("Manager", canvas.width - 57, canvas.height/2 - 137 - borderSize*2);
  ctx.fillText("Builds", canvas.width - 57, canvas.height/2 - 112 - borderSize*2);
  ctx.fillText("Spares", canvas.width - 57, canvas.height/2 - 87 - borderSize*2);
  ctx.fillText("Sprint", canvas.width - 57, canvas.height/2 - 62 - borderSize*2);
  ctx.fillText("Reverse", canvas.width - 57, canvas.height/2 - 37 - borderSize*2);
  ctx.fillText("Temp/WH", canvas.width - 57, canvas.height/2 - 12 - borderSize*2);
}

//For drawing line outlines.
function drawRectangle(x, y, width, height, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = borderSize*2;
  ctx.strokeRect(x, y, width, height);

  ctx.beginPath();
  ctx.moveTo(x, y);           
  ctx.lineTo(x + width, y);   
  ctx.lineTo(x + width, y + height); 
  ctx.lineTo(x, y + height);    
  ctx.lineTo(x, y);            

  ctx.stroke(); 
}
//for drawing rounded boxes
function drawRoundedBox(rectX, rectY, rectWidth, rectHeight, color){
  let cornerRadius = 20; 
  let strokeColor = 'black'

  ctx.fillStyle = color;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2

  ctx.beginPath();
  ctx.moveTo(rectX + cornerRadius, rectY);
  ctx.lineTo(rectX + rectWidth - cornerRadius, rectY);
  ctx.arcTo(rectX + rectWidth, rectY, rectX + rectWidth, rectY + cornerRadius, cornerRadius);
  ctx.lineTo(rectX + rectWidth, rectY + rectHeight - cornerRadius);
  ctx.arcTo(rectX + rectWidth, rectY + rectHeight, rectX + rectWidth - cornerRadius, rectY + rectHeight, cornerRadius);
  ctx.lineTo(rectX + cornerRadius, rectY + rectHeight);
  ctx.arcTo(rectX, rectY + rectHeight, rectX, rectY + cornerRadius, cornerRadius);
  ctx.lineTo(rectX, rectY + cornerRadius);
  ctx.arcTo(rectX, rectY, rectX + cornerRadius, rectY, cornerRadius);
  ctx.closePath();

  ctx.fill();
  ctx.stroke();  
}

//The Areas page
function drawPeopleAreas(){
  for (let i of people){
    drawRoundedBox(i.x, i.y, i.width, i.height, i.color);
    ctx.fillStyle = 'black'; 
    ctx.font = 'bold 22px Roboto '; 
    ctx.fillText(i.name, i.x + 15,  i.y + 32)
  }
}
function drawAreas(){
  ctx.clearRect(0, 0, canvas_width, canvas_height)
  container.style.display = "none"
  for (let area of areas){
    drawRectangle(area.x, area.y, area.width, area.height, area.color);
  }
  ctx.fillStyle = 'black'; 
  ctx.font = 'bold 22px Roboto ';
  ctx.fillText("3rd/4th Floor", 17, 35);
  ctx.fillText("1st Floor", 17, 35 + (canvas.height/2));
  drawLegend();
  drawTasks();
  drawPeopleAreas();
  saveCookies();
  page = "dc";
}

//The Sites page
function drawPeopleSites(){
  for (let i of peopleSites){
    drawRoundedBox(i.x, i.y, i.width, i.height, i.color);
    ctx.fillStyle = 'black'; 
    ctx.font = 'bold 22px Roboto '; 
    ctx.fillText(i.name, i.x + 15,  i.y + 32);
  }
}
function drawSites(){
  ctx.clearRect(0, 0, canvas_width, canvas_height);
  container.style.display = "none"
  for (let site of sites){
    drawRectangle(site.x, site.y, site.width, site.height, site.color)
  }
  ctx.fillStyle = 'black'; 
  ctx.font = 'bold 22px Roboto ';
  ctx.fillText("DC", 17, 35);
  ctx.fillText("Out", 17, 35 + (canvas.height/2));
  ctx.fillText("KOT", 17 + (canvas.width/5), 35 + (canvas.height/2));
  ctx.fillText("CBA", 17 + (canvas.width*2/5), 35 + (canvas.height/2));
  ctx.fillText("IZA", 17 + (canvas.width*3/5), 35 + (canvas.height/2));
  ctx.fillText("WH", 17 + (canvas.width*4/5), 35 + (canvas.height/2));
  drawLegend();
  drawPeopleSites();
  saveCookies();
  page = "sites";  
}

//Create a new build
function createBuild(){
  builds.push(new Build(buildNoBox.value, phaseBox.value, racksBox.value, traysBox.value, sloEndBox.value));
  buildNoBox.value = "";
  phaseBox.value = "";
  racksBox.value = "";
  traysBox.value = "";
  sloEndBox.value = "";
  drawBuilds();
}

function checkTimeLeft(){
  for (build of builds){
    let index = builds.indexOf(build)
    let targetDate = new Date(`2023-${build.sloEnd}:00`)
    let now = new Date();
    let diff = targetDate - now;
    let hoursLeft = Math.floor(diff/(1000*60*60))
    let minutesLeft = (Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)) < 10 ? "0" : "") + Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    let secondsLeft = (Math.floor((diff % (1000 * 60)) / 1000) < 10 ? "0" : "") + Math.floor((diff % (1000 * 60)) / 1000);
    ctx.fillStyle = 'black'; 
    ctx.font = 'bold 2.5rem Roboto ';
    ctx.fillText(`${hoursLeft}:${minutesLeft}:${secondsLeft}`, canvas.width*5/7 + 125, canvas.height/7 + (index*canvas.height/5));
  }
}
function drawIndividualBuilds(){
  if (page === "builds"){
    for (build of builds){
      let index = builds.indexOf(build)
      drawRoundedBox(0, index * (canvas.height/5 - borderSize), canvas.width, canvas.height/5 - borderSize*2, "lightyellow");
      ctx.fillStyle = '#878686'; 
      ctx.font = 'bold 2rem Roboto ';
      ctx.fillText("Build No.", 55, 65 + (index*canvas.height/5));
      ctx.fillText("Phase", canvas.width/7 + 125, 65 + (index*canvas.height/5));
      ctx.fillText("Racks", canvas.width*2/7 + 160, 65 + (index*canvas.height/5));
      ctx.fillText("Trays", canvas.width*3/7 + 100, 65 + (index*canvas.height/5));
      ctx.fillText("SLO End", canvas.width*4/7 + 50, 65 + (index*canvas.height/5));
      ctx.fillStyle = '#D60000'; 
      ctx.font = 'bold 2rem Roboto ';
      ctx.fillText("Time Left", canvas.width*5/7 + 125, 65 + (index*canvas.height/5));
  
      ctx.fillStyle = 'black'; 
      ctx.font = 'bold 2.5rem Roboto ';
      ctx.fillText(build.buildNo, 55, canvas.height/7 + (index*canvas.height/5));
      ctx.fillText(build.phase, canvas.width/7 + 125, canvas.height/7 + (index*canvas.height/5));
      ctx.fillText(build.racks, canvas.width*2/7 + 160, canvas.height/7 + (index*canvas.height/5));
      ctx.fillText(build.trays, canvas.width*3/7 + 100, canvas.height/7 + (index*canvas.height/5));
      ctx.fillText(build.sloEnd, canvas.width*4/7 + 50, canvas.height/7 + (index*canvas.height/5));
      checkTimeLeft();
    }
  }
}
//Call the CheckTimeLeft, and redraw builds
setInterval(drawIndividualBuilds, 1000)

//The Current Projects page
function drawBuilds(){
  ctx.clearRect(0, 0, canvas_width, canvas_height);
  container.style.display = "flex"
  drawIndividualBuilds();
  saveCookies();
  page = "builds";
};


//Save cookies
function saveListAsCookie(name, items, daysToExpire) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + daysToExpire);
    document.cookie = `${name}=${JSON.stringify(items)}; expires=${expirationDate.toUTCString()}; path=/`;
}
function loadListFromCookie(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [key, value] = cookie.split('=');
        if (key.trim() === name) {
            return JSON.parse(value);
        }
    }
    return [];
}
function saveCookies(){
  saveListAsCookie('people', people, 30);
  saveListAsCookie('peopleSites', peopleSites, 30);
  saveListAsCookie('tasks', tasks, 30);
  saveListAsCookie('builds', builds, 30);
}

//Clock function
setInterval(()=>{
  let clock = document.querySelector(".clock")
  let now = new Date();
  let day = null;
  switch(now.getDay()){
    case 0:
      day = "日";
      break;
    case 1:
      day = "月";
      break;
    case 2:
      day = "火";
      break;
    case 3:
      day = "水";
      break;
    case 4:
      day = "木";
      break;
    case 5:
      day = "金";
      break;
    case 6:
      day = "土";
      break;
  }
  let minutes = ((now.getMinutes() < 10) ? "0" : "") + now.getMinutes();
  let seconds = ((now.getSeconds() < 10) ? "0" : "") + now.getSeconds();
  if(clock){
    clock.innerHTML = `${now.getFullYear()}/${now.getMonth()+1}/${now.getDate()} ${day} ${now.getHours()}:${minutes}:${seconds}`
  }
}, 1000)

//Weather function
async function checkWeather(){
  try{
  const apiKey = "64e2b6bcc1351b82c4dc521ae8bf52bb";
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?units=metric&q=inzai`;
  const response = await fetch(apiUrl + `&appid=${apiKey}`);
  const weatherIcon = document.querySelector(".weather-icon");
  let data = await response.json();
  let temp = Number(data.main.temp.toFixed(1));
  document.querySelector(".temperature").innerHTML = temp + "°c";
  if(data.weather[0].main == "Clouds"){
    weatherIcon.src = "clouds.png";  
  } else if(data.weather[0].main == "Clear"){
    weatherIcon.src = "clear.png";  
  } else if(data.weather[0].main == "Rain"){
    weatherIcon.src = "rain.png";  
  } else if(data.weather[0].main == "Drizzle"){
    weatherIcon.src = "drizzle.png";  
  } else if(data.weather[0].main == "Mist"){
    weatherIcon.src = "mist.png";  
  } else if(data.weather[0].main == "Snow"){
    weatherIcon.src = "snow.png";  
  }
  } catch {
    console.log("Couldn't connect to server")
  }
}
setInterval(checkWeather, 30*1000)

/*
//test piececes
builds.push(new Build("12345-67812", "Tray-Pop", "0", "115", "10/21 10:32"))
tasks.push(new Task(canvas.width/2 - 150, borderSize*2, canvas.width/4, canvas.height*7/16, "#D1CFCE" , "Tray-Pop"))
people.push(new Person(canvas.width/2 - name.length/2*22 + 27, 100, 50, "lightblue", "Michael"))
people.push(new Person(canvas.width/2 - name.length/2*22 + 27, 200, 50, "red", "順子"))*/

//Initialize
drawAreas();


/* 
Code to make everyone edit the same page

const socket = new WebSocket("ws://your-server-url");

// (in function) socket.send(JSON.stringify({ x, y }));

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Draw on the canvas based on data received from other users
  // ctx.lineTo(data.x, data.y);
  // ctx.stroke();
};

*/