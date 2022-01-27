let canvas = document.querySelector('#myCanvas'),
    ctx = canvas.getContext("2d"),
    buttonMoveMode = document.querySelector('div.move-mode'),
    moveMode = false,
    previousSelectedCircle,
    circles = [],
    isDragging = false,
    speed = 2,
    width = canvas.width,
    height = canvas.height,
    opacity_range = document.getElementById("opacity_range"),
    opacity_range_value = document.getElementById("opacity_range_value");

class Point {
  x;
  y;
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Circle {
  center;
  radius;
  color;
  isSelected;
  velocityX;
  velocityY;
  constructor(xPos, yPos, radius, color) {
    this.center = new Point (xPos, yPos);
    this.radius = radius;
    this.color = color;
    this.isSelected = false;
    let angle = Math.random() * (Math.PI * 2);
    this.velocityX = Math.cos(angle) * speed;
    this.velocityY = Math.sin(angle) * speed;
  }

}

function getXToY(y, raduis, centerY) {
  return Math.round(Math.sqrt(Math.pow(raduis, 2) - Math.pow((y - centerY), 2)));
}

function drawCircles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let x, x1, x2, xi, xi1, xi2;
  for(let i = 0; i < circles.length; i++) {
    for(let y = (circles[i].center.y - circles[i].radius); y <= (circles[i].center.y + circles[i].radius); y++) {
      let points = [];
      x = getXToY(y, circles[i].radius, circles[i].center.y);
      //console.log("x " + x);
      x1 = circles[i].center.x - x;
      points.push(x1);
      x2 = circles[i].center.x + x;
      for(let j = 0; j < circles.length; j++) {
        if (i == j) continue; 
        xi = getXToY(y, circles[j].radius, circles[j].center.y);
        xi1 = circles[j].center.x - xi;
        xi2 = circles[j].center.x + xi;
        if(x1 <= xi1 && xi1 <= x2 ){
          points.push(xi1);
        }
        if(xi2 <= x2 && xi2 >= x1){
          points.push(xi2);
        }
      }
      points.push(x2);
      let pointsSort = points.sort(function(a, b) { return a - b });
      for(let l = 0; l < pointsSort.length - 1; l++) {
        let color = getColor(pointsSort[l] + 1, y, i);
        ctx.strokeStyle = "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
        ctx.beginPath();
        ctx.moveTo(pointsSort[l], y);
        ctx.lineTo(pointsSort[l + 1], y);
        ctx.stroke();
        ctx.closePath(); 
      }
    }
  }
}

function getColor(x, y, index) { 
  let color = circles[index].color.slice(0);
  for (let i = 0; i < circles.length; i++) {
    if(i == index) continue;
    if(Math.round(Math.pow((x - circles[i].center.x), 2) + Math.pow((y - circles[i].center.y), 2)) <= Math.pow(circles[i].radius, 2)) {
      color[0] = Math.min(color[0] + circles[i].color[0], 255); 
      color[1] = Math.min(color[1] + circles[i].color[1], 255);
      color[2] = Math.min(color[2] + circles[i].color[2], 255);
    }
  }
  return color;
}

function init() {
  let circle1 = new Circle(125, 150, 100, [255, 0, 0]);
  let circle2 = new Circle(375, 150, 100, [0, 255, 0]);
  let circle3 = new Circle(250, 350, 100, [0, 0, 255]);
  circles.push(circle1);
  circles.push(circle2);
  circles.push(circle3);
  drawCircles();
}

window.onload = () => {
  init();
  Update();
}

function Update() {
  if (moveMode) {
    for (let i = 0; i < circles.length; i++) {
      if (circles[i].center.x + circles[i].radius > width && circles[i].velocityX > 0 || circles[i].center.x < circles[i].radius && circles[i].velocityX < 0) {
        circles[i].velocityX = -circles[i].velocityX;
      }
      if (circles[i].center.y + circles[i].radius > height && circles[i].velocityY > 0 || circles[i].center.y < circles[i].radius && circles[i].velocityY < 0) {
        circles[i].velocityY = -circles[i].velocityY;
      }

      circles[i].center.x += circles[i].velocityX;
      circles[i].center.y += circles[i].velocityY;
      drawCircles();
    }  
  } else {
    canvas.onmousedown = canvasClick;   
    canvas.onmouseup = stopDragging;
    canvas.onmouseout = stopDragging;
    canvas.onmousemove = dragCircle; 
  }

getIntersection();
  window.requestAnimationFrame(() => Update());
}

function canvasClick(e) {
  // Получаем координаты точки холста, в которой щелкнули
  var clickX = e.pageX - canvas.offsetLeft;
  var clickY = e.pageY - canvas.offsetTop;

  // Проверяем, щелкнули ли no кругу
  for(var i = circles.length - 1; i >= 0; i--) {
    var circle = circles[i];

    // С помощью теоремы Пифагора вычисляем расстояние от 
    // точки, в которой щелкнули, до центра текущего круга
    var distanceFromCenter = Math.sqrt(Math.pow(circle.center.x - clickX, 2) + Math.pow(circle.center.y - clickY, 2))

    // Определяем, находится ли точка, в которой щелкнули, в данном круге
    if (distanceFromCenter <= circle.radius) {
      // Сбрасываем предыдущий выбранный круг	
      if (previousSelectedCircle != null) {
        previousSelectedCircle.isSelected = false;
      }
      previousSelectedCircle = circle;

      // Устанавливаем новый выбранный круг и обновляем холст
      circle.isSelected = true;
      isDragging = true;
      drawCircles();

      // Прекращаем проверку
      return;

    }
  }
} 

function stopDragging() {
  isDragging = false;
}

function dragCircle(e) {
  // Проверка возможности перетаскивания
  if (isDragging == true) {
    // Проверка попадания
    if (previousSelectedCircle != null) {
      // Сохраняем позицию мыши
      var x = e.pageX - canvas.offsetLeft;
      var y = e.pageY - canvas.offsetTop;

      // Перемещаем круг в новую позицию
      previousSelectedCircle.center.x = x;
      previousSelectedCircle.center.y = y;
      // Обновляем холст
      drawCircles();
    }
  }
}

function getIntersection() {
  for (let i = 0 ; i < circles.length ; ++i) {
    let circleA = circles[i];
    for (let j = i + 1; j < circles.length ; ++j) {
      let circleB = circles[j];

      let dx = circleB.center.x - circleA.center.x;
      let dy = circleB.center.y - circleA.center.y;
      let distance = Math.hypot(dx, dy);

      if (distance <= circleA.radius + circleB.radius) { //рисуем пересечения если только гипотенуза меньше сумм радиусов
        this.drawIntersection(circleA.radius, circleB.radius, distance, dx, dy, circleA);
      }
    }
  }
}

function drawIntersection(sideA, sideB, sideC, dx, dy, circle) {
  let aSquare = Math.pow(sideA, 2);
  let bSquare = Math.pow(sideB, 2);
  let cSquare = Math.pow(sideC, 2);

  let cosineA = (aSquare - bSquare + cSquare) / (sideA * sideC * 2);
  let angleOfRotation = Math.acos(cosineA);
  let angleCorrection = Math.atan2(dy, dx);

  let pointOneX = circle.center.x + Math.cos(angleCorrection - angleOfRotation) * sideA;
  let pointOneY = circle.center.y + Math.sin(angleCorrection - angleOfRotation) * sideA;
  let pointTwoX = circle.center.x + Math.cos(angleCorrection + angleOfRotation) * sideA;
  let pointTwoY = circle.center.y + Math.sin(angleCorrection + angleOfRotation) * sideA;

  ctx.fillStyle = "white";
  ctx.strokeStyle = "white";
  ctx.beginPath();
  ctx.arc(pointOneX, pointOneY, 1, 0, Math.PI * 2);
  ctx.fill(); 
  ctx.stroke();

  ctx.fillStyle = "white";
  ctx.strokeStyle = "white";
  ctx.beginPath();
  ctx.arc(pointTwoX, pointTwoY, 1, 0, Math.PI * 2);
  ctx.fill(); 
  ctx.stroke();
}

buttonMoveMode.addEventListener("click", function(event)
                                {
  if(buttonMoveMode.style.backgroundColor == "rgb(78, 87, 84)") {
    buttonMoveMode.style.backgroundColor = "#A5A5A5";
    moveMode = false;  
  }      
  else
  {
    buttonMoveMode.style.backgroundColor = "rgb(78, 87, 84)";
    moveMode = true; 
  }       
})

opacity_range.addEventListener("change", function() {
  canvas.style.opacity = this.value / 100;
  opacity_range_value.textContent = this.value;
});
