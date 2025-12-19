export const ARDUINO_SKETCH = `
/*
 * Mixvell Mocktail Dispenser Firmware (v9.4 - Permanent Reconfig)
 * -----------------------------------
 * Hardware: Arduino Uno/Nano, HC-05 Bluetooth, 6-Channel Relay
 * 
 * PINS MAPPING:
 * 2: Soda
 * 3: Cola
 * 4: Sugar Syrup (Thick)
 * 5: Lemon Mix
 * 6: Spicy Lemon Mix
 * 7: Orange Juice (Replaces Pineapple)
 * 
 * COMMANDS:
 * 1. CSV Recipe: "Soda,Cola,Sugar,Lemon,Spicy,Orange\n"
 *    Example: "20,40,35,5,0,0\n"
 */

const int PIN_SODA      = 2;
const int PIN_COLA      = 3;
const int PIN_SUGAR     = 4;
const int PIN_LEMON     = 5;
const int PIN_SPICY     = 6; 
const int PIN_ORANGE    = 7;

// Calibration (ms per mL)
int pumpDelays[6] = { 100, 150, 220, 200, 200, 180 };

String inputString = "";         
boolean stringComplete = false;  

void setup() {
  Serial.begin(9600);
  pinMode(PIN_SODA, OUTPUT);
  pinMode(PIN_COLA, OUTPUT);
  pinMode(PIN_SUGAR, OUTPUT);
  pinMode(PIN_LEMON, OUTPUT);
  pinMode(PIN_SPICY, OUTPUT);
  pinMode(PIN_ORANGE, OUTPUT);

  digitalWrite(PIN_SODA, HIGH);
  digitalWrite(PIN_COLA, HIGH);
  digitalWrite(PIN_SUGAR, HIGH);
  digitalWrite(PIN_LEMON, HIGH);
  digitalWrite(PIN_SPICY, HIGH);
  digitalWrite(PIN_ORANGE, HIGH);

  Serial.println("Mixvell v9.4 Online.");
}

void loop() {
  if (stringComplete) {
    processCommand(inputString);
    inputString = "";
    stringComplete = false;
  }
}

void serialEvent() {
  while (Serial.available()) {
    char inChar = (char)Serial.read();
    inputString += inChar;
    if (inChar == '\\n') stringComplete = true;
  }
}

void processCommand(String command) {
  command.trim();
  if (command.equalsIgnoreCase("CLEAN")) {
    runCleaningCycle();
    return;
  }

  int targetML[6] = {0, 0, 0, 0, 0, 0};
  sscanf(command.c_str(), "%d,%d,%d,%d,%d,%d", &targetML[0], &targetML[1], &targetML[2], &targetML[3], &targetML[4], &targetML[5]);
  int pins[6] = {PIN_SODA, PIN_COLA, PIN_SUGAR, PIN_LEMON, PIN_SPICY, PIN_ORANGE};

  for(int i=0; i<6; i++) {
     if (targetML[i] > 0) pump(pins[i], targetML[i], pumpDelays[i]);
  }
}

void runCleaningCycle() {
  int pins[6] = {PIN_SODA, PIN_COLA, PIN_SUGAR, PIN_LEMON, PIN_SPICY, PIN_ORANGE};
  for(int i=0; i<6; i++) {
    digitalWrite(pins[i], LOW);
    delay(15000);
    digitalWrite(pins[i], HIGH);
    delay(500);
  }
}

void pump(int pin, int ml, int msPerML) {
  long duration = (long)ml * (long)msPerML;
  digitalWrite(pin, LOW); 
  delay(duration);
  digitalWrite(pin, HIGH);
  delay(200); 
}
`;