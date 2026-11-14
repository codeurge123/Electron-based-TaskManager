import {contextBridge, ipcRenderer} from 'electron';

contextBridge.exposeInMainWorld('api', {
    addTask: (title) => ipcRenderer.invoke('tasks:add', title),
    deleteTask: (id) => ipcRenderer.invoke('tasks:delete', id),
    markTaskCompleted: (id, completed) => ipcRenderer.invoke('tasks:mark-completed', id, completed),
    getAllTasks: () => ipcRenderer.invoke('tasks:get-all'),
});