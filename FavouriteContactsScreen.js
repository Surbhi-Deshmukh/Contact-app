import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';

const db = SQLite.openDatabase('newcontacts.db');

const FavouriteContactsScreen = ({ navigation }) => {
  const [favoriteContacts, setFavoriteContacts] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      fetchFavoriteContacts();
    }, [])
  );

  const fetchFavoriteContacts = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM newcontacts WHERE isFavorite = ? ORDER BY name ASC',
        [1], // 1 represents true for isFavorite
        (_, { rows }) => {
          setFavoriteContacts(rows._array);
        },
        (_, error) => {
          console.error('Error fetching favorite contacts:', error);
        }
      );
    });
  };

  const renderContactItem = ({ item }) => {
    return (
      <TouchableOpacity style={styles.contactItem} onPress={() => navigation.navigate('UpdateContact', { contact: item })}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactNumber}>{item.mobileNumber}</Text>
        <Text style={styles.contactNumber}>{item.landlineNumber}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={favoriteContacts}
        renderItem={renderContactItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text>No favorite contacts found.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  contactItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  contactName: {
    fontSize: 18,
    marginBottom: 5,
  },
  contactNumber: {
    fontSize: 16,
    color: '#555',
  },
});

export default FavouriteContactsScreen;
