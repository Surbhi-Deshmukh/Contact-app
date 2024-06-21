import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, Image, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';

const db = SQLite.openDatabase('newcontacts.db');

const ContactList = ({ navigation }) => {
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      fetchContacts();
    }, [])
  );

  const fetchContacts = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM newcontacts ORDER BY name ASC',
        [],
        (_, { rows }) => {
          setContacts(rows._array);
        },
        (_, error) => {
          console.error('Error fetching contacts:', error);
        }
      );
    });
  };

  const renderContactItem = ({ item }) => {
    const initials = item.name.split(' ').map(word => word[0]).join('').toUpperCase();
    const circleColor = getRandomColor();
    
    return (
      <TouchableOpacity style={styles.contactItem} onPress={() => navigation.navigate('UpdateContact', { contact: item })}>
        {item.photo ? (
          <Image source={{ uri: item.photo }} style={styles.contactImage} />
        ) : (
          <View style={[styles.initialsContainer, { backgroundColor: circleColor }]}>
            <Text style={styles.initials}>{initials}</Text>
          </View>
        )}
        <Text style={styles.contactName}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  const goToCreateNewContact = () => {
    navigation.navigate('CreateNewContactScreen');
  };

  const filterContacts = () => {
    return contacts.filter(contact => contact.name.toLowerCase().startsWith(searchQuery.toLowerCase()));
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by name..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filterContacts()}
        renderItem={renderContactItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text>No contacts found.</Text>}
      />
      <TouchableOpacity style={styles.plusButton} onPress={goToCreateNewContact}>
        <Text style={styles.plusButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  searchInput: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  contactImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  initialsContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontSize: 18,
    color: 'white',
  },
  contactName: {
    fontSize: 18,
  },
  plusButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusButtonText: {
    fontSize: 24,
    color: 'white',
  },
});

function getRandomColor() {
  const colors = ['#3498db', '#9b59b6', '#2ecc71', '#e74c3c', '#f39c12', '#1abc9c', '#34495e', '#95a5a6'];
  return colors[Math.floor(Math.random() * colors.length)];
}

export default ContactList;
