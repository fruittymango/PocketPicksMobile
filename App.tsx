/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {
  StatusBar,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import Home from './src/Screens/Home';
import MyList from './src/Screens/UserList';

import { Tab, Colors } from './src/Models';

function App(): React.JSX.Element {
  const {height, width} = useWindowDimensions();

  return (
    <>
      <StatusBar backgroundColor={Colors.primaryBgColor} />
      <NavigationContainer>
        <Tab.Navigator
          initialRouteName="Home" 
          screenOptions={{
            tabBarActiveTintColor: Colors.activeButtonBgColor,
            tabBarStyle:{...styles.tabContainer, height: height>width? 0.08*height:0.08*width},
          }}>

          <Tab.Screen name="Home" component={Home}
            options={{
              headerShown:false,
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="home" color={color} size={size} />
              ),
            }}
          />

          <Tab.Screen name="MyList" component={MyList}
            options={{
              headerShown:false,
              tabBarIcon: ({ color, size }) => (
                <MaterialIcons name="personal-video" color={color} size={size} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}

const styles = StyleSheet.create({
  tabContainer:{
    paddingVertical:5,
    paddingBottom:10,
    backgroundColor:Colors.secondaryBgColor,
    borderColor: Colors.secondaryBgColor,
  }
});

export default App;