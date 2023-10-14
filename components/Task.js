import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const Task = (props) => {
  return (
    <View style={styles.item}>
      <View style={styles.itemLeft}>
        <View style={styles.circle}>
          <Icon
            name="circle"
            size={13}
            color={props.color}
          />
        </View>

        <Text style={styles.itemText}>{props.name}</Text>
      </View>

      <Text style={styles.additionTime}>{props.additionTime}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '64%',
  },
  circle: {
    paddingTop: 3,
    marginRight: 20,
  },
  itemText: {
    fontSize: 25,
    fontWeight: '600',
  },
  additionTime: {
    fontSize: 15,
    fontWeight: '500',
    color: '#999999',
  },
});

export default Task;