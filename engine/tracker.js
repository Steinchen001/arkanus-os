const Tracker = {

  lastDistance: null,
  lastState: "",

  update(distance){

    distance = Math.round(distance);

    if(this.lastDistance === null){
      this.lastDistance = distance;
      return;
    }

    if(Math.abs(distance - this.lastDistance) < 8){
      return;
    }

    this.lastDistance = distance;

    let title = "ZENTRALE";
    let lines = [];

    if(distance <= 8){

      if(this.lastState !== "arrived"){

        this.lastState = "arrived";

        lines = [
          "Signal bestätigt.",
          "Position erreicht.",
          "Ermittlung kann fortgesetzt werden."
        ];

      }else{
        return;
      }

    }else if(distance <= 20){

      if(this.lastState !== "close"){

        this.lastState = "close";

        lines = [
          "Signal verbessert.",
          "Nur noch " + distance + " Meter."
        ];

      }else{
        return;
      }

    }else{

      this.lastState = "far";

      lines = [
        "Signal wird stärker.",
        "Entfernung:",
        distance + " Meter"
      ];

    }

    if(typeof Radio !== "undefined"){
      Radio.show(title, lines);
    }

  }

};