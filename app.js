function resetGlobalUI(){
  document.getElementById("see-all-btn").style.display = "none";
  document.getElementById("planner-title").style.display = "none";
  document.getElementById("ar-world").classList.remove("market-mode","people-mode","map-open");
}

let calmMode = false;

let meetingPoint = null;

let crowdActive = true;

let friendsVisible = false;

function clearAROverlays(){
  document.getElementById("ar-overlay").innerHTML = "";
  const navLayer = document.getElementById("nav-layer");
  if(navLayer) navLayer.remove();
}

let uiMode = "home";
let saved = false;
let historyStack = [];

const screen = document.getElementById("screen-container");
const primaryBtn = document.getElementById("primary-btn");

function homeScreen(){
setHeaderMode("home");
  screen.innerHTML = "";
  hideStartVisit();
  primaryBtn.innerText = "Begin Visit";
  primaryBtn.style.display = "inline-block";

  document.getElementById("ar-world").classList.remove("market-mode");
  document.getElementById("see-all-btn").style.display="none";
  document.getElementById("planner-title").style.display="none";
}

function menuScreen(){
setHeaderMode("home");
  hideStartVisit();
  document.getElementById("ar-world").classList.remove("market-mode");
  document.getElementById("see-all-btn").style.display="none";
  document.getElementById("planner-title").style.display="none";

  screen.innerHTML = `
    <div class="menu">
      <button class="sys-btn" onclick="goTo(plannerScreen)">📋 Market Planner</button>
      <button class="sys-btn" onclick="goTo(fullMapScreen)">📍 AR Navigation</button>
      <button class="sys-btn" onclick="goTo(peopleScreen)">👥 Find Your People</button>
    </div>
  `;
  primaryBtn.style.display = "none";
}

function plannerScreen(){
setHeaderMode("planner");

hideStartVisit();

  document.getElementById("ar-world").classList.add("market-mode");
  document.getElementById("see-all-btn").style.display="block";
  document.getElementById("planner-title").style.display="block";
  primaryBtn.style.display="none";

  screen.innerHTML=`
    <div id="stall-layer">
      <div class="stall-card" style="left:18%;top:34%;">
        <h3>Glühwein Stall</h3>
        <p>⏱ 25 min wait</p>
        <p>🍷 Mulled Wine, Hot Chocolate</p>
        <button class="add-btn" onclick="toggleARStall('Glühwein Stall')">Add</button>

      </div>

      <div class="stall-card" style="left:42%;top:30%;">
        <h3>Sausage Grill</h3>
        <p>⏱ 35 min wait</p>
        <p>🌭 Bratwurst, Veggie Roll</p>
        <button class="add-btn" onclick="toggleARStall('Sausage Grill')">Add</button>

      </div>

      <div class="stall-card" style="left:66%;top:34%;">
        <h3>Churros Hut</h3>
        <p>⏱ 10 min wait</p>
        <p>🍩 Churros, Waffles</p>
        <button class="add-btn" onclick="toggleARStall('Churros Hut')">Add</button>

      </div>
    </div>
  `;
setTimeout(updateARButtons, 50);
}
  
function arScreen(){
setHeaderMode("ar");

hideStartVisit();

  screen.innerHTML = "<h2 style='color:white'>AR Navigation Screen</h2>";
}

function peopleScreen(){
  document.getElementById("screen-container").style.zIndex = "10";

  setHeaderMode("people");
  hideStartVisit();
  clearAROverlays();

  document.getElementById("ar-world").classList.add("people-mode");  // 🔥 THIS FIXES CLICKS

  screen.innerHTML = `
  <div id="people-layer">

    <div id="radar-wrapper">
      <div id="radar">
        <div class="radar-ring ring1"></div>
        <div class="radar-ring ring2"></div>
        <div class="radar-ring ring3"></div>
        <div id="radar-sweep"></div>
        <div id="calm-fog" style="display:none;"></div>
        <div id="radar-user"></div>
      </div>
    </div>

    <div id="people-actions">
  <button class="sys-btn small" id="btn-locate">Locate My People</button>
  <button class="sys-btn small" id="btn-calm">Calm Places</button>
</div>

  </div>`;

    document.getElementById("btn-calm").onclick   = updateCalmPlaces;
  document.getElementById("btn-locate").onclick = locatePeople;

  // 🔥 RE-DRAW FRIENDS IF ALREADY LOCATED
  if(window.friendsVisible){
    locatePeople();
  }

  // ⭐ RE-DRAW MEETING POINT IF EXISTS
  if(window.meetingPoint){
    const radar = document.getElementById("radar");
    radar.insertAdjacentHTML("beforeend",`
      <div class="meeting-star"
           style="left:${meetingPoint.x}%; top:${meetingPoint.y}%;">⭐</div>
    `);
  }
  // 🔁 restore friends if already located
if(friendsVisible){
  renderFriends();
}

}



function goTo(screenFn, resetStack=false){

  document.getElementById("ar-overlay").classList.remove("map-active","people-active");
document.getElementById("ar-world").classList.remove("map-open","people-mode");

  resetGlobalUI();        // ← this is the fix
  clearAROverlays();
  hideStartVisit();

  if(resetStack){
    historyStack = [];
  }

  if(typeof screenFn !== "function") return;

  historyStack.push(screenFn);
  screenFn();
}




document.getElementById("back-btn").onclick = () => {

  clearAROverlays();
  hideStartVisit();

  if(historyStack.length <= 1){
    goTo(menuScreen, true);
    return;
  }

  historyStack.pop();            // remove current
  const prev = historyStack.pop();
  goTo(prev);
};



primaryBtn.addEventListener("click", () => goTo(menuScreen));
goTo(homeScreen, true);
setTimeout(bindSideNav, 80);



document.getElementById("see-all-btn").onclick = () => goTo(plannerPage);

const stalls = [
  {name:"Glühwein Stall", wait:"25 min", food:"Mulled Wine, Hot Chocolate", dist:"120m"},
  {name:"Sausage Grill", wait:"35 min", food:"Bratwurst, Veggie Roll", dist:"150m"},
  {name:"Churros Hut", wait:"10 min", food:"Churros, Waffles", dist:"90m"},
  {name:"Roasted Almonds", wait:"5 min", food:"Caramelized Almonds", dist:"60m"},
  {name:"Crepe Corner", wait:"20 min", food:"Nutella Crepes", dist:"130m"},
  {name:"Potato Pancakes", wait:"30 min", food:"Reibekuchen, Apple Sauce", dist:"180m"},
  {name:"Hot Chestnuts", wait:"12 min", food:"Roasted Chestnuts", dist:"70m"},
  {name:"Craft Beer Stand", wait:"15 min", food:"Local Beer", dist:"110m"},
  {name:"Candy Floss Booth", wait:"8 min", food:"Cotton Candy", dist:"55m"},
  {name:"Grilled Corn", wait:"18 min", food:"Butter Corn", dist:"95m"}
];

let itinerary=[];

function isInItinerary(name){
  return itinerary.some(s => s.name === name);
}

function toggleStall(stall){
  const index = itinerary.findIndex(s => s.name === stall.name);
  if(index === -1){
    itinerary.push(stall);
  }else{
    itinerary.splice(index,1);
  }
}

function toggleARStall(name){
  const stall = stalls.find(s => s.name === name);
  if(!stall) return;

  toggleStall(stall);
  updateARButtons();
}


function plannerPage(){
setHeaderMode("planner");

  document.getElementById("see-all-btn").style.display="none";

  screen.innerHTML=`
  <div id="planner-page">

    <!-- LEFT BOARD -->
    <div id="stall-list-wrapper">
      <div id="stall-list">
        ${stalls.map((s,i)=>`
          <div class="stall-row" onmouseover="showInfo(${i})">
            <span class="stall-name">${s.name}</span>
            <span class="row-add" onclick="addDirect(${i})">➕</span>
          </div>
        `).join("")}
      </div>

      <div id="bulk-actions">
        <button class="sys-btn small" onclick="addAllStalls()">Add All</button>
        <button class="sys-btn small" onclick="removeAll()">Remove All</button>
      </div>
    </div>

    <!-- MIDDLE BOARD -->
    <div id="stall-info">
      <h3 id="info-name">Hover a stall</h3>
      <p id="info-wait"></p>
      <p id="info-food"></p>
      <p id="info-dist"></p>
    </div>

    <div id="itinerary-board">
  <div id="route-time" style="display:none; margin-bottom:8px; font-size:0.9rem; opacity:.9;"></div>

  <div id="itin-items"></div>

  <div style="display:flex; gap:10px; justify-content:center;">
    <button id="save-itin" onclick="saveItinerary()">Save</button>
    <button id="edit-itin" style="display:none;" onclick="editItinerary()">Edit</button>
  </div>
</div>

  </div>`;
renderItinerary();
}

let currentStall=null;

function showInfo(i){
  const s = stalls[i];
  currentStall = s;
  document.getElementById("info-name").innerText = s.name;
  document.getElementById("info-wait").innerText = "⏱ " + s.wait;
  document.getElementById("info-food").innerText = "🍴 " + s.food;
  document.getElementById("info-dist").innerText = "📍 " + s.dist + " away";
}

function addToItinerary(){
  if(!currentStall) return;
  itinerary.push(currentStall);
  renderItinerary();
}

function renderItinerary(){
  document.getElementById("itin-items").innerHTML =
    itinerary.map((s,i)=>`
      <div class="itin-item">
        <span class="drag-handle">≡</span>

        ${i+1}. ${s.name} — ⏱ ${s.wait} · 📍 ${s.dist}

        ${saved ? "" : `<span class="minus-btn" onclick="removeItem(${i})">➖</span>`}
      </div>
    `).join("");
}


let editMode=false;

function toggleEdit(){
  editMode=!editMode;
  renderItinerary();
}

function saveItinerary(){
  saved = true;

  document.getElementById("save-itin").style.display="none";
  document.getElementById("edit-itin").style.display="inline-block";

  const startBtn = document.getElementById("start-visit-btn");
  startBtn.style.display="inline-block";
  startBtn.onclick = () => goTo(startVisitScreen);

  let total = itinerary.reduce((s,x)=>s+parseInt(x.dist),0);
  const rt = document.getElementById("route-time");
  rt.style.display="block";
  rt.innerText="Estimated total time: "+total+" m";

  renderItinerary();
}


function removeItem(index){
  if(saved) return;
  itinerary.splice(index,1);
  renderItinerary();
  updateARButtons();
}



let draggedIndex = null;

function dragStart(index){
  draggedIndex = index;
}

function dragOver(e){
  e.preventDefault();
}

function dropItem(targetIndex){
  if(draggedIndex === null || draggedIndex === targetIndex) return;

  const item = itinerary.splice(draggedIndex,1)[0];
  itinerary.splice(targetIndex,0,item);
  draggedIndex = null;
  renderItinerary();
}

function addDirect(i){
  toggleStall(stalls[i]);
  renderItinerary();
  updateARButtons();
}


function addAllStalls(){
  stalls.forEach(s=>{
    if(!isInItinerary(s.name)) itinerary.push(s);
  });
  renderItinerary();
  updateARButtons();
}

function removeAll(){
  itinerary=[];
  renderItinerary();
  updateARButtons();
}

function updateARButtons(){
  const cards = document.querySelectorAll(".stall-card");
if(!cards.length) return;

cards.forEach(card=>{

    const name = card.querySelector("h3").innerText;
    const btn  = card.querySelector(".add-btn");

    if(isInItinerary(name)){
      btn.innerText = "Remove";
    }else{
      btn.innerText = "Add";
    }
  });
}


function editItinerary(){
  saved = false;
  document.getElementById("edit-itin").style.display = "none";
  document.getElementById("save-itin").style.display = "inline-block";
  document.getElementById("route-time").style.display = "none";
  hideStartVisit();
  renderItinerary();
}

function hideStartVisit(){
  const btn = document.getElementById("start-visit-btn");
  if(btn){
    btn.style.display="none";
    btn.onclick=null;
  }

  document.getElementById("ar-overlay").innerHTML = "";
  document.getElementById("visit-actions").style.display = "none";
}

function clearAROverlay(){
  const overlay = document.getElementById("ar-overlay");
  if(overlay) overlay.innerHTML = "";
}

function startVisitScreen(){
  crowdActive = true;
  hideStartVisit();
  setHeaderMode("ar");

  const userX = 70;
  const userY = 70;

  const points = itinerary.map((s,i)=>{
  const d = parseInt(s.dist);
  return {
    x: userX + Math.cos(i*1.2) * (d/3),
    y: userY + Math.sin(i*1.2) * (d/3)
  };
});

renderMiniMap(points);


  screen.innerHTML = `
    <div id="visit-layer">
      ${itinerary.map((s,i)=>`
        <div class="visit-stall" style="left:${18+i*22}%; top:38%;">
          <div class="visit-badge">${i+1}</div>
          <div class="visit-label">${s.food}</div>
        </div>
      `).join("")}
    </div>
  `;

  document.getElementById("visit-actions").innerHTML = `
    <button class="sys-btn small" id="nav-start-btn">Start Navigation</button>
    <button class="sys-btn small" onclick="goTo(plannerPage)">Update</button>
  `;
  document.getElementById("visit-actions").style.display = "flex";
  document.getElementById("nav-start-btn").onclick = startNavigation;

  document.getElementById("ar-overlay").innerHTML = `
    <div id="mini-map">
      <div class="map-user"></div>
      ${crowdActive ? `<div class="map-crowd" style="left:82px; top:40px;"></div>` : ``}

      ${points.map(p=>{
  const jitterX = crowdActive ? 0 : (Math.random()*14-7);
  const jitterY = crowdActive ? 0 : (Math.random()*14-7);
  return `<div class="map-stall" style="left:${p.x + jitterX}px; top:${p.y + jitterY}px;"></div>`;
}).join("")}

    </div>
  `;
}

function startNavigation(){
  document.getElementById("visit-actions").style.display = "none";

  clearAROverlay();
  setHeaderMode("ar");

  const current = itinerary[0];
  const points = itinerary.map((s,i)=>{
  const d = parseInt(s.dist);
  return {
    x: 70 + Math.cos(i*1.2) * (d/3),
    y: 70 + Math.sin(i*1.2) * (d/3)
  };
});

renderMiniMap(points);

  screen.innerHTML = `
    <div id="nav-layer">

      <!-- AR Arrows Path -->
      ${Array.from({length:7}).map((_,i)=>{
  const scale = 1.4 - i*0.15;      // nearest biggest
  const y = 62 - i*5;             // perspective ground slope
  const x = 50 + i*0.8;           // slight curve
  return `
    <div class="nav-arrow"
      style="
        left:${x}%;
        top:${y}%;
        transform:rotate(-45deg) scale(${scale});
        opacity:${1 - i*0.1};
      ">
    </div>
  `;
}).join("")}

      <!-- TOP RIGHT NAV HUD -->
<div id="nav-hud">
  <div><b>Stop 1 / ${itinerary.length}</b></div>
  <div style="margin-top:4px;">First stop: ${current.name}</div>
  <div>${current.dist} away · ~${Math.round(parseInt(current.dist)/25)} min ETA</div>
</div>

<!-- CROWD ALERT -->
${crowdActive ? `
<div id="crowd-alert">
  ⚠ Heavy crowd detected ahead<br>
  Consider skipping this stall
</div>` : ``}


      <!-- BOTTOM PAUSE -->
      <div id="nav-controls">
  <button class="sys-btn small" onclick="skipStop()">⏭ Skip</button>
  <button class="sys-btn small" onclick="reroute()">🔁 Reroute</button>
</div>

    </div>
  `;
}

function setHeaderMode(mode){
  uiMode = mode;

  const plannerTitle = document.getElementById("planner-title");
  const subtitle = document.querySelector(".subtitle");
  const caption = document.querySelector(".caption");
  const crowd = document.getElementById("crowd");

  if(mode === "planner"){
    plannerTitle.innerText = "Market Planner";
    plannerTitle.style.display = "block";
    subtitle.style.display = "none";
    caption.style.display = "none";
    crowd.style.display = "none";
  }

  else if(mode === "ar"){
    plannerTitle.innerText = "AR Navigation";
    plannerTitle.style.display = "block";
    subtitle.style.display = "none";
    caption.style.display = "none";
    crowd.style.display = "none";
  }

  else if(mode === "people"){
  plannerTitle.innerText = "Find Your People";
  plannerTitle.style.display = "block";
  subtitle.style.display = "none";
  caption.style.display = "none";
  crowd.style.display = "none";
}

  else{
    plannerTitle.style.display = "none";
    subtitle.style.display = "block";
    caption.style.display = "block";
    crowd.style.display = "block";
  }
}

function skipStop(){
  itinerary.shift();          // remove current stop
  if(itinerary.length === 0){
    goTo(homeScreen);
    return;
  }
  startNavigation();
}

function reroute(){
  crowdActive = false;

  startNavigation();   // rebuild navigation first

  setTimeout(()=>{
    const navLayer = document.getElementById("nav-layer");
    if(!navLayer) return;

    navLayer.insertAdjacentHTML("beforeend",
      `<div id="reroute-msg">✔ Path rerouted!</div>`
    );

    setTimeout(()=>{
      const msg = document.getElementById("reroute-msg");
      if(msg) msg.remove();
    },3000);
  },50);
}

function renderMiniMap(points){
  const userX = 70;
  const userY = 70;

  document.getElementById("ar-overlay").innerHTML = `
    <div id="mini-map">
      <div class="map-user"></div>

      ${crowdActive ? `<div class="map-crowd" style="left:82px; top:40px;"></div>` : ``}

      ${points.map(p=>`
        <div class="map-stall" style="left:${p.x}px; top:${p.y}px;"></div>
      `).join("")}

      ${points.map(p=>{
        const dx = p.x - userX;
        const dy = p.y - userY;
        const len = Math.sqrt(dx*dx + dy*dy);
        const ang = Math.atan2(dy, dx) * 180 / Math.PI;

        return `
          <div class="map-line"
               style="left:${userX}px; top:${userY}px; width:${len}px;
                      transform:rotate(${ang}deg);"></div>
        `;
      }).join("")}
    </div>
  `;
}

function fullMapScreen(){
  document.getElementById("ar-overlay").classList.add("map-active");
  setHeaderMode("ar");
  hideStartVisit();
  clearAROverlays();

  const userX = 50;
  const userY = 50;

  const points = stalls.map((s,i)=>{
    const d = parseInt(s.dist);
    return {
      x: userX + Math.cos(i*0.9) * (d/3),
      y: userY + Math.sin(i*0.9) * (d/3)
    };
  });

  screen.innerHTML = ""; // important — leave AR space free

  document.getElementById("ar-overlay").innerHTML = `
    <div id="map-card">
      <div id="full-map">
        <div class="map-user big"></div>

        ${points.map((p,i)=>`
          <div class="map-stall big"
               style="left:${p.x}%; top:${p.y}%;">
            <span class="map-label">${stalls[i].name}</span>
          </div>
        `).join("")}
      </div>

      <div id="map-actions">
        <button class="sys-btn small" onclick="goTo(plannerPage)">
          Select Stalls
        </button>
      </div>
    </div>
  `;
}

function updateCalmPlaces(){
  const fog = document.getElementById("calm-fog");
  if(!fog) return;

  fog.style.display = "block";
  fog.innerHTML = `
    <div class="calm-zone" style="left:${20+Math.random()*60}%; top:${20+Math.random()*60}%; width:60px; height:60px;"></div>
    <div class="calm-zone" style="left:${20+Math.random()*60}%; top:${20+Math.random()*60}%; width:50px; height:50px;"></div>
  `;
}

function openMeetingMap(){
  document.getElementById("ar-world").classList.add("map-open");

  setHeaderMode("people");
  hideStartVisit();
  clearAROverlays();

  screen.innerHTML = "";
  const overlay = document.getElementById("ar-overlay");
  overlay.classList.add("map-active");

  overlay.innerHTML = `
    <div id="meeting-hint">👉 Tap on the map to set meeting point</div>

    <div id="map-card">
      <div id="full-map"></div>

      <div id="map-actions">
        <button class="sys-btn small" id="confirm-meet" style="display:none">Confirm</button>
        <button class="sys-btn small" id="edit-meet" style="display:none">Edit</button>
      </div>
    </div>
  `;


  const map = document.getElementById("full-map");
  if(friendsVisible){
  ["F1","F2","F3","F4"].forEach((f,i)=>{
    map.insertAdjacentHTML("beforeend",`
      <div class="friend"
           style="left:${30+i*12}%; top:${30+(i%2)*25}%;"></div>
    `);
  });
}

  const confirmBtn = document.getElementById("confirm-meet");
  const editBtn    = document.getElementById("edit-meet");

  map.onclick = (e) => {
    const rect = map.getBoundingClientRect();

    meetingPoint = {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top)  / rect.height) * 100
    };

    // remove previous star
    map.querySelectorAll(".meeting-star").forEach(s => s.remove());

    // add new star
    map.insertAdjacentHTML("beforeend",`
      <div class="meeting-star"
           style="left:${meetingPoint.x}%; top:${meetingPoint.y}%;">⭐</div>
    `);

    // show buttons
    confirmBtn.style.display = "inline-block";
    editBtn.style.display    = "inline-block";
  };

  confirmBtn.onclick = confirmMeetingPoint;

  editBtn.onclick = () => {
    meetingPoint = null;
    map.querySelectorAll(".meeting-star").forEach(s => s.remove());
    confirmBtn.style.display = "none";
    editBtn.style.display = "none";
  };
}

function updateCalm(){
  document.getElementById("calm-fog").innerHTML = `
    <div class="calm-zone" style="left:${20+Math.random()*60}%; top:${20+Math.random()*60}%; width:60px; height:60px;"></div>
  `;
}

function locatePeople(){
  friendsVisible = true;

  const radar = document.getElementById("radar");
  radar.querySelectorAll(".friend").forEach(f => f.remove());

  const friends = [
    {name:"F1", dist:"45m",  x:32, y:28},
    {name:"F2", dist:"78m",  x:58, y:42},
    {name:"F3", dist:"110m", x:40, y:62},
    {name:"F4", dist:"150m", x:65, y:70}
  ];

  friends.forEach(f => {
    radar.insertAdjacentHTML("beforeend",`
      <div class="friend" style="left:${f.x}%; top:${f.y}%;">
        <span>${f.name} · ${f.dist}</span>
      </div>
    `);
  });

  document.getElementById("people-actions").innerHTML = `
    <button class="sys-btn small" onclick="openMeetingMap()">Create Meeting Point</button>
    <button class="sys-btn small" onclick="updateCalmPlaces()">Calm Places</button>
  `;
}






function selectMeetingPoint(e){
  const rect = e.currentTarget.getBoundingClientRect();

  meetingPoint = {
    x: ((e.clientX - rect.left) / rect.width) * 100,
    y: ((e.clientY - rect.top)  / rect.height) * 100
  };

  showMeetingRadar();
}

function showMeetingRadar(){
  setHeaderMode("people");
  hideStartVisit();
  clearAROverlays();

  document.getElementById("ar-world").classList.add("people-mode");

  screen.innerHTML = `
  <div id="people-layer">

    <div id="radar-wrapper">
      <div id="radar">
        <div class="radar-ring ring1"></div>
        <div class="radar-ring ring2"></div>
        <div class="radar-ring ring3"></div>
        <div id="radar-sweep"></div>
        <div id="calm-fog"></div>
        <div id="radar-user"></div>
      </div>
    </div>

    <div id="people-actions">
      <button class="sys-btn small" onclick="openMeetingMap()">Update Meeting Point</button>
      <button class="sys-btn small" onclick="startMeetingNavigation()">Start Navigation</button>
    </div>
  </div>
  `;

  const radar = document.getElementById("radar");

  // ⭐ Draw meeting star
  radar.insertAdjacentHTML("beforeend",`
    <div class="meeting-star"
         style="left:${meetingPoint.x}%; top:${meetingPoint.y}%;">⭐</div>
  `);

  // 👥 redraw friends
  renderFriends();
}


function startMeetingNavigation(){
  setHeaderMode("ar");
  hideStartVisit();

  screen.innerHTML = `
    <div id="nav-layer">

      ${Array.from({length:7}).map((_,i)=>{
        const scale = 1.4 - i*0.15;
        const y = 62 - i*5;
        const x = 50 + i*0.8;
        return `<div class="nav-arrow"
          style="left:${x}%;top:${y}%;
          transform:rotate(-45deg) scale(${scale});
          opacity:${1-i*0.1};"></div>`;
      }).join("")}

      <div id="nav-hud">
        <b>Meeting Point</b><br>
        120m away · ~5 min ETA
      </div>

      <div id="nav-controls">
        <button class="sys-btn small" onclick="openMeetingMap()">Update Meeting Point</button>
        <button class="sys-btn small" onclick="goTo(peopleScreen)">Exit Navigation</button>
      </div>
    </div>
  `;

  renderMeetingMiniMap();
}

function renderMeetingMiniMap(){
  const mapSize = 140;
  const userX = mapSize / 2;
  const userY = mapSize / 2;

  const starX = (meetingPoint.x / 100) * mapSize;
  const starY = (meetingPoint.y / 100) * mapSize;

  const dx = starX - userX;
  const dy = starY - userY;
  const dist = Math.sqrt(dx*dx + dy*dy);
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;

  document.getElementById("ar-overlay").innerHTML = `
    <div id="mini-map">
      <div class="map-user red"></div>

      <div class="meeting-star" style="left:${starX}px; top:${starY}px;">⭐</div>

      <div class="map-line"
           style="left:${userX}px;
                  top:${userY}px;
                  width:${dist}px;
                  transform:rotate(${angle}deg);"></div>
    </div>
  `;
}


function selectMeetingPoint(e){
  const rect = e.currentTarget.getBoundingClientRect();
  meetingPoint = {
    x: ((e.clientX - rect.left) / rect.width) * 100,
    y: ((e.clientY - rect.top) / rect.height) * 100
  };
  showMeetingRadar();
}

function confirmMeetingPoint(){
  document.getElementById("ar-world").classList.remove("map-open");

  document.getElementById("ar-overlay").classList.remove("map-active");
  document.getElementById("ar-overlay").innerHTML = "";

  // mark friends as still visible
  friendsVisible = true;

  // navigate properly
  showMeetingRadar();
}

function bindSideNav(){

  document.getElementById("btn-home").onclick = () => {
    goTo(menuScreen, true);
  };

  document.getElementById("btn-planner").onclick = () => {
    goTo(plannerScreen, true);
  };

  document.getElementById("btn-location").onclick = () => {
    goTo(fullMapScreen, true);
  };

  document.getElementById("btn-people").onclick = () => {
    goTo(peopleScreen, true);
  };
}

setTimeout(bindSideNav, 100);























