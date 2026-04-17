import { app, dialog } from 'electron';
import { logger } from '../logger.ts'
import { ipcMainService } from '../../ipcManager'
import { notify } from '../notifications/index.ts';

class MusicVisualization {
  
  initialize() {
    this.registerHandlerEvents()
  }

  registerHandlerEvents() {
    ipcMainService.handle('app:select-music-file', async () => {
      const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
          { name: 'Music Files', extensions: ['mp3', 'wav', 'ogg'] }
        ]
      })
      console.log('result: ', result)
      return result
    })
  }
}

export const musicVisualization = new MusicVisualization()