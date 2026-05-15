let ambience;

export function playAmbience(src){

  if(ambience){
    ambience.pause();
  }

  ambience = new Audio(src);

  ambience.loop = true;

  ambience.volume = 0.25;

  ambience.play();

}