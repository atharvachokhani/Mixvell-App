import { DrinkRecipe, Ingredient } from '../types';

// NOTE: We are using the Web Serial API here.
// The HC-05 uses Bluetooth Classic (SPP), which is NOT supported by the Web Bluetooth API.
// However, the HC-05 acts as a Serial Bridge.
// On Desktop: Pair HC-05 -> Creates Virtual COM Port -> Web Serial connects to COM Port.
// On Android: Web Serial works via USB OTG cable connected to the Arduino.
// Direct Wireless HC-05 connection on Android Chrome is technically impossible due to OS limitations.

export const isSerialSupported = (): boolean => {
  return typeof navigator !== 'undefined' && 'serial' in navigator;
};

export class BluetoothService {
  private port: any = null;
  private writer: any = null;
  private isSimulated: boolean = false;

  async connect(): Promise<void> {
    if (this.isSimulated) {
      this.isSimulated = false;
      return;
    }

    if (!isSerialSupported()) {
      throw new Error('Web Serial is not supported in this browser. Try Chrome or Edge.');
    }

    try {
      // Request a port and open a connection.
      // 9600 is the default baud rate for HC-05 and Arduino Serial.
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 9600 });
      
      this.port = port;
      
      // Setup the writer stream
      const textEncoder = new TextEncoderStream();
      const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
      this.writer = textEncoder.writable.getWriter();
      
      console.log('Serial connected successfully');
    } catch (error) {
      console.error('Serial Connection Error:', error);
      throw error;
    }
  }

  // Allow UI testing without hardware
  async connectSimulation(): Promise<void> {
    console.log("Entering Simulation Mode");
    await new Promise(resolve => setTimeout(resolve, 800)); // Fake delay
    this.isSimulated = true;
  }

  disconnect() {
    if (this.port) {
      // Closing serial ports properly is complex in JS, usually we just let the page reload handle it
      // or implement the full lock release logic. For this simple app, we just nullify.
      this.port = null;
      this.writer = null;
    }
    this.isSimulated = false;
  }

  isConnected(): boolean {
    return !!this.port || this.isSimulated;
  }

  /**
   * Sends the drink recipe to the Arduino via Serial.
   * Format: Water,Cola,Soda,Sugar,Lemon,Orange\n
   */
  async dispenseDrink(recipe: DrinkRecipe): Promise<void> {
    const values = [
      recipe[Ingredient.WATER],
      recipe[Ingredient.COLA],
      recipe[Ingredient.SODA],
      recipe[Ingredient.SUGAR],
      recipe[Ingredient.LEMON],
      recipe[Ingredient.ORANGE],
    ];

    const commandString = values.join(',') + '\n';

    if (this.isSimulated) {
      console.log('SIMULATED OUTPUT:', commandString);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Fake transmission time
      return;
    }

    if (!this.writer) {
      throw new Error('Not connected to a device.');
    }

    try {
      await this.writer.write(commandString);
      console.log('Sent command:', commandString);
    } catch (error) {
      console.error('Failed to send command:', error);
      throw error;
    }
  }
}

export const bluetoothService = new BluetoothService();