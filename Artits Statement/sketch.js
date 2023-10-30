let cowImg, grassImg, milkImg, coverImg, currentImage;
let loadedGrass = false, gameStarted = false, gptOutputDisplayed = false;
let input1, input2, input3;
let label1, label2, label3;
let currentYPosition = 50;
let progressBarActive = false;  
let progressBarStartTime;  
let progressBarDuration = 30000; 
let progressBarWidth = 400;  
let progressBarHeight = 20; 



function preload() {
  cowImg = loadImage('cow.png');
  grassImg = loadImage('grass.png');
  milkImg = loadImage('milk.png');
  coverImg = loadImage('cover.png');
}



function setup() {
  createCanvas(1200, 400);
  background(50,150,50);
  fill(243,153,179)
  rect(800,0,400,400)
  currentImage = coverImg; 
  image(currentImage, 400, 0, 400, 400);
  
  
  label1 = createElement('h4', 'background & focus');
  label1.position(50, 65);
  label1.hide();
  
  label2 = createElement('h4', 'media & methods');
  label2.position(50, 135);  
  label2.hide();
  
  label3 = createElement('h4', 'themes & concepts');
  label3.position(50, 205);  
  label3.hide();
  
  
  input1 = createInput();
  input1.position(50, 110);
  input1.size(200, 30);
  input1.hide();
  
  input2 = createInput();
  input2.position(50, 180);  
  input2.size(200, 30);
  input2.hide();
  
  input3 = createInput();
  input3.position(50, 250); 
  input3.size(200, 30);
  input3.hide();
}

function draw() {
   if (progressBarActive) {
        let elapsedTime = millis() - progressBarStartTime;  
        let progress = map(elapsedTime, 0, progressBarDuration, 0, progressBarWidth);   
     
        fill(7,117,18);
        noStroke();
        rect(400, 380, progressBarWidth, progressBarHeight);
        
        fill(225);  
        rect(400, 380, progress, progressBarHeight);

       
        if (elapsedTime >= progressBarDuration) {
            progressBarActive = false;
        }
    }
  fill(0);
}



function keyPressed() {
  if (keyCode === ENTER && !gameStarted) {
    startGame();
  }
}

function startGame() {
  gameStarted = true;
  
  currentImage = cowImg; 
  image(currentImage, 400, 0, 400, 400);
}



function mouseClicked() {
  
  if (gameStarted) {
    let d1 = dist(mouseX, mouseY, 517, 62);
    if (d1 < 68) {
     currentImage = grassImg;
      loadedGrass = true;
      image(currentImage, 400, 0, 400, 400);
      
      label1.show();
      input1.show();
      
      label2.show();
      input2.show();
      
      label3.show();
      input3.show();
    
    }

    let d2 = dist(mouseX, mouseY, 676, 62);
    if (d2 < 68 && loadedGrass) {
      currentImage = milkImg;
      image(currentImage, 400, 0, 400, 400);
            
      if (gptOutputDisplayed) {
        background(220);  
        image(currentImage, 400, 0, 400, 400); 
        gptOutputDisplayed = false;  
        currentYPosition = 70;   
      }
      
      progressBarActive = true;
      progressBarStartTime = millis();  
      let userInput = {
        bgFocus: input1.value(),
        mediaMethods: input2.value(),
        themesConcepts: input3.value()
      };
      
      callGPTAPIStream(userInput,function(response) {
    fill(0);  
    textSize(15); 
    textLeading(18);  
    gptOutputDisplayed = true; 

    let typingSpeed = 25; 
    typeText(response, 850, currentYPosition, typingSpeed);
});

    }
  }
}

function typeText(txt, x, y, speed, callback) {
    let index = 0;
    let currentLine = "";  
    let maxWidth = 300;

    function displayNextCharacter() {
        if (index < txt.length) {
            let char = txt[index];
            let newLine = currentLine + char;  

            if (textWidth(newLine) > maxWidth || char === '\n') {
                currentYPosition += 20; 
                x = 850;
                currentLine = ""; 

                if (char === '\n') { 
                    index++;
                    displayNextCharacter();
                    return;
                }
            } else {
                currentLine = newLine;  
            }

            text(char, x, currentYPosition);
            x += textWidth(char);  

            index++;
            setTimeout(displayNextCharacter, speed);  
        } else if (callback) {
            callback();  
        }
    }

    displayNextCharacter();
}





function callGPTAPIStream(userInput, callback) {
  let endpoint = "https://api.openai.com/v1/chat/completions"; 
  let apiKey = "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";  
  
  let postData = {
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "Transform user input into an International Art English (IAE) artist statement. Elevate common words to their noun forms (e.g., visual to visuality, experience to experiencability). Integrate advanced French-derived suffixes (-ion, -ity, -ality, -ization) and ensure the inclusion of one French word. Weave in metaphors. Emphasize terms like “space” and “reality”. Infuse the statement with adverbial phrases such as “radically questioned” and double adverbial terms like “playfully and subversively invert”. Incorporate phrases such as simultaneously, while also, and always already. Limit to 100 words." },
      { role: "user", content: "Process the user input: " + JSON.stringify(userInput) }
    ]
  };
fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(postData)
})
.then(response => {
    const reader = response.body.getReader();
    let decoder = new TextDecoder();
    let accumulatedData = "";  

    function readChunk() {
      return reader.read().then(({ value, done }) => {
        if (done) {
          
          let parsedData = JSON.parse(accumulatedData);
          if (parsedData && parsedData.choices && parsedData.choices.length > 0 && parsedData.choices[0].message) {
              let outputContent = parsedData.choices[0].message.content.trim();
              callback(outputContent);  
          } else {
              console.error("Unexpected response structure:", parsedData);
          }
          return;
        }
        let chunk = decoder.decode(value);
        accumulatedData += chunk;  
        return readChunk();  
      });
    }
    return readChunk();
})
.catch(error => {
    console.error("Error calling GPT API:", error);
});
}