import React, { useState, useEffect, useContext, createContext } from 'react';
import './App.css';

// Context Setup
const TaskContext = createContext();

export const useTaskContext = () => useContext(TaskContext);

const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);

  // Fetch tasks from localStorage on initial load
  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    setTasks(storedTasks);
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (title) => {
    const newTask = { id: Date.now(), title };
    setTasks([...tasks, newTask]);
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const updateTask = (id, updatedTitle) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, title: updatedTitle } : task));
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, deleteTask, updateTask }}>
      {children}
    </TaskContext.Provider>
  );
};

// Components
const TaskForm = ({ taskToEdit, onCancel }) => {
  const [title, setTitle] = useState(taskToEdit?.title || '');
  const { addTask, updateTask } = useTaskContext();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (taskToEdit) {
      updateTask(taskToEdit.id, title);
    } else {
      addTask(title);
    }
    setTitle('');
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter task title"
        required
      />
      <button type="submit">{taskToEdit ? 'Update' : 'Add'} Task</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
};

const TaskList = () => {
  const { tasks, deleteTask } = useTaskContext();
  const [isEditing, setIsEditing] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  const handleEdit = (task) => {
    setTaskToEdit(task);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTaskToEdit(null);
  };

  return (
    <div>
      {isEditing ? (
        <TaskForm taskToEdit={taskToEdit} onCancel={handleCancel} />
      ) : (
        <>
          <TaskForm onCancel={handleCancel} />
          <ul>
            {tasks.map((task) => (
              <li key={task.id}>
                {task.title}
                <button onClick={() => handleEdit(task)}>Edit</button>
                <button onClick={() => deleteTask(task.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

// Main App Component
const App = () => (
  <TaskProvider>
    <div className="App">
      <h1>Task Manager</h1>
      <TaskList />
    </div>
  </TaskProvider>
);

export default App;
