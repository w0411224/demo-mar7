// LAST Completed Section: 6.3

window.onload = function(){

    const PADDLE_WIDTH = 100;
    const PADDLE_HEIGHT = 20;
    const BRICKS_WIDTH = 60;
    const BRICKS_HEIGHT = 30;
    const BALL_RADIUS = 8;
    const FULL_X_SPEED = 7;
    var stage;
    var paddle;
    var ball;
    var bricks = [];
    var score = 0;
    var lives = 3;
    var scoreText;
    var gameStarted = false;
    const KEYCODE_LEFT = 37;
    const KEYCODE_RIGHT = 39;
    const SPACEBAR = 32;
    var keyboardMoveLeft = false;
    var keyboardMoveRight = false;
    var highScore = 0;

    function init()
    {
        if(typeof(Storage) !== "undefined")
        {
            if(localStorage.highScore==undefined)
            {
                localStorage.highScore = 0;
            }
            highScore = localStorage.highScore;
        }
        else
        {
            highScore = 0;
        }

        stage = new createjs.Stage("myCanvas");

        // if(createjs.Touch.isSupported)
        // {
        //     createjs.Touch.enable(stage);
        // }
        optimizeForTouchAndScreens();

        createjs.Ticker.setFPS(60);
        createjs.Ticker.addEventListener('tick',tick);
        
        createScoreText();
        addToScore(0);
        
        createPaddle();
        createBall();
        createBrickGrid();

        window.onkeyup = keyUpHandler;
        window.onkeydown = keyDownHandler;

        stage.on('stagemousemove',function(event){
            paddle.x = stage.mouseX;
        });

        stage.on('stagemousedown',function(event){
            startLevel();
        });

        stage.canvas.height = window.innerHeight;
    }

    function optimizeForTouchAndScreens()
    {
        if(typeof window.orientation !== 'undefined')
        {
            window.onorientationchange = onOrientationChange;
            if(createjs.Touch.isSupported())
            {
                console.log("Touch - Enabled");
                createjs.Touch.enable(stage);
            }
            else
            {
                console.log("Touch - Not Enabled");
            }
            onOrientationChange();
        }
        else
        {
            window.onresize = resizeGame;
            resizeGame();
        }
    }

    function onOrientationChange()
    {
        setTimeout(resizeGame, 100);
    }

    function resizeGame()
    {

        var nTop, nLeft, scale;
        var gameWrapper = document.getElementById('gameWrapper');
        var w = window.innerWidth;
        var h = window.innerHeight;
        var nWidth = window.innerWidth;
        var nHeight = window.innerHeight;
        var widthToHeight = stage.canvas.width / stage.canvas.height;
        var nWidthToHeight = nWidth / nHeight;

        if(nWidthToHeight > widthToHeight)
        {
            console.log("Resizing Game - Screen too wide to stretch game");
            nWidth = nHeight * widthToHeight;
            scale = nWidth / stage.canvas.width;
            nLeft = (w / 2) - (nWidth / 2);
            gameWrapper.style.left = (nLeft) + "px";
            gameWrapper.style.top = "0px";
        }
        else
        {
            console.log("Resizing Game - Game can be stretched full screen width");
            nHeight = nWidth / widthToHeight;
            scale = nHeight / stage.canvas.height;
            nTop = (h / 2) - (nHeight / 2);
            //gameWrapper.style.top = (nTop) + "px";
            gameWrapper.style.top = "0px";
            gameWrapper.style.left = "0px";
        }

        stage.canvas.setAttribute("style", "-webkit-transform:scale(" + scale + ")");
        window.scrollTo(0,0);
    }



    function startLevel()
    {
        //test.test2 = 'test';

        if(!gameStarted)
        {
            console.log("Start game");
            gameStarted = true;
            ball.xSpeed = 5;
            ball.ySpeed = 5;
            ball.up = true;
            ball.right = true;
        }
    }

    function keyDownHandler(e)
    {
        switch(e.keyCode)
        {
            case KEYCODE_LEFT: keyboardMoveLeft = true; break;
            case KEYCODE_RIGHT: keyboardMoveRight = true; break;
            case SPACEBAR: startLevel(); break;
        }
    }

    function keyUpHandler(e)
    {
        switch(e.keyCode)
        {
            case KEYCODE_LEFT: keyboardMoveLeft = false; 
            case KEYCODE_RIGHT: keyboardMoveRight = false;
        }
    }

    function loseLife()
    {
        console.log("Lost a life")
        lives--;
        updateStatusLine();
        ball.xSpeed = 0;
        ball.ySpeed = 0;
        ball.x = paddle.x;
        ball.y = paddle.y - PADDLE_HEIGHT / 2 - BALL_RADIUS;
        gameStarted = false;

        if(lives==0)
        {
            if(highScore < score)
            {
                highScore = score;
                localStorage.highScore = score;
            }
            lives = 3;
            score = 0;     
        }

        updateStatusLine();
    }

    function createScoreText()
    {
        scoreText = new createjs.Text("","16px Arial","#000000");
        scoreText.y = stage.canvas.height - 16;
        stage.addChild(scoreText);
    }

    function addToScore(points)
    {
        score += points;
        updateStatusLine();
    }

    function updateStatusLine()
    {
        scoreText.text = "Score: " + score + " / Lives: " +lives + " / High Score: " + highScore;
    }

    function tick()
    {
       

        stage.update();

        if(keyboardMoveLeft)
        {
            console.log("Keyboard - Left");
            paddle.x -= 10;
        }
        if(keyboardMoveRight)
        {
            console.log("Keyboard - Right");
            paddle.x += 10;
        }


        if(paddle.x + PADDLE_WIDTH / 2 > stage.canvas.width)
        {
            paddle.x = stage.canvas.width - PADDLE_WIDTH / 2;
        }
        if(paddle.x - PADDLE_WIDTH / 2 < 0)
        {
            paddle.x =  PADDLE_WIDTH / 2;
        }

        if(!gameStarted)
        {
            ball.x = paddle.x;
            ball.y = paddle.y - PADDLE_HEIGHT / 2 - BALL_RADIUS;
            stage.update();
            return;
        }

        if(ball.up)
        {
            ball.y -= ball.ySpeed;
        }
        else
        {
            ball.y += ball.ySpeed;
        }

        if(ball.right)
        {
            ball.x += ball.xSpeed;
        }
        else
        {
            ball.x -= ball.xSpeed;
        }

        for(var i = 0; i < bricks.length; i++)
        {
            if(checkCollision(ball,bricks[i]))
            {
                addToScore(100);
                console.log("Brick Hit / New Score: " + score);
                destroyBrick(bricks[i]);
                bricks.splice(i, 1);
                i--;
            }
        }

        if(checkCollision(ball,paddle))
        {
            newBallXSpeedAfterCollision(ball,paddle);
        }

        // check if we reached the walls
        if(ball.x + BALL_RADIUS >= stage.canvas.width)
        {
            ball.x = stage.canvas.width - BALL_RADIUS;
            ball.right = false;
        }
        if(ball.x - BALL_RADIUS <= 0)
        {
            ball.x = BALL_RADIUS;
            ball.right = true;
        }
        if(ball.y - BALL_RADIUS <= 0)
        {
            ball.y = BALL_RADIUS;
            ball.up = false;
        }
        if(ball.y + BALL_RADIUS >= stage.canvas.height)
        {
            loseLife();
        }

        ball.lastX = ball.x;
        ball.lastY = ball.y;
    }

    function checkCollision(ballElement,hitElement)
    {
        // if(ballElement.x + BALL_RADIUS <= brickElement.x - BRICKS_WIDTH / 2 || ballElement.x - BALL_RADIUS
        //     >= brickElement.x + BRICKS_WIDTH / 2 || ballElement.y - BALL_RADIUS >= brickElement.y + 
        //     BRICKS_HEIGHT / 2 || ballElement.y + BALL_RADIUS <= brickElement.y - BRICKS_HEIGHT /2)
        // {
        //     return false;
        // }
        // return true;

        var leftBorder = (hitElement.x - hitElement.getBounds().width / 2);
        var rightBorder = (hitElement.x + hitElement.getBounds().width / 2);
        var topBorder = (hitElement.y - hitElement.getBounds().height / 2);
        var bottomBorder = (hitElement.y + hitElement.getBounds().height / 2);
        var previousBallLeftBorder = ballElement.lastX - BALL_RADIUS;
        var previousBallRightBorder = ballElement.lastX + BALL_RADIUS;
        var previousBallTopBorder = ballElement.lastY - BALL_RADIUS;
        var previousBallBottomBorder = ballElement.lastY + BALL_RADIUS;
        var ballLeftBorder = ballElement.x - BALL_RADIUS;
        var ballRightBorder = ballElement.x + BALL_RADIUS;
        var ballTopBorder = ballElement.y - BALL_RADIUS;
        var ballBottomBorder = ballElement.y + BALL_RADIUS;

        if((ballLeftBorder <= rightBorder) && (ballRightBorder >= leftBorder) && (ballTopBorder <=
            bottomBorder) && (ballBottomBorder >= topBorder))
        {
            if((ballTopBorder <= bottomBorder) && (previousBallTopBorder > bottomBorder))
            {
                // hit bottom
                ballElement.up = false;
                ballElement.y = bottomBorder + BALL_RADIUS;
            }
            if((ballBottomBorder >= topBorder) && (previousBallBottomBorder < topBorder))
            {
                // hit top
                ballElement.up = true;
                ballElement.y = topBorder - BALL_RADIUS;
            }
            if((ballLeftBorder <= rightBorder) && (previousBallLeftBorder > rightBorder))
            {
                // hit right
                ballElement.right = true;
                ballElement.x = rightBorder + BALL_RADIUS;
            }
            if((ballRightBorder >= leftBorder) && (previousBallRightBorder < leftBorder))
            {
                // hit left
                ballElement.right = false;
                ballElement.x = leftBorder - BALL_RADIUS;
            }

            ballElement.lastX = ballElement.x;
            ballElement.lastY = ballElement.y;

            return true;
        }
        return false;
    }

    function newBallXSpeedAfterCollision(ballElement,hitElement)
    {
        var startPoint = hitElement.x - hitElement.getBounds().width / 2;
        var midPoint = hitElement.x;
        var endPoint = hitElement.x + hitElement.getBounds().width / 2;

        if(ballElement.x < midPoint)
        {
            ball.right = false;
            ball.xSpeed = FULL_X_SPEED -((ballElement.x - startPoint) / (midPoint - startPoint)) *
                FULL_X_SPEED;
        }
        else
        {
            ball.xSpeed = FULL_X_SPEED -((endPoint - ballElement.x) / (endPoint - midPoint)) *
                FULL_X_SPEED;
            ball.right = true;    
        }

    }

    function createBrickGrid()
    {
        for(var i = 0; i < 14; i++)
        {
            for(var j = 0; j < 5; j++)
            {
                createBrick(i * (BRICKS_WIDTH + 10) + 40, j * (BRICKS_HEIGHT + 5) + 20);
            }
        }
    }

    function createBrick(x,y)
    {
        var brick = new createjs.Shape();
        brick.graphics.beginFill('#000FFF');
        brick.graphics.drawRect(0,0,BRICKS_WIDTH,BRICKS_HEIGHT);
        brick.graphics.endFill();
        
        brick.regX = BRICKS_WIDTH / 2;
        brick.regY = BRICKS_HEIGHT / 2;

        brick.x = x;
        brick.y = y;

        brick.setBounds(brick.regX,brick.regY,BRICKS_WIDTH,BRICKS_HEIGHT);

        stage.addChild(brick);
        bricks.push(brick);

        //destroyBrick(brick);
    }

    function destroyBrick(brick)
    {
        createjs.Tween.get(brick,{}).to({scaleX:0,scaleY:0},500);
        setTimeout(removeBrickFromScreen,500,brick);
    }

    function removeBrickFromScreen(brick)
    {
        stage.removeChild(brick);
    }

    function createBall()
    {
        ball = new createjs.Shape();
        ball.graphics.beginFill('Red').drawCircle(0,0,BALL_RADIUS);

        ball.x = paddle.x;
        ball.y = paddle.y - PADDLE_HEIGHT / 2 - BALL_RADIUS;

        ball.up = true;
        ball.right = true;
        ball.xSpeed = 0;
        ball.ySpeed = 0;
        ball.lastX = 0;
        ball.lastY = 0;

        stage.addChild(ball);
    }

    function createPaddle()
    {
        paddle = new createjs.Shape();
        paddle.graphics.beginFill('#00000').drawRect(0,0,
            PADDLE_WIDTH,PADDLE_HEIGHT);
        
        
        paddle.x = stage.canvas.width / 2 - PADDLE_WIDTH / 2;
        paddle.y = stage.canvas.height * 0.9;

        paddle.regX = PADDLE_WIDTH / 2;
        paddle.regY = PADDLE_HEIGHT / 2;
        paddle.setBounds(paddle.regX,paddle.regY,PADDLE_WIDTH,PADDLE_HEIGHT);

        stage.addChild(paddle);
    }

    //window.onload = init;
    init();
};
