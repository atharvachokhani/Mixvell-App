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
      
      // CRITICAL FIX: Check if the port is already open before calling open()
      // If port.readable is not null, the port is already open.
      if (!port.readable) {
        await port.open({ baudRate: 9600 });
      } else {
        console.log('Port was already open. Reusing connection.');
      }
      
      this.port = port;
      
      // Setup the writer stream only if it's not already set up or locked
      if (!this.writer || (this.port.writable && !this.port.writable.locked)) {
        // If the port is open but writable is locked, it usually means we already have a writer attached
        // from a previous session (singleton pattern).
        
        if (this.port.writable.locked) {
           // Writer exists and port is locked. We assume the existing writer is valid.
           if (!this.writer) {
             // This is a rare edge case: port locked but we lost the writer reference.
             // We can't recover easily without a hard reload.
             throw new Error("Port is locked by another process. Please refresh the page.");
           }
        } else {
           const textEncoder = new TextEncoderStream();
           const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
           this.writer = textEncoder.writable.getWriter();
        }
      }
      
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
   * Format: Soda,Cola,Sugar,Lemon,Orange\n
   */
  async dispenseDrink(recipe: DrinkRecipe): Promise<void> {
    // Ensure all values are Integers
    const values = [
      Math.round(recipe[Ingredient.SODA]),
      Math.round(recipe[Ingredient.COLA]),
      Math.round(recipe[Ingredient.SUGAR]),
      Math.round(recipe[Ingredient.LEMON]),
      Math.round(recipe[Ingredient.ORANGE]),
    ];

    const commandString = values.join(',') + '\n';

    await this.sendCommand(commandString);
  }

  /**
   * Sends "CLEAN" command to Arduino.
   * Triggers a 20s flush cycle on all pumps.
   */
  async cleanSystem(): Promise<void> {
    await this.sendCommand("CLEAN\n");
  }

  /**
   * Sends a ping (0 values) to test the connection.
   */
  async testConnection(): Promise<void> {
    await this.sendCommand("0,0,0,0,0\n");
  }

  private async sendCommand(cmd: string): Promise<void> {
    if (this.isSimulated) {
      console.log('SIMULATED OUTPUT:', cmd);
      await new Promise(resolve => setTimeout(resolve, 500));
      return;
    }

    if (!this.writer) {
      // Recovery attempt
      if (this.port && this.port.writable && !this.port.writable.locked) {
         const textEncoder = new TextEncoderStream();
         textEncoder.readable.pipeTo(this.port.writable);
         this.writer = textEncoder.writable.getWriter();
      } else {
         throw new Error('Not connected to a device.');
      }
    }

    try {
      await this.writer.write(cmd);
      console.log('Sent command:', cmd);
    } catch (error) {
      console.error('Failed to send command:', error);
      throw error;
    }
  }
}

export const bluetoothService = new BluetoothService();