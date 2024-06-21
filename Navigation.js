import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import ContactList from './ContactList';
import FavouriteContactsScreen from './FavouriteContactsScreen'; 
import UpdateContactScreen from './UpdateContactScreen';
import CreateNewContactScreen from './CreateNewContactScreen';

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ContactList" component={ContactList} />
      <Stack.Screen name="CreateNewContactScreen" component={CreateNewContactScreen} />
      <Stack.Screen name="UpdateContact" component={UpdateContactScreen} />
    </Stack.Navigator>
  );
}

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const Navigation = () => {
  return (
    <NavigationContainer>
     <Drawer.Navigator initialRouteName="Home">
        <Drawer.Screen name="Home" component={MainStack} options={{ title: 'Contacts' }} />
        <Drawer.Screen name="FavoriteContacts" component={FavouriteContactsScreen} options={{ title: 'Favorite Contacts' }} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

export default Navigation;
