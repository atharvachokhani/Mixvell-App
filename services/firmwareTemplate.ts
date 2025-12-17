export const ARDUINO_SKETCH = `
/*
 * Mixvell Mocktail Dispenser Firmware (v9.2 - Spicy Lemon Update)
 * -----------------------------------
 * Hardware: Arduino Uno/Nano, HC-05 Bluetooth, 6-Channel Relay
 * 
 * PINS MAPPING:
 * 2: Soda
 * 3: Cola
 * 4: Sugar Syrup
 * 5: Lemon Mix
 * 6: Spicy Lemon Mix (Replaces Orange)
 * 7: Pineapple Juice
 * 
 * COMMANDS:
 * 1. CSV Recipe: "10,20,0,5,0,0" (Soda,Cola,Sugar,Lemon,Spicy,Pineapple in mL)
 * 2. Clean Mode: "CLEAN" (Flushes all pumps for 20s)
 * 3. Manual Pump: "PUMP <Index> <mL>" (e.g., "PUMP 0 20")
 *    Index: 0=Soda, 1=Cola, 2=Sugar, 3=Lemon, 4=Spicy, 5=Pineapple
 */

// Pins definitions
const int PIN_SODA      = 2;
const int PIN_COLA      = 3;
const int PIN_SUGAR     = 4;
const int PIN_LEMON     = 5;
const int PIN_SPICY     = 6; // Previously Orange
const int PIN_PINEAPPLE = 7;

// --- CALIBRATION CONFIGURATION ---
// Milliseconds per mL. Increase this value for thicker liquids.
// Soda/Water = ~100. Syrups = ~150-250.
int pumpDelays[6] = {
  100, // Pin 2 (Soda) - Thin
  150, // Pin 3 (Cola) - Medium Concentrate
  200, // Pin 4 (Sugar Syrup) - THICK
  200, // Pin 5 (Lemon Mix) - THICK
  200, // Pin 6 (Spicy Lemon Mix) - THICK
  200  // Pin 7 (Pineapple Juice) - THICK
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
  pinMode(PIN_SODA, OUTPUT);
  pinMode(PIN_COLA, OUTPUT);
  pinMode(PIN_SUGAR, OUTPUT);
  pinMode(PIN_LEMON, OUTPUT);
  pinMode(PIN_SPICY, OUTPUT);
  pinMode(PIN_PINEAPPLE, OUTPUT);

  // Turn off all relays (Active LOW)
  digitalWrite(PIN_SODA, HIGH);
  digitalWrite(PIN_COLA, HIGH);
  digitalWrite(PIN_SUGAR, HIGH);
  digitalWrite(PIN_LEMON, HIGH);
  digitalWrite(PIN_SPICY, HIGH);
  digitalWrite(PIN_PINEAPPLE, HIGH);

  Serial.println("Mixvell Dispenser Ready (v9.2).");
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

  // MANUAL PUMP CONTROL
  // Format: "PUMP <Index> <mL>" (e.g. "PUMP 0 20")
  if (command.startsWith("PUMP")) {
    int pIdx = -1;
    int pML = 0;
    
    if (command.length() > 5) {
      String params = command.substring(5);
      int spaceIdx = params.indexOf(' ');
      if (spaceIdx > 0) {
        pIdx = params.substring(0, spaceIdx).toInt();
        pML = params.substring(spaceIdx + 1).toInt();
      } else {
        pIdx = params.toInt();
        pML = 10; // Default 10ml if not specified
      }
      
      if (pIdx >= 0 && pIdx <= 5 && pML > 0) {
         int pins[6] = {PIN_SODA, PIN_COLA, PIN_SUGAR, PIN_LEMON, PIN_SPICY, PIN_PINEAPPLE};
         Serial.print("Manual Dispense: Pump "); Serial.print(pIdx);
         Serial.print(" Vol "); Serial.println(pML);
         pump(pins[pIdx], pML, pumpDelays[pIdx]);
      } else {
         Serial.println("Error: Invalid index or volume");
      }
    }
    Serial.println("Done");
    return;
  }

  // STANDARD DISPENSE
  // Index 0=Soda, 1=Cola, 2=Sugar, 3=Lemon, 4=Spicy, 5=Pineapple
  int targetML[6] = {0, 0, 0, 0, 0, 0};

  // Parse CSV
  int parsedCount = sscanf(command.c_str(), "%d,%d,%d,%d,%d,%d", 
                           &targetML[0], &targetML[1], &targetML[2], 
                           &targetML[3], &targetML[4], &targetML[5]);

  Serial.print("Parsed items: "); Serial.println(parsedCount);
  
  int pins[6] = {PIN_SODA, PIN_COLA, PIN_SUGAR, PIN_LEMON, PIN_SPICY, PIN_PINEAPPLE};

  for(int i=0; i<6; i++) {
     if (targetML[i] > 0) {
        pump(pins[i], targetML[i], pumpDelays[i]);
     }
  }

  Serial.println("Done");
}

void runCleaningCycle() {
  Serial.println("STARTING CLEANING CYCLE...");
  int pins[6] = {PIN_SODA, PIN_COLA, PIN_SUGAR, PIN_LEMON, PIN_SPICY, PIN_PINEAPPLE};
  
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