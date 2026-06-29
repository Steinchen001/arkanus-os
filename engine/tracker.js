const Tracker = {

  lastDistance: null,
  lastStage: -1,

  update(distance){

    if(typeof Radio === "undefined") return;

    distance = Math.round(distance);

    let stage;

    if(distance <= 8){

      stage = 10;

    }else if(distance <= 15){

      stage = 9;

    }else if(distance <= 25){

      stage = 8;

    }else if(distance <= 40){

      stage = 7;

    }else if(distance <= 60){

      stage = 6;

    }else if(distance <= 90){

      stage = 5;

    }else if(distance <= 130){

      stage = 4;

    }else if(distance <= 180){

      stage = 3;

    }else if(distance <= 250){

      stage = 2;

    }else{

      stage = 1;

    }

    if(stage === this.lastStage){
      return;
    }

    this.lastStage = stage;

    if(stage === 10){

      Radio.show(
        "ZENTRALE",
        [
          "██████████",
          "",
          "Signal bestätigt.",
          "Position erreicht."
        ]
      );

      return;
    }

    const bars =
      "█".repeat(stage) +
      "░".repeat(10-stage);

    let text = "Signal wird stärker.";

    if(stage >= 8){

      text = "Fast am Ziel.";

    }else if(stage >= 6){

      text = "Signal sehr stabil.";

    }else if(stage >= 4){

      text = "Signal verbessert.";

    }

    Radio.show(
      "ZENTRALE",
      [
        bars,
        "",
        text,
        distance + " Meter"
      ]
    );

  }

};