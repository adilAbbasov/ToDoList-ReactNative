import React, { useState, useEffect, useRef } from 'react';
import { KeyboardAvoidingView, StyleSheet, Text, View, TextInput, TouchableOpacity, Keyboard, ScrollView, Modal, Button, TouchableHighlight, TouchableWithoutFeedback, TouchableHighlightBase } from 'react-native';
import Task from './components/Task';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as FileSystem from 'expo-file-system';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

export default function App() {
  const [taskName, setTaskName] = useState('');
  const [taskDeadline, setTaskDeadline] = useState(new Date());
  const [toDoTasks, setToDoTasks] = useState([]);
  const [inProgressTasks, setInProgressTasks] = useState([]);
  const [doneTasks, setDoneTasks] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState(toDoTasks);
  const [taskType, setTaskType] = useState('todo');
  const [taskColor, setTaskColor] = useState('orange');
  const [allTasks, setAllTasks] = useState({ toDoTasks, inProgressTasks, doneTasks });
  const [isDialogVisible, setDialogVisible] = useState(false);
  const [warning, setWarning] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [editing, setEditing] = useState(false);
  const [toBeEditedTaskIndex, setToBeEditedTaskIndex] = useState();
  const allTasksPath = `${FileSystem.documentDirectory}/all-tasks.json`;
  const isInitialRender = useRef(true);

  useEffect(() => {
    if (!isInitialRender.current) {
      saveAllTasks();
    } else {
      isInitialRender.current = false;
    }
  }, [allTasks]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    async function loadAllTasks() {
      try {
        const fileInfo = await FileSystem.getInfoAsync(allTasksPath);

        if (fileInfo.exists) {
          const jsonString = await FileSystem.readAsStringAsync(allTasksPath, { encoding: FileSystem.EncodingType.UTF8 });
          const loadedTasks = JSON.parse(jsonString);

          const loadedToDoTasks = loadedTasks.toDoTasks || [];
          const loadedInProgressTasks = loadedTasks.inProgressTasks || [];
          const loadedDoneTasks = loadedTasks.doneTasks || [];

          setToDoTasks(loadedToDoTasks);
          setInProgressTasks(loadedInProgressTasks);
          setDoneTasks(loadedDoneTasks);

          setSelectedTasks(loadedToDoTasks);
          setAllTasks({
            ...allTasks,
            toDoTasks: loadedToDoTasks,
            inProgressTasks: loadedInProgressTasks,
            doneTasks: loadedDoneTasks
          });
        }
      } catch (error) {
        console.error('Error loading combined arrays:', error);
      }
    }

    loadAllTasks();
  }, []);

  async function saveAllTasks() {
    try {
      const jsonString = JSON.stringify(allTasks);
      await FileSystem.writeAsStringAsync(allTasksPath, jsonString, { encoding: FileSystem.EncodingType.UTF8 });

      console.log('All tasks saved to a file.');
    } catch (error) {
      console.error('Error saving all tasks:', error);
    }
  };

  const handleAddTask = () => {
    Keyboard.dismiss();

    if (taskName.trim() === '') {
      showWarningMessage('Task name cannot be empty');
    } else {
      const newTask = {
        type: 'todo',
        name: taskName,
        deadline: taskDeadline.toLocaleDateString(),
      };

      setSelectedTasks([...selectedTasks, newTask]);
      setToDoTasks([...toDoTasks, newTask]);
      setAllTasks({ ...allTasks, toDoTasks: [...toDoTasks, newTask] })
      setTaskName('');
      setTaskDeadline(new Date());
      closeDialog();
    }
  };

  const handleEditTask = (index) => {
    const selectedTask = selectedTasks[index];

    const dateParts = selectedTask.deadline.split('/');
    const month = parseInt(dateParts[0]) - 1;
    const day = parseInt(dateParts[1]);
    const year = parseInt(dateParts[2]);
    const dateObject = new Date(year, month, day);

    setTaskName(selectedTask.name);
    setTaskDeadline(dateObject);
    setTaskType(selectedTask.type);

    setEditing(true);
    setToBeEditedTaskIndex(index);
    setDialogVisible(true);
  };

  const handleSaveEditedTask = () => {
    const taskIndex = toBeEditedTaskIndex;
    const selectedTask = selectedTasks[taskIndex];
    let updatedTasks = {};

    const updatedTask = {
      ...selectedTask,
      name: taskName,
      deadline: taskDeadline.toLocaleDateString(),
    };

    setSelectedTasks((prevTasks) => {
      const updatedTasks = [...prevTasks];
      updatedTasks[taskIndex] = updatedTask;
      return updatedTasks;
    });

    switch (selectedTask.type) {
      case 'todo':
        const updatedToDoTasks = [...toDoTasks];
        updatedToDoTasks[taskIndex] = updatedTask;
        setToDoTasks(updatedToDoTasks);

        updatedTasks = {
          toDoTasks: updatedToDoTasks,
          inProgressTasks,
          doneTasks,
        };

        break;
      case 'inprogress':
        const updatedInProgressTasks = [...inProgressTasks];
        updatedInProgressTasks[taskIndex] = updatedTask;
        setInProgressTasks(updatedInProgressTasks);

        updatedTasks = {
          toDoTasks,
          inProgressTasks: updatedInProgressTasks,
          doneTasks,
        };

        break;
      case 'done':
        const updatedDoneTasks = [...doneTasks];
        updatedDoneTasks[taskIndex] = updatedTask;
        setDoneTasks(updatedDoneTasks);

        updatedTasks = {
          toDoTasks,
          inProgressTasks,
          doneTasks: updatedDoneTasks,
        };

        break;
      default:
        break;
    }

    setAllTasks((prevAllTasks) => ({ ...prevAllTasks, ...updatedTasks }));
    setEditing(false);
    closeDialog();
  };

  const handleDeleteTask = (index) => {
    const selectedTask = selectedTasks[index];
    let updatedTasks = {};

    setSelectedTasks((prevTasks) => prevTasks.filter((_, i) => i !== index));

    switch (selectedTask.type) {
      case 'todo':
        setToDoTasks((prevArray) => prevArray.filter((_, i) => i !== index));

        updatedTasks = {
          toDoTasks: toDoTasks.filter((_, i) => i !== index),
          inProgressTasks,
          doneTasks,
        };

        break;
      case 'inprogress':
        setInProgressTasks((prevArray) => prevArray.filter((_, i) => i !== index));

        updatedTasks = {
          toDoTasks,
          inProgressTasks: inProgressTasks.filter((_, i) => i !== index),
          doneTasks,
        };

        break;
      case 'done':
        setDoneTasks((prevArray) => prevArray.filter((_, i) => i !== index));

        updatedTasks = {
          toDoTasks,
          inProgressTasks,
          doneTasks: doneTasks.filter((_, i) => i !== index),
        };

        break;
      default:
        break;
    }

    setAllTasks((prevAllTasks) => ({ ...prevAllTasks, ...updatedTasks }));
  };

  const handleInfoTask = (index) => {
    const selectedTask = selectedTasks[index];

    alert(`Name: ${selectedTask.name}\n\nDeadline: ${selectedTask.deadline}\n\nTask type: ${selectedTask.type}`);
  };

  const handleTasksChange = (array, type, color) => {
    setSelectedTasks(array);
    setTaskType(type);
    setTaskColor(color);
  };

  const moveTaskForward = (type, index) => {
    const movedTask = selectedTasks[index];
    let updatedTasks = {};

    setSelectedTasks((prevArray) => prevArray.filter((_, i) => i !== index));

    switch (type) {
      case 'todo':
        setToDoTasks((prevArray) => prevArray.filter((_, i) => i !== index));
        setInProgressTasks([...inProgressTasks, { ...movedTask, type: 'inprogress' }]);

        updatedTasks = {
          toDoTasks: toDoTasks.filter((_, i) => i !== index),
          inProgressTasks: [...inProgressTasks, { ...movedTask, type: 'inprogress' }],
          doneTasks,
        };

        break;
      case 'inprogress':
        setInProgressTasks((prevArray) => prevArray.filter((_, i) => i !== index));
        setDoneTasks([...doneTasks, { ...movedTask, type: 'done' }]);

        updatedTasks = {
          toDoTasks,
          inProgressTasks: inProgressTasks.filter((_, i) => i !== index),
          doneTasks: [...doneTasks, { ...movedTask, type: 'done' }],
        };

        break;
      default:
        break;
    }

    setAllTasks((prevAllTasks) => ({ ...prevAllTasks, ...updatedTasks }));
  };

  const moveTaskBackward = (type, index) => {
    const movedTask = selectedTasks[index];
    let updatedTasks = {};

    setSelectedTasks((prevArray) => prevArray.filter((_, i) => i !== index));

    switch (type) {
      case 'inprogress':
        setInProgressTasks((prevArray) => prevArray.filter((_, i) => i !== index));
        setToDoTasks([...toDoTasks, { ...movedTask, type: 'todo' }]);

        updatedTasks = {
          toDoTasks: [...toDoTasks, { ...movedTask, type: 'todo' }],
          inProgressTasks: inProgressTasks.filter((_, i) => i !== index),
          doneTasks,
        };

        break;
      case 'done':
        setDoneTasks((prevArray) => prevArray.filter((_, i) => i !== index));
        setInProgressTasks([...inProgressTasks, { ...movedTask, type: 'inprogress' }]);

        updatedTasks = {
          toDoTasks,
          inProgressTasks: [...inProgressTasks, { ...movedTask, type: 'inprogress' }],
          doneTasks: doneTasks.filter((_, i) => i !== index),
        };

        break;
      default:
        break;
    }

    setAllTasks((prevAllTasks) => ({ ...prevAllTasks, ...updatedTasks }));
  };

  const closeDialog = () => {
    setTaskName('');
    setTaskDeadline(new Date());

    if (editing) {
      setEditing(false);
    }

    setDialogVisible(false);
  };

  const getCurrentDate = () => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    var hours = new Date().getUTCHours();
    var date = new Date().getUTCDate();
    var month = months[new Date().getUTCMonth()];
    var year = new Date().getUTCFullYear();
    var day = days[new Date().getUTCDay()];

    if (hours + 4 > 23) {
      date += 1;
    }

    return date + ' ' + month + ' ' + year + ', ' + day;
  };

  const hideDatePicker = () => {
    setShowDatePicker(false);
  };

  const handleDateConfirm = (date) => {
    setTaskDeadline(date);
    hideDatePicker();
  };

  const showWarningMessage = (message) => {
    setWarning(message);
    setShowWarning(true);

    setTimeout(() => {
      setShowWarning(false);
      setWarning('');
    }, 3000);
  };

  //

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1
        }}
        keyboardShouldPersistTaps='handled'
      >
        {showWarning && (
          <View style={styles.warning}>
            <Text style={styles.warningMessage}>{warning}</Text>
          </View>
        )}

        <View style={styles.tasksWrapper}>
          <View style={styles.tasksHeader}>
            <Text style={styles.sectionTitle}>Today</Text>

            <Text style={styles.currentTime}>{currentTime.toLocaleTimeString()}</Text>
          </View>

          <Text style={styles.sectionDate}>{getCurrentDate()}</Text>

          <View style={styles.taskTypes}>
            <TouchableOpacity onPress={() => handleTasksChange(toDoTasks, 'todo', 'orange')}>
              <View style={[styles.taskType, { backgroundColor: 'orange' }]}>
                <Text style={styles.typeText}>To Do</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleTasksChange(inProgressTasks, 'inprogress', 'deepskyblue')}>
              <View style={[styles.taskType, { backgroundColor: 'deepskyblue' }]}>
                <Text style={styles.typeText}>In Progress</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleTasksChange(doneTasks, 'done', 'forestgreen')}>
              <View style={[styles.taskType, { backgroundColor: 'forestgreen' }]}>
                <Text style={styles.typeText}>Done</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.items}>
            {
              selectedTasks.map((task, index) => {
                return (
                  <Task key={task.type + index} index={index} type={task.type} name={task.name} deadline={task.deadline} color={taskColor} moveForward={moveTaskForward} moveBackward={moveTaskBackward} handleEdit={handleEditTask} handleDelete={handleDeleteTask} handleInfo={handleInfoTask} />
                )
              })
            }
          </View>
        </View>
      </ScrollView>

      {(taskType == 'todo' || editing) && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.writeTaskWrapper}
        >
          {!editing && (
            <TouchableOpacity onPress={() => setDialogVisible(true)}>
              <View style={styles.addWrapper}>
                <Icon
                  name="plus"
                  size={35}
                  color="grey"
                />
              </View>
            </TouchableOpacity>
          )}

          <Modal visible={isDialogVisible} transparent={true}
            animationType='fade' >
            <View style={styles.centeredDialog}>
              <View style={styles.dialogView}>
                <Text style={{ fontSize: 28, fontWeight: '500' }}>New Task</Text>

                <TextInput
                  value={taskName}
                  onChangeText={(text) => setTaskName(text)}
                  placeholder="Task name"
                  style={styles.dialogInput}
                />

                <View style={styles.datePicker}>
                  <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                    <Icon
                      name="calendar"
                      size={30}
                      color="grey"
                    />
                  </TouchableOpacity>

                  <DateTimePickerModal
                    isVisible={showDatePicker}
                    mode="date"
                    minimumDate={new Date()}
                    onConfirm={handleDateConfirm}
                    onCancel={hideDatePicker}
                  />
                  <Text style={{ fontSize: 22, fontWeight: '500', color: 'gray' }}>{taskDeadline.toLocaleDateString()}</Text>
                </View>

                <View style={styles.dialogButtons}>
                  <TouchableHighlight style={styles.dialogButton} onPress={editing ? handleSaveEditedTask : handleAddTask} underlayColor="lightgrey">
                    <Text style={styles.buttonText}>Save</Text>
                  </TouchableHighlight>
                  <TouchableHighlight style={[styles.dialogButton, { backgroundColor: 'orangered' }]} onPress={closeDialog} underlayColor="lightgrey">
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableHighlight>
                </View>
              </View>
            </View>
          </Modal>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f2f4',
  },
  tasksWrapper: {
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 60,
    fontWeight: '700',
  },
  currentTime: {
    marginTop: 15,
    fontSize: 20,
    fontWeight: '500',
    color: 'grey'
  },
  sectionDate: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: '500',
    color: '#999'
  },
  taskTypes: {
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  taskType: {
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderRadius: 60,
    borderColor: '#C0C0C0',
    borderWidth: 1,
  },
  items: {
    marginTop: 30,
  },
  writeTaskWrapper: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addWrapper: {
    width: 70,
    height: 70,
    backgroundColor: '#fff',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#C0C0C0',
    borderWidth: 5,
  },
  typeText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600'
  },
  centeredDialog: {
    flex: 1,
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)'
  },
  dialogView: {
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    padding: 20,
    gap: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  dialogButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  dialogButton: {
    width: '47%',
    padding: 10,
    backgroundColor: 'green',
    borderRadius: 20,
  },
  dialogInput: {
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 23,
  },
  buttonText: {
    fontSize: 25,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  datePicker: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingVertical: 3,
  },
  warning: {
    backgroundColor: 'red',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 13,
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 100,
  },
  warningMessage: {
    color: 'white',
    fontSize: 20,
    fontWeight: '500',
  }
});