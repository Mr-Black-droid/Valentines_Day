let d = 0, n = 6, showLink = false, startTime;
let terminalText = "", charIndex = 0, stars = [], meteors = [];
let myImage, mySong, experienceStarted = false, msgOpacity = 0;

// WHITE HOLE & ACCRETION DISC CONSTANTS
let discRotation = 0;
let discOpacity = 0;
let eventTimer = 0; 
let photoPos, moonPos;

function preload() {
  myImage = loadImage('Shannel.jpeg');
  mySong = loadSound('music.mpeg'); 
}

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  
  // SAFARI SHIELDS
  cnv.style('touch-action', 'none'); 
  cnv.style('-webkit-tap-highlight-color', 'transparent'); 

  startTime = new Date(2026, 0, 12, 18, 46); 
  angleMode(DEGREES);
  
  photoPos = createVector(width/2, height/2);
  moonPos = createVector(width/2, height/2);

  for (let i = 0; i < 100; i++) {
    stars.push({
      x: random(width), y: random(height),
      size: random(0.5, 2), blinkSpeed: random(0.01, 0.05), phase: random(TWO_PI)
    });
  }
}

function draw() {
  drawAtmosphericBackground();
  updateMeteors();

  if (experienceStarted) {
    drawWhiteHoleTransition();
  } else {
    drawBouquetStage();
  }
}

// --- SYNCED INTERACTION ---

function startNow() {
  // Only trigger if Link is shown AND Song is ready
  if (showLink && !experienceStarted && mySong.isLoaded()) {
    
    // Force Audio Unlock first
    userStartAudio(); 
    mySong.setVolume(1.0);
    mySong.play(); 
    
    // Start Animation at the exact same millisecond
    experienceStarted = true;
    eventTimer = 0;
    msgOpacity = 0;
    discOpacity = 0;
  }
}

function touchStarted() {
  startNow();
  return false; // Blocks Safari's "Check for scroll" delay
}

function mousePressed() {
  startNow();
}

// --- VISUAL STAGES ---

function drawBouquetStage() {
    drawFloatingFlower(width * 0.15, height * 0.15, d * 0.45, color(130, 80, 255, 140));
    drawFloatingFlower(width * 0.85, height * 0.15, d * 0.45, color(0, 200, 200, 140));
    drawFloatingFlower(width * 0.85, height * 0.85, d * 0.45, color(255, 140, 120, 140));

    push();
    translate(width / 2, height / 2 - 50);
    drawAura(d, color(255, 60, 100)); 
    for (let a = 0; a < 361; a += 2) { 
      let r = d * cos(n * a); 
      let x = (r + sin(frameCount * 2 + a) * 3) * cos(a);
      let y = (r + sin(frameCount * 2 + a) * 3) * sin(a);
      drawPetals(x, y, a, color(255, 60, 100), 1); 
    }
    pop();
    
    // Only show the "Touch Me" link once the bouquet is grown AND music is ready
    if (d < 180) {
      d += 0.8;
    } else {
      if (mySong.isLoaded()) {
        showLink = true;
      }
    }
    
    if (showLink) drawTerminalUI();
}

function drawWhiteHoleTransition() {
  eventTimer += (1/60); 
  
  if (eventTimer < 7) { 
    push();
    translate(width/2, height/2);
    discRotation += 5;
    rotate(discRotation);
    
    if (eventTimer < 4) discOpacity = lerp(discOpacity, 200, 0.05);
    else discOpacity = lerp(discOpacity, 0, 0.08);
    
    noFill();
    for(let i = 0; i < 8; i++) {
      stroke(255, 210, 160, discOpacity - (i*20));
      strokeWeight(2);
      let sz = (eventTimer < 4) ? 50 + (i * 20) : (50 + (i * 20)) * (1 - (eventTimer-4)/3);
      ellipse(0, 0, sz * 2.5, sz * 0.6); 
    }
    fill(255, 255, 255, discOpacity);
    noStroke();
    circle(0, 0, (eventTimer < 4) ? 45 : 45 * (1 - (eventTimer-4)/3));
    pop();
  }

  if (eventTimer > 0.2) {
    let targetPhotoY = height/2 + sin(frameCount * 1.5) * 5;
    photoPos.y = lerp(photoPos.y, targetPhotoY, 0.035);
    moonPos.x = lerp(moonPos.x, width * 0.15, 0.025);
    moonPos.y = lerp(moonPos.y, height * 0.15, 0.025);
    if (msgOpacity < 255) msgOpacity += 1.8;
  }

  if (msgOpacity > 5) {
    drawCrescentMoon(moonPos.x, moonPos.y, 0.8);
    let imgRatio = myImage.width / myImage.height;
    let drawW = width * 0.45; 
    let drawH = drawW / imgRatio;
    if (drawH > height * 0.55) { drawH = height * 0.55; drawW = drawH * imgRatio; }

    push();
    translate(photoPos.x, photoPos.y);
    drawingContext.shadowBlur = 40;
    drawingContext.shadowColor = 'black';
    tint(255, msgOpacity);
    imageMode(CENTER);
    image(myImage, 0, 0, drawW, drawH);
    pop();
    
    if (msgOpacity > 150) {
      drawRevealedText(photoPos.x, photoPos.y, drawW);
      fill(0, 255, 150, msgOpacity - 100); 
      textAlign(CENTER); textFont('Courier New'); textSize(12);
      text("> [STATUS]: Wassup Short-Circuit. Enjoy the view.😉", width / 2, height - 60);
    }
  }
}

// --- ALL OTHER HELPERS ---

function drawRevealedText(px, py, dw) {
  let imgL = px - (dw / 2); 
  let imgR = px + (dw / 2);
  push(); 
  textFont('Georgia'); textAlign(RIGHT, CENTER); fill(255, 192, 203, msgOpacity);
  textSize(18); textStyle(ITALIC);
  text("Happy Valentine’s Day Shannel", 20, py - 100, imgL - 40, 200);
  textAlign(LEFT, CENTER); fill(255, 255, 255, msgOpacity); 
  textSize(14); textStyle(NORMAL);
  text("Thirty-three days later and I’m still glad you got lost at that train station 😅", imgR + 20, py - 100, (width - imgR) - 40, 200);
  pop();
}

function drawAtmosphericBackground() {
  noFill();
  for (let i = 0; i <= height; i++) {
    let inter = map(i, 0, height, 0, 1);
    let c = lerpColor(color(5, 5, 15), color(15, 10, 25), inter);
    stroke(c); line(0, i, width, i);
  }
  noStroke();
  for (let s of stars) {
    let brightness = map(sin(frameCount * s.blinkSpeed + s.phase), -1, 1, 50, 255);
    fill(255, brightness); circle(s.x, s.y, s.size);
  }
  fill(100, 50, 255, 5); circle(width * 0.2, height * 0.3, 400 + sin(frameCount * 0.5) * 50);
  fill(50, 150, 255, 5); circle(width * 0.8, height * 0.7, 500 + cos(frameCount * 0.5) * 60);
}

function updateMeteors() {
  if (random(1) > 0.97) meteors.push(new Meteor());
  for (let i = meteors.length - 1; i >= 0; i--) {
    meteors[i].update(); meteors[i].display();
    if (meteors[i].isOffScreen()) meteors.splice(i, 1);
  }
}

class Meteor {
  constructor() {
    this.x = random(width * 0.3, width + 100); this.y = random(-100, height * 0.2);
    this.vx = random(-6, -12); this.vy = random(4, 10); this.history = [];
  }
  update() {
    this.history.push({x: this.x, y: this.y});
    if (this.history.length > 12) this.history.splice(0, 1);
    this.x += this.vx; this.y += this.vy;
  }
  display() {
    noFill();
    for (let i = 0; i < this.history.length; i++) {
      let alpha = map(i, 0, this.history.length, 0, 180);
      stroke(220, 240, 255, alpha); strokeWeight(map(i, 0, this.history.length, 0.5, 2.5));
      let pos = this.history[i]; let next = this.history[i+1] || this; line(pos.x, pos.y, next.x, next.y);
    }
  }
  isOffScreen() { return (this.y > height + 50 || this.x < -100); }
}

function drawCrescentMoon(x, y, scale) {
  push(); translate(x, y); rotate(-15);
  let moonGlow = map(sin(frameCount * 1.5), -1, 1, 5, 15);
  noStroke();
  for(let i = 10; i > 0; i--) { fill(255, 255, 220, (moonGlow - i) * (msgOpacity/255)); circle(0, 0, (60 * scale) + (i * 5)); }
  fill(255, 255, 230, msgOpacity); arc(0, 0, 50 * scale, 50 * scale, 30, 330, CHORD);
  fill(15, 10, 25); circle(12 * scale, 0, 45 * scale);
  pop();
}

function drawFloatingFlower(tx, ty, size, col) {
  push();
  let offX = sin(frameCount * 0.4 + tx) * 8; let offY = cos(frameCount * 0.4 + ty) * 8;
  translate(tx + offX, ty + offY); drawAura(size, col);
  for (let a = 0; a < 361; a += 4) { let r = size * cos(n * a); let x = r * cos(a); let y = r * sin(a); drawPetals(x, y, a, col, 0.6); }
  pop();
}

function drawAura(size, col) {
  noStroke(); for(let i = 6; i > 0; i--) { fill(red(col), green(col), blue(col), 8 - i); circle(0, 0, size * 1.3 + (i * 6)); }
}

function drawPetals(x, y, a, col, pSize) {
  push(); translate(x, y); rotate(a * 2); noStroke(); fill(col); 
  for (let i = 0; i < 5; i++) { ellipse(0, 2, 3 * pSize, 6 * pSize); rotate(72); }
  fill(255, 200, 0); circle(0, 0, 1.5 * pSize); pop();
}

function drawTerminalUI() {
  fill(0, 255, 150); textFont('Courier New'); textSize(14); textAlign(LEFT);
  let lines = "> [SYSTEM]: Gentleman at work...\n> [ERROR]: 404 - Cliché Not Found. Also,\n you lost the bet.";
  if (frameCount % 2 === 0 && charIndex < lines.length) { terminalText += lines.charAt(charIndex); charIndex++; }
  noStroke(); text(terminalText, 30, height - 140);
  if (charIndex >= lines.length) {
    text("> [STATUS]: Train incident: " + calculateTime(startTime), 30, height - 80);
    fill(255, abs(sin(frameCount * 3)) * 255); textAlign(CENTER);
    text("[ TOUCH ME! ]", width/2, height/2 - 50);
  }
}

function calculateTime(start) {
  let diff = new Date() - start;
  if (diff < 0) return "0d 00h 00m 00s"; 
  let d = Math.floor(diff / 86400000), h = Math.floor((diff / 3600000) % 24), m = Math.floor((diff / 60000) % 60), s = Math.floor((diff / 1000) % 60);
  return d + "d " + nf(h, 2) + "h " + nf(m, 2) + "m " + nf(s, 2) + "s";
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }
