var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);

//io.set('heartbeat interval', 3000); ///// !!!!!!
//io.set('heartbeat timeout', 3000); ///// !!!!!!

// load html
app.get("/", function (req, res) {
	res.sendFile(__dirname + "/user.html");
	//	res.send("Hello"); 
});

// load all files inside /game/
app.get(/jquery\/.*/, function (req, res) {
	// response
	res.sendFile(__dirname + req.url);
});

app.get(/images\/.*/, function (req, res) {
	// response
	res.sendFile(__dirname + req.url);
});

app.get(/lib\/.*/, function (req, res) {
	// response
	res.sendFile(__dirname + req.url);
});

// socket connect
io.on("connection", function (socket) {

	// добавляем user 
	Users.Add(socket); 
  
	// Send message
	socket.emit("get HTML page ID", socket.conn.id);

	// send message
	Users.sendUsersCount();

	// message 'disconnect' 
	socket.on('disconnect', function () { 
	
		// disconnect
		var enemySocket = Users.FindEnemy(socket.userID);
		if (enemySocket)
		{
			enemySocket.playWithUserID = null;
			enemySocket.emit("Enemy was disconnected", "html id= " + socket.myUniqHTMLPageID); // send message to user
		}

		// delete user 
		Users.Delete(socket);
		
		// send message
		Users.sendUsersCount();
	}); 

	// message 'Set Uniq HTML Page ID' 
	socket.on('HTML Page loaded', function (msg) { 
		socket.myUniqHTMLPageID = msg;

		// find enemy and play
		Users.FindEnemyAndPlay(socket);
	}); 

	// message 'Set Uniq HTML Page ID' 
	socket.on('HTML Page ID', function (msg) { 
		socket.myUniqHTMLPageID = msg;
		return;

		// find enemy by HTML Page ID
		if (socket.playWithUserID==null)
		{
			for (var i = 0; i<this._sockets.length; i++) 
			{ 
				if (this._sockets[i].myUniqHTMLPageID==socket.myUniqHTMLPageID && this._sockets[i]!=socket)
				{
					socket.playWithUserID = this._sockets[i].playWithUserID;
					break;
				}
			}

			// find by user ID
			if (socket.playWithUserID!=null)
			{
				for (var i = 0; i<this._sockets.length; i++) 
				{ 
					if (this._sockets[i].userID==socket.playWithUserID)
					{
						this._sockets[i].playWithUserID = socket.userID;
						break;
					}
				}
			}
		}
	}); 

	// message 'Hero moving start' 
	socket.on('Hero moving start', function (msg) { 

		// find enemy
		var enemySocket = Users.FindEnemy(socket.userID);
		if (enemySocket)
			enemySocket.emit("Enemy hero moving start", msg); // send message to user
	}); 

	// message 'Hero moving end' 
	socket.on('Hero moving end', function (msg) { 

		// find enemy
		var enemySocket = Users.FindEnemy(socket.userID);
		if (enemySocket)
			enemySocket.emit("Enemy hero moving end", msg); // send message to user
	}); 

	// message 'created fire' 
	socket.on('created fire', function (msg) { 

		// find enemy
		var enemySocket = Users.FindEnemy(socket.userID);
		if (enemySocket)
			enemySocket.emit("Enemy created fire", msg); // send message to user
	}); 

	// message 'Hero was damaged' 
	socket.on('Hero was damaged', function (msg) { 

		// find enemy
		var enemySocket = Users.FindEnemy(socket.userID);
		if (enemySocket)
		{
			// start Level
			Users.PlayGame(socket, enemySocket);
		}
	}); 
});

// web server
var port = process.env.PORT; 
http.listen(port, function () {
});

///// my utils ///////// 
var g_counterForName = 1;

var Users = { 
	_sockets: [], // массив socket 

	GetUsersCount: function () 
	{
		return this._sockets.length;
	},

	sendUsersCount: function()
	{
		io.emit("Online users count", this.GetUsersCount() );
	},

	FindEnemyAndPlay: function(socket)
	{
		// find user to play	
		var foundSocket = Users.FindUserToPlay(socket);
		if (foundSocket)
		{
			// init player1
			socket.playWithUserID = foundSocket.userID;
			socket.isPlayer1 = false;
	    
			// init player2
			foundSocket.playWithUserID = socket.userID;
			foundSocket.isPlayer1 = true;
	    
			// start Level
			this.PlayGame(socket, foundSocket);
			this.PlayGame(foundSocket, socket);
		}
		else // enemy not connected
		{
			// start single play
			socket.isPlayer1 = true;
			this.PlayGame(socket, null);
		}

		// send message
		Users.sendUsersCount();
	},

	PlayGame: function (player, playerEnemy) 
	{ 
		// params
		var params = {};
		params['userName'] = player.userName;
		params['isPlayer1'] = player.isPlayer1;

		// enemy
		params['isPlayWithUser'] = false;
		if (playerEnemy)
		{
			params['isPlayWithUser'] 		= true;
			params['playWithUserName']		= playerEnemy.userName;
			params['playWithUserIsPlayer1']	= playerEnemy.isPlayer1;
		}


		// Send message
		player.emit("play Game", params);
	},

	FindEnemy: function (userID) 
	{ 
		for (var i = 0; i<this._sockets.length; i++) 
		{ 
			if (this._sockets[i].playWithUserID==userID )
				return this._sockets[i];
		}

		return null;
	},

	FindUserToPlay: function (curSocket) 
	{ 
		for (var i = 0; i<this._sockets.length; i++) 
		{ 
			if (this._sockets[i].playWithUserID==null && this._sockets[i].userID != curSocket.userID )
				return this._sockets[i];
		}

		return null;
	},

	Add: function (curSocket) 
	{ 
		// init
		curSocket.userID = curSocket.conn.id;
		curSocket.playWithUserID = null;
		curSocket.isPlayer1 = false;
		curSocket.xPosHero = -1;
		curSocket.yPosHero = -1;
		curSocket.angleHero = 0;

		// init name by default
		curSocket.userName = 'user' + g_counterForName; //default
		g_counterForName++;
		
		// add user 
		this._sockets.push(curSocket); 
	}, 
  
	Delete: function (curSocket) 
	{ 
		for (var i = (this._sockets.length - 1); i >= 0; i--)
		{ 
			// delete 
			if (this._sockets[i].conn.id == curSocket.conn.id) 
				this._sockets.splice(i, 1); 
		} 
	}
}