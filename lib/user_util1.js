// загружаем картинку из файла 
function loadImageFromFile(url, myFuncWhenLoaded)
{ 
	// создаем пустую картинку 
	var img = new Image(); 

	// событие onload 
	img.onload = function(event) 
	{ 
		// статус 
		if (event && event.target)
			event.target.isLoaded = true; 

		// когда картинка загрузилась, вызываем нашу функцию чтобы нарисовать картинку 
		if (myFuncWhenLoaded) 
			myFuncWhenLoaded(img); 
	} 

	// загружаем картинку 
	img.src = url; 

	// результат 
	return img; 
}

// рисуем картинку на canvas 
function drawImage(myContext, img, x, y) 
{ 
	// рисуем картинку 
	myContext.drawImage(img, x, y); 
}

// angle for rotate drawing
function getAngle(type)
{
	if (type=='left')
		return 180; // degree

	else if (type=='up')
		return 270; // degree

	else if (type=='down')
		return 90; // degree

	 // right
	return 0; // degree
}

// rotate drawing
function drawRotateImage(myContext, object, x, y, angleInDegree) 
{ 
	myContext.save(); 

	myContext.translate(x + object.width/2, y + object.height/2); 
	myContext.rotate(angleInDegree * Math.PI / 180.0); 
	myContext.scale(1, 1); 

	myContext.drawImage(object, -object.width/2, -object.height/2); 

	myContext.restore(); 
}   

// mathematic
function isPointInRect(ptX, ptY, xRect, yRect, wRect, hRect)
{
	if (ptX>=xRect && ptX<=(xRect+wRect) && ptY>=yRect && ptY<=(yRect+hRect))
		return true;
	return false;
}

function isIntersectRects(x1, y1, w1, h1, x2, y2, w2, h2)
{
	if (isPointInRect(x1 /*pointX*/, y1 /*pointY*/, x2, y2, w2, h2))
		return true;

	if (isPointInRect(x1 /*pointX*/, y1+h1 /*pointY*/, x2, y2, w2, h2))
		return true;

	if (isPointInRect(x1+w1 /*pointX*/, y1 /*pointY*/, x2, y2, w2, h2))
		return true;

	if (isPointInRect(x1+w1 /*pointX*/, y1+h1 /*pointY*/, x2, y2, w2, h2))
		return true;

	// 

	if (isPointInRect(x2 /*pointX*/, y2 /*pointY*/, x1, y1, w1, h1))
		return true;

	if (isPointInRect(x2 /*pointX*/, y2+h2 /*pointY*/, x1, y1, w1, h1))
		return true;

	if (isPointInRect(x2+w2 /*pointX*/, y2 /*pointY*/, x1, y1, w1, h1))
		return true;

	if (isPointInRect(x2+w2 /*pointX*/, y2+h2 /*pointY*/, x1, y1, w1, h1))
		return true;

	return false;
}

// uniq ID
function createMyUniqID(curSocket)
{
	// date
	var time = new Date();
	var time_display = time.getDate() + "/" + Number(time.getMonth()+1) + "/" + time.getFullYear() + " "; 
	time_display += time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();

	// random
	var r = Math.random() * 1000; // from 1 to 1000
	var r = Math.round(r);

	// result
	return "Date=" + time_display + ' random=' + r + " connect id=" + curSocket.conn;
}