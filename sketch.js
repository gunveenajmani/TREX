//objects name
//Global variables: A variable declared outside a function, becomes GLOBAL. All scripts and functions in the code can access it. 
var trex, trexRunning;
var ground, groundImage,invisibleGround;
var score=0;
var cloudGroup, cactusGroup;
var PLAY=1;
var END=0;
var gameState=PLAY;

//All images, sounds, animations need to be loaded here before they can be added to the setup/draw function
function preload(){
  //Adding animations
  trexRunning=loadAnimation("trex1.png","trex3.png", "trex4.png");
  trexCollided=loadAnimation("trex_collided.png");
  //Adding Images
  groundImage=loadImage("ground2.png");  
  cloud=loadImage("cloud.png");  
  o1=loadImage("obstacle1.png");  
  o2=loadImage("obstacle2.png");  
  o3=loadImage("obstacle3.png");  
  o4=loadImage("obstacle4.png"); 
  o5=loadImage("obstacle5.png");  
  o6=loadImage("obstacle6.png");
  end=loadImage("gameOver.png");
  resetImage=loadImage("restart.png");
  //adding sounds in the game
  jumpSound=loadSound("jump.mp3");
  trexDead=loadSound("die.mp3");
  checkPoint=loadSound("checkPoint.mp3");
}

function setup() {
  createCanvas(600, 200);
  
  //creating trex sprite
  trex= createSprite(50,160,25,20);
  trex.addAnimation("running",trexRunning); //original animation
  trex.addAnimation("popped-eye", trexCollided);//after collision animation
  trex.scale=0.6;
  //Setcollider decides the distance of collision detection between the obstacle and the   animation
  //setcollider("rectangle", x-offset, y-offset, width, height)
  //setcollider("circle", x-offset, y-offset, diameter)
  //if offset values are 0,0 then the center of the sahpe and center of animation will overlap
  //The number on the collider in the output screen increases as the depth of thetrex increases everytime the cloud passes the screen
  trex.setCollider("rectangle", 0, 0, 40, trex.height);
  trex.debug=true;//if false then the green colored collider will disapper
  
  //creating ground sprite
  ground= createSprite(300,190,600,20);
  ground.addImage("moving",groundImage);
  ground.x=ground.width/2;
  
  //creating invisible ground
  //trex looks like it's floating in air. To prevent this, invisibleGround is created so that the trex may touch this invisibleGround instead of ground.
  invisibleGround= createSprite(300,195,600,10);
  invisibleGround.visible=false;
  
  //defining edge sprites
  edges= createEdgeSprites();

  //create obstacles
  cloudGroup= new Group();
  cactusGroup= new Group();
 
  //sprite for game over
  gameOver= createSprite(300, 80, 100, 50);
  gameOver.addImage("abc", end);
  gameOver.scale=2.5;
  
  //sprite for restart
  restart= createSprite(300, 100, 80, 10);
  restart.addImage("xyz", resetImage);
  restart.scale=0.35;
  
  //score size- added here so everywher the size remains same.
  textSize(35);
  
}

function draw() {
  background(180);
   
  //2 game states define- PLAY and END
  if(gameState===PLAY){
    
    //scores
    score=score+Math.round(getFrameRate()/60);
    text ("score="+score, 50, 50);
    
    //Ground velocity given.
    //To increase the speed of the ground and make the game more challenging, we have added 3*score/100 to original velocity of -5.This is your choice. The number to be added can be anything.
    ground.velocityX=-(5+3*score/100);
    

    //Playing checkpoint sound
    //score%100 means any number of score which is completely divisible by 100 giving remainder 0. Everytime remainder becomes 0, RHS will be equal to LHS and the condition is satisfied playing the sound at-100,200,300,400,...
    if(score%100 === 0){
    checkPoint.play();
    }
  
    //making trex jump
    if(keyDown("space")&& trex.y >=160){
      trex.velocityY=-10;
      jumpSound.play();
     }
    
    //adding gravity
    trex.velocityY=trex.velocityY+0.5;
    
    //resetting the ground
    //if not resetted, the trex falls down, this basically gives a never ending ground
    if(ground.x<0){
       ground.x=ground.width/2;
     }
     
    //ending of the game
    if(trex.isTouching(cactusGroup)){
      gameState=END;
      //if trex jumps into the cactuses, it looked like it was floating in air after collision. To prevent this we make velY=o
      trex.velocityY=0;
      trexDead.play();
    }
    
    //Calling clouds and cactuses
    spawnClouds();
    spawnCactus();
    
    //visibility- if not given the restart and gameover sprite will be visible even during the game
    gameOver.visible=false;
    restart.visible=false;
    
  }
  else if(gameState===END){
   
    //ground should stop moving
    ground.velocityX=0;
    
    //trex should not jump
    trex.velocityY=0;
    
    //Clouds and cactuses should not be moving
    cloudGroup.setVelocityXEach(0);
    cactusGroup.setVelocityXEach(0);
    
    //New clouds and cactuses should not come.
    //Lifetime of an object basically keeps reducing by 1 after everyframe
    //Eg-if lifetime is set as 5, after 5 frames the lifetime becomes 0 and the object disappears and new object comes on the screen
    //To prevent this we make it -1, so everytime 1 is submtracted fromit, the lifetime which is an absolute value will always keep increasing=(-1-1=-2, -2-1=-3...)
    cloudGroup.setLifetimeEach(-1);
    cactusGroup.setLifetimeEach(-1);
   
    //changing the trex animation
    trex.changeAnimation("popped-eye", trexCollided);
    
    //visiblity- if not given, the restart and gameover sprite will not come on the screen
    gameOver.visible=true;
    restart.visible=true;
    
    //y position of the trex(it should not be in mid air)
    trex.y=160;
    
    //displaying last score in the end
    text ("score="+score, 50, 50);
    
    //reseting the game
    if(mousePressedOver(restart)) {
      reset();
    }
  }
  
  //colliding trex with invisible ground
  trex.collide(invisibleGround);

  drawSprites();
}

//The modulus operator - or more precisely, the modulo operation - is a way to determine the remainder of a division operation. Instead of returning the result of the division, the modulo operation returns the whole number remainder

//Spawning clouds.
function spawnClouds() {
  
   //If framecount is not given, then cloud will appear in every fram and they will be overlapped
   if(frameCount % 60===0){
     
      var clouds= createSprite(50, 20, 50, 15);
      clouds.addImage("air", cloud);
      clouds.velocityX=3;
     
     //Generating a random number so that the cloud's Y position is always different
      clouds.y=Math.round(random(10, 75));
     
     //adjusting the depth- to prevent the trex from going behind the cloud.
     //We make the cloud.depth same as trex depth- ed if trex.depth is 1 then cloud also becomes 1.Then we say, now make trex depth +1 which is 2.Thuse trex xomes infront of cloud
      clouds.depth=trex.depth;
      trex.depth=trex.depth+1;
     
     //time of the clouds= distance/speed
     //Distance is the width of canvas, and speed is that of ground
     //This lifetime is given to prevent memory leak problem
      clouds.lifetime=200;
     
      //adding clouds in group
      cloudGroup.add(clouds);
 } 
}

//Spawning Cactuses
function spawnCactus() {
  
//If framecount is not given, then cactus will appear in every frame and they will be overlapped. Everytime framecount is divisible by 100 the cactus will come.Basically adds delay between two cactuses
     if(frameCount % 100===0){
      var obstacle1= createSprite(500, 160, 20, 20);
      //velocity of obstacles should be same as the ground
      obstacle1.velocityX=-(5+3*score/100);
      //obstacle1.scale=0.3;

     //generating random value between 1 to 6
     var rand=Math.round(random(1, 6));
  
     // switch case is used to select 1 out of 6 cactus images
     switch(rand){
       case 1: obstacle1.addImage("difficulty", o1);break;
       case 2: obstacle1.addImage("difficulty", o2);break;
       case 3: obstacle1.addImage("difficulty", o3);break;
       case 4: obstacle1.addImage("difficulty", o4);break;
       case 5: obstacle1.addImage("difficulty", o5);break;
       case 6: obstacle1.addImage("difficulty", o6);break;
       default: break;
     }
    //lifetime of cactuses-distance/speed
    //distance is width of canvas and speed of ground
     obstacle1.lifetime=100;
   
     //adding cactus in group
     cactusGroup.add(obstacle1);
 }
}

//Creating reset function
function reset(){
  
  //Gamestate should change to play because you want start the game again
   gameState=PLAY;
  
  //making obstacles vanish- otherwise the obsatcle will remain for the entire lifetime in front of the trex who will keep colliding to it again and again and again game iwll keep ending and restarting
  cactusGroup.destroyEach();
  cloudGroup.destroyEach();
  
  //reseting score
  score=0;
  
  // adding regular animation of the trex
  trex.changeAnimation("running",trexRunning);
}