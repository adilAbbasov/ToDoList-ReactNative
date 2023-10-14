import React, { useState, useEffect, useRef } from 'react';
import { KeyboardAvoidingView, StyleSheet, Text, View, TextInput, TouchableOpacity, Keyboard, ScrollView } from 'react-native';
import Task from './components/Task';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as FileSystem from 'expo-file-system';

export default function App() {
  const [taskName, setTaskName] = useState();
  const [toDoTasks, setToDoTasks] = useState([]);
  const [inProgressTasks, setInProgressTasks] = useState([]);
  const [doneTasks, setDoneTasks] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState(toDoTasks);
  const [taskType, setTaskType] = useState('todo');
  const [taskColor, setTaskColor] = useState('orange');
  const [allTasks, setAllTasks] = useState({ toDoTasks, inProgressTasks, doneTasks });
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

    const newTask = {
      type: 'todo',
      name: taskName,
      additionTime: getCurrentTime(),
    };

    setSelectedTasks([...selectedTasks, newTask]);
    setToDoTasks([...toDoTasks, newTask]);
    setAllTasks({ ...allTasks, toDoTasks: [...toDoTasks, newTask] })
    setTaskName('');
  };

  const handleTasksChange = (array, type, color) => {
    setSelectedTasks(array);
    setTaskType(type);
    setTaskColor(color);
  };

  const moveTask = (type, index) => {
    const movedTask = selectedTasks[index];
    let updatedTasks = {};

    setSelectedTasks((prevArray) => prevArray.filter((_, i) => i !== index));

    switch (type) {
      case 'todo':
        setToDoTasks((prevArray) => prevArray.filter((_, i) => i !== index));
        setInProgressTasks([...inProgressTasks, { ...movedTask, type: 'inprogress', additionTime: getCurrentTime() }]);

        updatedTasks = {
          toDoTasks: toDoTasks.filter((_, i) => i !== index),
          inProgressTasks: [...inProgressTasks, { ...movedTask, type: 'inprogress', additionTime: getCurrentTime() }],
          doneTasks,
        };

        break;
      case 'inprogress':
        setInProgressTasks((prevArray) => prevArray.filter((_, i) => i !== index));
        setDoneTasks([...doneTasks, { ...movedTask, type: 'done', additionTime: getCurrentTime() }]);

        updatedTasks = {
          toDoTasks,
          inProgressTasks: inProgressTasks.filter((_, i) => i !== index),
          doneTasks: [...doneTasks, { ...movedTask, type: 'done', additionTime: getCurrentTime() }],
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

  const getCurrentDate = () => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    var hours = new Date().getUTCHours();
    var date = new Date().getUTCDate();
    var month = months[new Date().getUTCMonth()];
    var year = new Date().getUTCFullYear();
    var day = days[new Date().getUTCDay() - 1];

    if (hours + 4 > 23) {
      date += 1;
    }

    return date + ' ' + month + ' ' + year + ', ' + day;
  };

  const getCurrentTime = () => {
    var hours = new Date().getUTCHours();
    var minutes = new Date().getUTCMinutes();
    var period = 'AM';

    if (hours + 4 >= 12) {
      period = 'PM';
    }
    else if (hours + 4 >= 0) {
      period = 'AM';
    }

    if (hours + 4 > 23) {
      hours = hours + 4 - 24
    }
    else {
      hours += 4
    }

    return hours + ':' + minutes + ' ' + period;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1
        }}
        keyboardShouldPersistTaps='handled'
      >
        <View style={styles.tasksWrapper}>
          <View style={styles.tasksHeader}>
            <Text style={styles.sectionTitle}>Today</Text>
            <Icon style={styles.sectionIcon}
              name="list"
              size={25}
              color='gray'
            />
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
                  <TouchableOpacity key={index} onPress={() => moveTask(task.type, index)}>
                    <Task name={task.name} additionTime={task.additionTime} color={taskColor} />
                  </TouchableOpacity>
                )
              })
            }
          </View>
        </View>
      </ScrollView>

      {taskType == 'todo' && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.writeTaskWrapper}
        >
          <TextInput style={styles.input} placeholder={'Task name'} value={taskName} onChangeText={text => setTaskName(text)} />
          <TouchableOpacity onPress={() => handleAddTask()}>
            <View style={styles.addWrapper}>
              <Icon
                name="plus"
                size={30}
                color="white"
              />
            </View>
          </TouchableOpacity>
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
    paddingTop: 60,
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
  sectionIcon: {
    marginTop: 10,
  },
  sectionDate: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '700',
    color: '#999999'
  },
  taskTypes: {
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  taskType: {
    paddingVertical: 15,
    paddingHorizontal: 20,
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
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center'
  },
  input: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    backgroundColor: '#FFF',
    borderRadius: 60,
    borderColor: '#C0C0C0',
    borderWidth: 1,
    width: 300,
    fontSize: 22,
    fontWeight: '700',
  },
  addWrapper: {
    width: 60,
    height: 60,
    backgroundColor: 'forestgreen',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#C0C0C0',
    borderWidth: 1,
  },
  typeText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700'
  }
});