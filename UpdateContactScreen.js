import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as SQLite from 'expo-sqlite';
import * as ImagePicker from 'expo-image-picker';

const db = SQLite.openDatabase('newcontacts.db');

const UpdateContactScreen = ({ route, navigation }) => {
  const { contact } = route.params;
  const [name, setName] = useState(contact.name);
  const [mobileNumber, setMobileNumber] = useState(contact.mobileNumber);
  const [landlineNumber, setLandlineNumber] = useState(contact.landlineNumber);
  const [photo, setPhoto] = useState(contact.photo);
  const [isFavorite, setIsFavorite] = useState(contact.isFavorite === 1);

  useEffect(() => {
    setName(contact.name);
    setMobileNumber(contact.mobileNumber);
    setLandlineNumber(contact.landlineNumber);
    setPhoto(contact.photo);
    setIsFavorite(contact.isFavorite === 1);
  }, [contact]);

  const updateContact = () => {
    db.transaction(
      tx => {
        tx.executeSql(
          'UPDATE newcontacts SET name=?, mobileNumber=?, landlineNumber=?, photo=?, isFavorite=? WHERE id=?',
          [name, mobileNumber, landlineNumber, photo, isFavorite ? 1 : 0, contact.id],
          () => {
            console.log('Contact updated successfully');
            navigation.navigate('ContactList');
          },
          error => {
            console.error('Error updating contact:', error);
          }
        );
      },
      error => {
        console.error('Transaction error:', error);
      }
    );
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const deleteContact = () => {
    db.transaction(
      tx => {
        tx.executeSql(
          'DELETE FROM newcontacts WHERE id=?',
          [contact.id],
          () => {
            console.log('Contact deleted successfully');
            navigation.navigate('ContactList');
          },
          error => {
            console.error('Error deleting contact:', error);
          }
        );
      },
      error => {
        console.error('Transaction error:', error);
      }
    );
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.cancelled) {
      console.log(result.assets[0].uri);
      setPhoto(result.assets[0].uri);
    }
  };

  const choosePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.cancelled) {
      console.log('Selected photo URI:', result.assets[0].uri);
      setPhoto(result.assets[0].uri);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
  };

  const handlePhotoPress = () => {
    if (photo) {
      Alert.alert(
        'Update or Remove Photo',
        'Choose an option:',
        [
          { text: 'Update Photo', onPress: choosePhoto },
          { text: 'Remove Photo', onPress: removePhoto },
          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: true }
      );
    } else {
      Alert.alert(
        'Add Photo',
        'Choose an option:',
        [
          { text: 'Take Photo', onPress: takePhoto },
          { text: 'Choose from Library', onPress: choosePhoto },
          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: true }
      );
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePhotoPress}>
        <View style={styles.photoContainer}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.photo} />
          ) : (
            <View style={[styles.initialsContainer, { backgroundColor: getRandomColor() }]}>
              <Text style={styles.initials}>{getInitials(name)}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
      <Text style={styles.title}>Update Contact</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={text => setName(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Mobile Phone Number"
          value={mobileNumber}
          onChangeText={text => setMobileNumber(text)}
          keyboardType="phone-pad"
          maxLength={10}
        />
        <TextInput
          style={styles.input}
          placeholder="Landline Number"
          value={landlineNumber}
          onChangeText={text => setLandlineNumber(text)}
          keyboardType="phone-pad"
          maxLength={10}
        />
      </View>
      <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteButton}>
        <MaterialCommunityIcons name={isFavorite ? 'heart' : 'heart-outline'} size={24} color={isFavorite ? 'red' : 'black'} />
        <Text style={styles.favoriteButtonText}>{isFavorite ? 'Unmark as Favorite' : 'Mark as Favorite'}</Text>
      </TouchableOpacity>
      <View style={styles.buttonContainer}>
        <Button title="Update" onPress={updateContact} />
        <Button title="Delete" onPress={deleteContact} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 10,
    width: '100%',
  },
  input: {
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    width: '100%',
  },
  photoContainer: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
    backgroundColor: '#f2f2f2',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  initialsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    borderRadius: 75,
  },
  initials: {
    fontSize: 48,
    color: '#fff',
  },
  favoriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  favoriteButtonText: {
    marginLeft: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});

// Function to generate initials from name
const getInitials = (name) => {
  const nameParts = name.split(' ');
  return nameParts.map(part => part[0]).join('').toUpperCase();
};

// Function to generate random color for initials background
const getRandomColor = () => {
  const colors = ['#ff6347', '#ff4500', '#ffd700', '#32cd32', '#20b2aa', '#00ced1', '#9370db', '#a0522d', '#4682b4', '#4169e1'];
  return colors[Math.floor(Math.random() * colors.length)];
};

export default UpdateContactScreen;
