import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, TouchableOpacity, Image, StyleSheet, Alert, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as SQLite from 'expo-sqlite';
import * as ImagePicker from 'expo-image-picker';

const db = SQLite.openDatabase('newcontacts.db');

const CreateNewContactScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [landlineNumber, setLandlineNumber] = useState('');
  const [photo, setPhoto] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [initials, setInitials] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    // Create the contacts table if it doesn't exist
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS newcontacts (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, mobileNumber TEXT, landlineNumber TEXT, photo TEXT, isFavorite INTEGER)',
        [],
        (_, result) => {
          console.log('Table created successfully');
        },
        (_, error) => {
          console.error('Error creating table:', error);
        }
      );
    });
  }, []);

  useEffect(() => {
    // Calculate initials when name changes
    if (name) {
      const nameParts = name.split(' ');
      const initials = nameParts.map(part => part[0]).join('').toUpperCase();
      setInitials(initials);
    } else {
      setInitials(''); // Reset initials when name is empty
    }
  }, [name]);

  const openCameraModal = () => {
    setModalVisible(true);
  };

  const takePhoto = async () => {
    setModalVisible(false);
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      console.log(result.assets[0].uri);
      setPhoto(result.assets[0].uri);
    }
  };

  const choosePhoto = async () => {
    setModalVisible(false);
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      console.log('Selected photo URI:', result.assets[0].uri);
      setPhoto(result.assets[0].uri);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
  };

  const saveContact = () => {
    console.log('Saving contact...');
    
    // Input validation
    const nameRegex = /^[A-Za-z0-9\s]+$/;
    const numberRegex = /^\d{10}$/; // Regex to match exactly 10 digits
  
    if (!nameRegex.test(name)) {
      Alert.alert('Error', 'Please enter a valid name (only letters allowed).');
      return;
    }
  
    if (!numberRegex.test(mobileNumber)) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number.');
      return;
    }
  
    // Save contact to the database
    db.transaction(
      tx => {
        tx.executeSql(
          'INSERT INTO newcontacts (name, mobileNumber, landlineNumber, photo, isFavorite) VALUES (?, ?, ?, ?, ?)',
          [name, mobileNumber, landlineNumber, photo, isFavorite ? 1 : 0],
          (_, { insertId, rowsAffected }) => {
            console.log('Contact saved successfully. Rows affected:', rowsAffected);
            Alert.alert('Success', 'Contact saved successfully');
            navigation.navigate('ContactList');
          },
          (_, error) => {
            console.error('Error saving contact:', error);
            Alert.alert('Error', 'Failed to save contact');
          }
        );        
      },
      error => {
        console.error('Transaction error:', error);
        Alert.alert('Error', 'Failed to save contact');
      }
    );
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Contact</Text>
      <TouchableOpacity style={styles.photoContainer} onPress={photo ? null : openCameraModal}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.photo} />
        ) : (
          <View style={styles.initialsContainer}>
            <Text style={styles.initials}>{initials}</Text>
            {!initials && (
              <MaterialCommunityIcons name="camera" size={32} color="black" style={styles.cameraIcon} />
            )}
          </View>
        )}
      </TouchableOpacity>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Name *"
          value={name}
          onChangeText={text => setName(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Mobile Phone Number *"
          value={mobileNumber}
          onChangeText={text => setMobileNumber(text)}
          keyboardType="phone-pad"
          maxLength={10}
        />
        <TextInput
          style={styles.input}
          placeholder="Landline Number (Optional)"
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
      <Button
        title="Save Contact"
        onPress={saveContact}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={takePhoto} style={styles.modalOption}>
              <Text style={styles.modalOptionText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={choosePhoto} style={styles.modalOption}>
              <Text style={styles.modalOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>
            {photo && (
              <TouchableOpacity onPress={removePhoto} style={styles.modalOption}>
                <Text style={[styles.modalOptionText, { color: 'red' }]}>Remove Photo</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalOption}>
              <Text style={[styles.modalOptionText, { color: 'blue' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 10,
  },
  input: {
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 10,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'lightgray',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  initialsContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'lightgray',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  favoriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  favoriteButtonText: {
    marginLeft: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalOption: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  modalOptionText: {
    fontSize: 18,
  },
  cameraIcon: {
    position: 'absolute',
  },
});

export default CreateNewContactScreen;
