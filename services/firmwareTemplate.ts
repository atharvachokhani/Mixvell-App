export const ARDUINO_SKETCH = `
/*
 * Mixvell Mocktail Dispenser Firmware (v5.0 - Cleaning Mode)
 * -----------------------------------
 * Hardware: Arduino Uno/Nano, HC-05 Bluetooth, 6-Channel Relay
 * 
 * FEATURES:
 * - Per-pump calibration (Viscosity support)
 * - Cleaning Mode (Command: "CLEAN")
 */

// Pins definitions
const int PIN_WATER  = 2;
const int PIN_COLA   = 3;
const int PIN_SODA   = 4;
const int PIN_SUGAR  = 5;
const int PIN_LEMON  = 6;
const int PIN_ORANGE = 7;

// --- CALIBRATION CONFIGURATION ---
// Milliseconds per mL.
int pumpDelays[6] = {
  100, // Pin 2 (Water) - Thin
  150, // Pin 3 (Cola) - Medium (Concentrate)
  100, // Pin 4 (Soda) - Thin
  200, // Pin 5 (Sugar Syrup) - THICK
  200, // Pin 6 (Lemon Mix) - THICK
  200  // Pin 7 (Orange Juice) - THICK
};

// --- GLOBALS ---
String inputString = "";         
boolean stringComplete = false;  

void setup() {
  Serial.begin(9600);
  inputString.reserve(200);

  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, LOW);

  // Initialize Pump Pins
  pinMode(PIN_WATER, OUTPUT);
  pinMode(PIN_COLA, OUTPUT);
  pinMode(PIN_SODA, OUTPUT);
  pinMode(PIN_SUGAR, OUTPUT);
  pinMode(PIN_LEMON, OUTPUT);
  pinMode(PIN_ORANGE, OUTPUT);

  // Turn off all relays (Active LOW)
  digitalWrite(PIN_WATER, HIGH);
  digitalWrite(PIN_COLA, HIGH);
  digitalWrite(PIN_SODA, HIGH);
  digitalWrite(PIN_SUGAR, HIGH);
  digitalWrite(PIN_LEMON, HIGH);
  digitalWrite(PIN_ORANGE, HIGH);

  Serial.println("Mixvell Dispenser Ready (v5.0).");
}

void loop() {
  if (stringComplete) {
    // BLINK LED for debug
    digitalWrite(LED_BUILTIN, HIGH);
    delay(100);
    digitalWrite(LED_BUILTIN, LOW);
    
    processCommand(inputString);
    inputString = "";
    stringComplete = false;
  }
}

void serialEvent() {
  while (Serial.available()) {
    char inChar = (char)Serial.read();
    inputString += inChar;
    if (inChar == '\\n') {
      stringComplete = true;
    }
  }
}

void processCommand(String command) {
  Serial.print("Raw Input: ");
  Serial.println(command);
  command.trim();

  // CHECK FOR CLEANING MODE
  if (command.equalsIgnoreCase("CLEAN")) {
    runCleaningCycle();
    return;
  }

  // STANDARD DISPENSE
  // Array to hold the target mL for each pump
  // Index 0=Water, 1=Cola, 2=Soda, 3=Sugar, 4=Lemon, 5=Orange
  int targetML[6] = {0, 0, 0, 0, 0, 0};

  // Parse CSV
  int parsedCount = sscanf(command.c_str(), "%d,%d,%d,%d,%d,%d", 
                           &targetML[0], &targetML[1], &targetML[2], 
                           &targetML[3], &targetML[4], &targetML[5]);

  Serial.print("Parsed items: "); Serial.println(parsedCount);
  
  int pins[6] = {PIN_WATER, PIN_COLA, PIN_SODA, PIN_SUGAR, PIN_LEMON, PIN_ORANGE};

  for(int i=0; i<6; i++) {
     if (targetML[i] > 0) {
        pump(pins[i], targetML[i], pumpDelays[i]);
     }
  }

  Serial.println("Done");
}

void runCleaningCycle() {
  Serial.println("STARTING CLEANING CYCLE...");
  int pins[6] = {PIN_WATER, PIN_COLA, PIN_SODA, PIN_SUGAR, PIN_LEMON, PIN_ORANGE};
  
  for(int i=0; i<6; i++) {
    Serial.print("Cleaning Pump on Pin "); Serial.println(pins[i]);
    
    digitalWrite(pins[i], LOW); // ON
    delay(20000);               // 20 Seconds
    digitalWrite(pins[i], HIGH); // OFF
    
    delay(1000); // Pause between pumps
  }
  Serial.println("Cleaning Complete.");
}

void pump(int pin, int ml, int msPerML) {
  if (ml <= 0) return;
  
  long duration = (long)ml * (long)msPerML;
  
  Serial.print("Pumping pin "); Serial.print(pin);
  Serial.print(" for "); Serial.print(duration); Serial.println("ms");

  digitalWrite(pin, LOW); 
  delay(duration);
  digitalWrite(pin, HIGH);
  
  delay(200); 
}
`;