import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, TouchableHighlight } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const Task = (props) => {
  const [isOptionsVisible, setOptionsVisible] = useState(false);
  const [isChanged, setIsChanged] = useState(true);
  const { tasksChanged, handleTasksChanged } = props;

  const checkDeadline = () => {
    currentDate = new Date().toLocaleDateString();

    if (props.deadline < currentDate) {
      return false;
    } else {
      return true;
    }
  }

  const handleIsChanged = () => {
    setIsChanged(false);
  }

  useEffect(() => {
    alert('ok')
    
    setIsChanged(tasksChanged);
    console.log(tasksChanged);
  }, []);

  useEffect(() => {
    console.log(isChanged);
  }, [isChanged]);

  const showHideOptions = () => {
    // handleTasksChanged();
    handleIsChanged();
    setOptionsVisible(!isOptionsVisible);
  };

  return (
    <View style={styles.item}>
      <View style={styles.itemUp}>
        <View style={styles.circle}>
          <Icon
            name="circle"
            size={13}
            color={props.color}
          />
        </View>

        <View style={styles.itemLeft}>
          <Text style={styles.itemText}>{props.name}</Text>

          <Text style={[styles.deadline, { color: checkDeadline() ? 'green' : 'red' }]}>{props.deadline}</Text>
        </View>

        <TouchableWithoutFeedback onPress={() => showHideOptions()}>
          <Text style={styles.taskMore}>...</Text>
        </TouchableWithoutFeedback>

        <View style={styles.itemRight}>
          <TouchableOpacity onPress={() => props.moveBackward(props.type, props.index)} disabled={props.type === 'todo'}>
            <View style={props.type !== 'todo' ? [styles.arrowWrapper, { paddingRight: 5 }] : [styles.arrowWrapper, { opacity: 0.5, paddingRight: 5 }]}>
              <Icon
                name="chevron-left"
                size={25}
                color="grey"
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => props.moveForward(props.type, props.index)} disabled={props.type === 'done'}>
            <View style={props.type !== 'done' ? [styles.arrowWrapper, { paddingLeft: 5 }] : [styles.arrowWrapper, { opacity: 0.5, paddingLeft: 5 }]}>
              <Icon
                name="chevron-right"
                size={25}
                color="grey"
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {(isOptionsVisible && !isChanged) &&
        <View style={styles.itemDown}>
          <TouchableHighlight onPress={() => props.handleEdit(props.index)} style={[styles.taskOption, { backgroundColor: 'deepskyblue' }]} underlayColor="lightgrey">
            <Text style={styles.optionText}>Edit</Text>
          </TouchableHighlight>
          <TouchableHighlight onPress={() => props.handleDelete(props.index)} style={[styles.taskOption, { backgroundColor: 'orangered' }]} underlayColor="lightgrey">
            <Text style={styles.optionText}>Delete</Text>
          </TouchableHighlight>
          <TouchableHighlight onPress={() => props.handleInfo(props.index)} style={[styles.taskOption, { backgroundColor: 'forestgreen' }]} underlayColor="lightgrey">
            <Text style={styles.optionText}>Info</Text>
          </TouchableHighlight>
        </View>
      }
    </View >
  )
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 15,
    marginBottom: 25,
    gap: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  itemUp: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemDown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLeft: {
    justifyContent: 'space-between',
    gap: 10,
    width: '55%',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '32%',
  },
  taskMore: {
    position: 'absolute',
    top: -35,
    right: -7,
    fontSize: 30,
    fontWeight: '800',
  },
  deadline: {
    fontSize: 20,
    fontWeight: '500',
  },
  circle: {
    paddingTop: 12,
  },
  itemText: {
    fontSize: 27,
    fontWeight: '600',
  },
  taskOption: {
    width: '31%',
    padding: 7,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  optionText: {
    fontSize: 22,
    fontWeight: '500',
    color: '#fff',
    textAlign: 'center',
  },
  arrowWrapper: {
    width: 50,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#C0C0C0',
    borderWidth: 4,
  },
});

export default Task;