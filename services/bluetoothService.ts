import { DrinkRecipe, Ingredient } from '../types';

// NOTE: We are using the Web Serial API here.
export const isSerialSupported = (): boolean => {
  return typeof navigator !== 'undefined' && 'serial' in navigator;
};

export class BluetoothService {
  private port: any = null;
  private writer: any = null;
  private isSimulated: boolean = false;

  constructor() {
    if (typeof navigator !== 'undefined' && 'serial' in navigator) {
      // Cast navigator to any because the Web Serial API is experimental and types may be missing or default to unknown
      (navigator as any).serial.addEventListener('disconnect', (event: any) => {
        if (event.port === this.port) {
          console.log('Serial port physically disconnected');
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
      throw new Error('Web Serial is not supported in this browser. Try Chrome or Edge.');
    }

    try {
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 9600 });
      this.port = port;
      
      const textEncoder = new TextEncoderStream();
      textEncoder.readable.pipeTo(port.writable);
      this.writer = textEncoder.writable.getWriter();
      
      console.log('Serial connected successfully');
    } catch (error) {
      console.error('Serial Connection Error:', error);
      throw error;
    }
  }

  async connectSimulation(): Promise<void> {
    this.isSimulated = true;
    console.log('Simulation Mode Activated');
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
    const values = [
      Math.round(recipe[Ingredient.SODA]),
      Math.round(recipe[Ingredient.COLA]),
      Math.round(recipe[Ingredient.SUGAR]),
      Math.round(recipe[Ingredient.LEMON]),
      Math.round(recipe[Ingredient.SPICY_LEMON]),
      Math.round(recipe[Ingredient.ORANGE_JUICE]),
    ];

    const commandString = values.join(',') + '\n';
    await this.sendCommand(commandString);
  }

  async cleanSystem(): Promise<void> {
    await this.sendCommand("CLEAN\n");
  }

  private async sendCommand(cmd: string): Promise<void> {
    if (this.isSimulated) {
      console.log('%c SIMULATED OUTPUT: ' + cmd, 'background: #222; color: #bada55');
      return;
    }

    if (!this.writer) throw new Error('Not connected to a device.');

    try {
      await this.writer.write(cmd);
    } catch (error) {
      console.error('Failed to send command:', error);
      this.disconnect(); // If write fails, assume connection lost
      throw error;
    }
  }
}

export const bluetoothService = new BluetoothService();