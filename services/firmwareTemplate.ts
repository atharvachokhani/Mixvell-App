export const ARDUINO_SKETCH = `
/*
 * Mixvell Mocktail Dispenser Firmware
 * -----------------------------------
 * Hardware:
 * - Arduino Uno / Nano
 * - HC-05 Bluetooth Module (or USB Serial)
 * - 6-Channel Relay Module (Active LOW typically)
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
  // Initialize Serial
  Serial.begin(9600);
  inputString.reserve(200);

  // Initialize Pump Pins
  pinMode(PIN_WATER, OUTPUT);
  pinMode(PIN_COLA, OUTPUT);
  pinMode(PIN_SODA, OUTPUT);
  pinMode(PIN_SUGAR, OUTPUT);
  pinMode(PIN_LEMON, OUTPUT);
  pinMode(PIN_ORANGE, OUTPUT);

  // Turn off all relays initially (Assuming Active LOW relays, HIGH = OFF)
  // If your relays are Active HIGH, change these to LOW.
  digitalWrite(PIN_WATER, HIGH);
  digitalWrite(PIN_COLA, HIGH);
  digitalWrite(PIN_SODA, HIGH);
  digitalWrite(PIN_SUGAR, HIGH);
  digitalWrite(PIN_LEMON, HIGH);
  digitalWrite(PIN_ORANGE, HIGH);

  Serial.println("Mixvell Dispenser Ready.");
}

void loop() {
  // Check for serial input
  if (stringComplete) {
    processCommand(inputString);
    // clear the string:
    inputString = "";
    stringComplete = false;
  }
}

/*
  SerialEvent occurs whenever a new data comes in the hardware serial RX. 
  This routine is run between each time loop() runs.
*/
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
  Serial.println("Processing...");
  
  // Expected format: "Water,Cola,Soda,Sugar,Lemon,Orange\\n"
  // Example: "0,0,50,10,10,0"
  
  int values[6];
  int currentIndex = 0;
  int lastCommaIndex = -1;

  for (int i = 0; i < 6; i++) {
    int nextCommaIndex = command.indexOf(',', lastCommaIndex + 1);
    
    // Handle the last value (no comma after it)
    if (nextCommaIndex == -1) {
      nextCommaIndex = command.length();
    }
    
    String valStr = command.substring(lastCommaIndex + 1, nextCommaIndex);
    values[i] = valStr.toInt();
    lastCommaIndex = nextCommaIndex;
  }

  // Dispense sequentially to ensure stable power supply
  if (values[0] > 0) pump(PIN_WATER, values[0]);
  if (values[1] > 0) pump(PIN_COLA, values[1]);
  if (values[2] > 0) pump(PIN_SODA, values[2]);
  if (values[3] > 0) pump(PIN_SUGAR, values[3]);
  if (values[4] > 0) pump(PIN_LEMON, values[4]);
  if (values[5] > 0) pump(PIN_ORANGE, values[5]);

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

  // ACTIVE LOW LOGIC (LOW = ON)
  digitalWrite(pin, LOW); 
  delay(duration);
  digitalWrite(pin, HIGH);
  
  delay(200); // Short pause between ingredients
}
`;
