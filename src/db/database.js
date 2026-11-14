import { app } from 'electron';
import path from 'node:path';
import Database from 'better-sqlite3'

class AppDatabase {
    constructor() {
        const dbPath = path.join(app.getPath('userData'), 'database.sqlite');

        this.db = new Database(dbPath); // here we the path of the sqlite database and now db has all the CRUD operation functionality to perform with db.

        // we have to use this WAL for the performance reasons : 
        this.db.pragma('journal_mode = WAL');

        this.setUpDatabase() // this function will create the tables if they are not already created in the database. as we create the object of this class

    }


    setUpDatabase() {

        this.db.exec(`
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                completed INTEGER NOT NULL DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('Database setup completed.');

    }

    addTask(title) {
        const stmt = this.db.prepare('INSERT INTO tasks (title) VALUES (?)');
        const info = stmt.run(title);
        return {
            id: info.lastInsertRowid,
            title: title,
            completed: 0,
            created_at: new Date().toISOString()
        };
    }


    deleteTask(id) {
        const stmt = this.db.prepare('DELETE FROM tasks WHERE id = ?');
        const info = stmt.run(id);
        return info.changes > 0; // returns true if a row was deleted
    }

    markTaskCompleted(id, completed) {
        const stmt = this.db.prepare('UPDATE tasks SET completed = ? WHERE id = ?');
        const info = stmt.run(completed ? 1 : 0, id);
        return info.changes > 0; // returns true if a row was updated
    }

    getAllTasks() {
        const stmt = this.db.prepare('SELECT * FROM tasks ORDER BY created_at DESC');
        return stmt.all();
    }

    close() {
        this.db.close();
        console.log('Database connection closed.');
    }

}

export default AppDatabase;

// using the IPC (Inter-Process Communication) we can send the data from the main process to the renderer process and vice versa. basically using IPC renderer process can send the request to the main process.