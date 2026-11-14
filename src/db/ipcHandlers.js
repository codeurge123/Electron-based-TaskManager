import { ipcMain } from 'electron';

export default function setupIpcHandlers(db) {
  ipcMain.handle('tasks:add', (_, title) => {
    return db.addTask(title);
  });

  ipcMain.handle('tasks:delete', (_, id) => {
    return db.deleteTask(id);
  });

  ipcMain.handle('tasks:mark-completed', (_, id, completed) => {
    return db.markTaskCompleted(id, completed);
  });

  ipcMain.handle('tasks:get-all', () => {
    return db.getAllTasks();
  });
}