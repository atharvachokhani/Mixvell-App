export const ARDUINO_SKETCH = `
/*
 * Mixvell Mocktail Dispenser Firmware (v3.0 - Robust Parsing)
 * -----------------------------------
 * Hardware:
 * - Arduino Uno / Nano
 * - HC-05 Bluetooth Module
 * - 6-Channel Relay Module
 * 
 * Pins:
 * - D2: Water
 * - D3: Cola
 * - D4: Soda
 * - D5: Sugar Syrup
 * - D6: Lemon Mix
 * - D7: Orange Juice
 */

// --- CONFIGURATION ---
// Time in milliseconds to pump 1mL of liquid.
// CALIBRATION REQUIRED: Measure how long it takes to pump 100mL, then divide by 100.
// Example: If 100mL takes 10 seconds (10000ms), then MS_PER_ML = 100.
const int MS_PER_ML = 100; 

// Pins definitions
const int PIN_WATER  = 2;
const int PIN_COLA   = 3;
const int PIN_SODA   = 4;
const int PIN_SUGAR  = 5;
const int PIN_LEMON  = 6;
const int PIN_ORANGE = 7;

// --- GLOBALS ---
String inputString = "";         // A String to hold incoming data
boolean stringComplete = false;  // Whether the string is complete

void setup() {
  // Initialize Serial at 9600 baud (Standard for HC-05)
  Serial.begin(9600);
  
  // Reserve memory to prevent fragmentation
  inputString.reserve(200);

  // Initialize Built-in LED for debugging
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

  Serial.println("Mixvell Dispenser Ready (v3.0).");
}

void loop() {
  // Check for serial input
  if (stringComplete) {
    // BLINK LED to indicate data received (Debug)
    digitalWrite(LED_BUILTIN, HIGH);
    delay(100);
    digitalWrite(LED_BUILTIN, LOW);
    
    processCommand(inputString);
    
    // Clear for next command
    inputString = "";
    stringComplete = false;
  }
}

/*
  SerialEvent occurs whenever new data comes in the hardware serial RX. 
  This routine is run between each time loop() runs.
*/
void serialEvent() {
  while (Serial.available()) {
    char inChar = (char)Serial.read();
    inputString += inChar;
    // Look for newline character to signify end of command
    if (inChar == '\\n') {
      stringComplete = true;
    }
  }
}

void processCommand(String command) {
  Serial.print("Raw Input: ");
  Serial.println(command);
  
  // Clean the string (remove whitespace/newlines)
  command.trim();

  // Variables to hold parsed values
  int v[6] = {0, 0, 0, 0, 0, 0};

  // Use sscanf for standard CSV parsing
  // Format: Water,Cola,Soda,Sugar,Lemon,Orange
  int parsedCount = sscanf(command.c_str(), "%d,%d,%d,%d,%d,%d", 
                           &v[0], &v[1], &v[2], &v[3], &v[4], &v[5]);

  Serial.print("Parsed items: ");
  Serial.println(parsedCount);
  
  // Debug output to verify what the Arduino "sees"
  Serial.print("1. Water:  "); Serial.println(v[0]);
  Serial.print("2. Cola:   "); Serial.println(v[1]);
  Serial.print("3. Soda:   "); Serial.println(v[2]);
  Serial.print("4. Sugar:  "); Serial.println(v[3]);
  Serial.print("5. Lemon:  "); Serial.println(v[4]);
  Serial.print("6. Orange: "); Serial.println(v[5]);

  // Dispense sequentially
  if (v[0] > 0) pump(PIN_WATER, v[0]);
  if (v[1] > 0) pump(PIN_COLA, v[1]);
  if (v[2] > 0) pump(PIN_SODA, v[2]);
  if (v[3] > 0) pump(PIN_SUGAR, v[3]);
  if (v[4] > 0) pump(PIN_LEMON, v[4]);
  if (v[5] > 0) pump(PIN_ORANGE, v[5]);

  Serial.println("Done");
}

void pump(int pin, int ml) {
  if (ml <= 0) return;
  
  long duration = ml * MS_PER_ML;
  
  Serial.print("Pumping pin ");
  Serial.print(pin);
  Serial.print(" for ");
  Serial.print(ml);
  Serial.println("mL");

  // TURN PUMP ON (Active LOW)
  digitalWrite(pin, LOW); 
  
  delay(duration);
  
  // TURN PUMP OFF
  digitalWrite(pin, HIGH);
  
  delay(200); // Short pause to let pressure settle
}
`;