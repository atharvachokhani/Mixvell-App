export const ARDUINO_SKETCH = `
/*
 * Mixvell Mocktail Dispenser Firmware (v4.0 - Viscosity Calibration)
 * -----------------------------------
 * Hardware: Arduino Uno/Nano, HC-05 Bluetooth, 6-Channel Relay
 * 
 * UPDATE: This version includes per-pump calibration.
 * Thicker liquids (Syrup/Juice) need more time to pump 1mL than Water.
 */

// Pins definitions
const int PIN_WATER  = 2;
const int PIN_COLA   = 3;
const int PIN_SODA   = 4;
const int PIN_SUGAR  = 5;
const int PIN_LEMON  = 6;
const int PIN_ORANGE = 7;

// --- CALIBRATION CONFIGURATION ---
// Defines how many milliseconds it takes to pump 1mL for EACH pin.
// Index 0 = Pin 2, Index 1 = Pin 3, etc.
// Water/Soda (Thin) = ~100ms/mL
// Syrups (Thick) = ~200-300ms/mL (Needs longer to pump same amount)

int pumpDelays[6] = {
  100, // Pin 2 (Water) - Thin
  100, // Pin 3 (Cola) - Thin
  100, // Pin 4 (Soda) - Thin
  200, // Pin 5 (Sugar Syrup) - THICK! Slower pumping.
  200, // Pin 6 (Lemon Mix) - THICK! Slower pumping.
  200  // Pin 7 (Orange Juice) - THICK! Slower pumping.
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

  // Turn off all relays initially (Active LOW: HIGH = OFF)
  digitalWrite(PIN_WATER, HIGH);
  digitalWrite(PIN_COLA, HIGH);
  digitalWrite(PIN_SODA, HIGH);
  digitalWrite(PIN_SUGAR, HIGH);
  digitalWrite(PIN_LEMON, HIGH);
  digitalWrite(PIN_ORANGE, HIGH);

  Serial.println("Mixvell Dispenser Ready (v4.0).");
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

  // Array to hold the target mL for each pump
  // Index 0=Water, 1=Cola, 2=Soda, 3=Sugar, 4=Lemon, 5=Orange
  int targetML[6] = {0, 0, 0, 0, 0, 0};

  // Parse CSV: Water,Cola,Soda,Sugar,Lemon,Orange
  int parsedCount = sscanf(command.c_str(), "%d,%d,%d,%d,%d,%d", 
                           &targetML[0], &targetML[1], &targetML[2], 
                           &targetML[3], &targetML[4], &targetML[5]);

  Serial.print("Parsed items: "); Serial.println(parsedCount);
  
  // Define Pin Array for easy looping
  int pins[6] = {PIN_WATER, PIN_COLA, PIN_SODA, PIN_SUGAR, PIN_LEMON, PIN_ORANGE};

  // Dispense sequentially
  for(int i=0; i<6; i++) {
     if (targetML[i] > 0) {
        pump(pins[i], targetML[i], pumpDelays[i]);
     }
  }

  Serial.println("Done");
}

void pump(int pin, int ml, int msPerML) {
  if (ml <= 0) return;
  
  long duration = (long)ml * (long)msPerML;
  
  Serial.print("Pumping pin "); Serial.print(pin);
  Serial.print(" for "); Serial.print(ml);
  Serial.print("mL (Duration: "); Serial.print(duration); Serial.println("ms)");

  // TURN PUMP ON (Active LOW)
  digitalWrite(pin, LOW); 
  delay(duration);
  // TURN PUMP OFF
  digitalWrite(pin, HIGH);
  
  delay(200); // Short pause
}
`;