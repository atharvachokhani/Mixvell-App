import { DrinkRecipe, Ingredient } from '../types';

/**
 * SerialService handles the USB/Cable connection to the Arduino
 * using the browser's Web Serial API.
 */
export const isSerialSupported = (): boolean => {
  return typeof navigator !== 'undefined' && 'serial' in navigator;
};

export class SerialService {
  private port: any = null;
  private writer: any = null;
  private isSimulated: boolean = false;

  constructor() {
    if (isSerialSupported()) {
      (navigator as any).serial.addEventListener('disconnect', (event: any) => {
        if (event.port === this.port) {
          console.warn('USB Cable Unplugged');
          this.disconnect();
        }
      });
    }
  }

  async connect(): Promise<void> {
    if (this.isSimulated) {
      this.isSimulated = false;
    }

    if (!isSerialSupported()) {
      throw new Error('Web Serial is not supported. Please use Chrome, Edge, or Opera.');
    }

    try {
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 9600 });
      this.port = port;
      
      const textEncoder = new TextEncoderStream();
      textEncoder.readable.pipeTo(port.writable);
      this.writer = textEncoder.writable.getWriter();
      
      console.log('USB Serial connected successfully');
    } catch (error) {
      console.error('Serial Connection Error:', error);
      throw error;
    }
  }

  async connectSimulation(): Promise<void> {
    this.isSimulated = true;
    console.log('Simulation Mode: No USB hardware required');
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  disconnect() {
    if (this.writer) {
      try {
        this.writer.releaseLock();
      } catch (e) {}
    }
    if (this.port) {
      try {
        this.port.close();
      } catch (e) {}
    }
    this.port = null;
    this.writer = null;
    this.isSimulated = false;
  }

  isConnected(): boolean {
    return !!this.port || this.isSimulated;
  }

  isSimulatedMode(): boolean {
    return this.isSimulated;
  }

  async dispenseDrink(recipe: DrinkRecipe): Promise<void> {
    /**
     * UPDATED MAPPING:
     * Arduino Pin 2: Soda         (Index 0)
     * Arduino Pin 3: Cola         (Index 1)
     * Arduino Pin 4: Sugar Syrup  (Index 2)
     * Arduino Pin 5: Orange Juice (Index 3 - REDIRECTED FROM LEMON)
     * Arduino Pin 6: Spicy Lemon  (Index 4)
     * Arduino Pin 7: 0            (Index 5 - BROKEN PUMP)
     */
    const values = [
      Math.round(recipe[Ingredient.SODA] || 0),
      Math.round(recipe[Ingredient.COLA] || 0),
      Math.round(recipe[Ingredient.SUGAR] || 0),
      Math.round(recipe[Ingredient.ORANGE_JUICE] || 0), // Now on Lemon's pin
      Math.round(recipe[Ingredient.SPICY_LEMON] || 0),
      0, // Disabled broken orange pin
    ];

    const commandString = values.join(',') + '\n';
    await this.sendCommand(commandString);
  }

  async cleanSystem(): Promise<void> {
    await this.sendCommand("CLEAN\n");
  }

  private async sendCommand(cmd: string): Promise<void> {
    if (this.isSimulated) {
      console.log('%c SIMULATED USB OUT: ' + cmd, 'background: #222; color: #bada55; padding: 2px 5px; border-radius: 3px');
      return;
    }

    if (!this.writer) throw new Error('Hardware disconnected.');

    try {
      await this.writer.write(cmd);
    } catch (error) {
      console.error('Cable transmission error:', error);
      this.disconnect();
      throw error;
    }
  }
}

export const serialService = new SerialService();