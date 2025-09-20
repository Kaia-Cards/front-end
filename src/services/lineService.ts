import liff from '@line/liff';

interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

class LineService {
  private isInitialized = false;
  private liffId = '2006555488-W5NlAv2o';

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await liff.init({ liffId: this.liffId });
      this.isInitialized = true;
      console.log('LINE LIFF initialized successfully');
    } catch (error) {
      console.error('Failed to initialize LINE LIFF:', error);
      throw error;
    }
  }

  async login(): Promise<LineProfile> {
    await this.initialize();

    if (!liff.isLoggedIn()) {
      liff.login();
      throw new Error('Redirecting to LINE login');
    }

    return await this.getProfile();
  }

  async getProfile(): Promise<LineProfile> {
    await this.initialize();

    if (!liff.isLoggedIn()) {
      throw new Error('User is not logged in to LINE');
    }

    try {
      const profile = await liff.getProfile();
      return {
        userId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
        statusMessage: profile.statusMessage
      };
    } catch (error) {
      console.error('Failed to get LINE profile:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    await this.initialize();
    liff.logout();
  }

  isLoggedIn(): boolean {
    return this.isInitialized && liff.isLoggedIn();
  }

  async sendMessage(message: string): Promise<void> {
    await this.initialize();

    if (!liff.isInClient()) {
      throw new Error('This feature is only available in LINE app');
    }

    try {
      await liff.sendMessages([
        {
          type: 'text',
          text: message
        }
      ]);
    } catch (error) {
      console.error('Failed to send LINE message:', error);
      throw error;
    }
  }

  async shareTargetPicker(message: string): Promise<void> {
    await this.initialize();

    try {
      await liff.shareTargetPicker([
        {
          type: 'text',
          text: message
        }
      ]);
    } catch (error) {
      console.error('Failed to share via LINE:', error);
      throw error;
    }
  }

  getEnvironment() {
    if (!this.isInitialized) return null;
    return {
      isInClient: liff.isInClient(),
      isLoggedIn: liff.isLoggedIn(),
      os: liff.getOS(),
      version: liff.getVersion(),
      language: liff.getLanguage(),
      isApiAvailable: {
        shareTargetPicker: liff.isApiAvailable('shareTargetPicker'),
        multipleLiff: liff.isApiAvailable('multipleLiff'),
        subwindow: liff.isApiAvailable('subwindow')
      }
    };
  }
}

export const lineService = new LineService();
export type { LineProfile };