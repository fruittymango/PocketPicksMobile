/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import {
  Button,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Dimensions,
  FlatList,
} from 'react-native';
import type {StatusBarStyle, TextStyle, ViewStyle, ImageStyle} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator, BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const {width, height} = Dimensions.get('screen');

const Colors = {
  primaryTextColor: '#F3F3F4',
  secondaryTextColor: '#979797',
  actionableTxtColor: '#E82251',
  activeButtonBgColor: '#D72C55',
  primaryBgColor: '#0A1823',
  secondaryBgColor: '#222E3E',
};

type RootStackParamList = {
  Home: { userId: string } | undefined;
  MyList: { userId: string } | undefined;
  Profile: { userId: string } | undefined;
  Notifications: { userId: string } | undefined;
};

type ProfileProps = BottomTabScreenProps<RootStackParamList, 'Profile'>;

const ProfileHeader = () => {
  return(
    <View style={{display:'flex', flexDirection:'row',justifyContent:'space-between', paddingVertical:25, paddingHorizontal: 15,}}>
      <Text style={{fontSize:25,  maxWidth:'70%'}}>Guest</Text>
      <Pressable style={{alignSelf:'center'}}>
        <MaterialCommunityIcons name="bell-outline" color={'grey'} size={25} />
      </Pressable>
    </View>
  );
}

type ContentHeaderProps = {
  style?: ViewStyle;
};

const ContentHeader = ({style}:ContentHeaderProps)=> {
  return(
    <View style={{display:'flex', flexDirection:'row', justifyContent:'space-between', paddingVertical:25, paddingHorizontal: 15, marginBottom:15, ...style,}}>
      <View>
        <Text style={{fontSize:25, color:Colors.primaryTextColor, fontWeight:'600'}}>POCKET</Text>
        <Text style={{fontSize:22, color:Colors.primaryTextColor, fontWeight:'400', letterSpacing:9}}>`ICKS</Text>
      </View>
      
      <View style={{display:'flex', flexDirection:'row', columnGap:15, width: '25%', justifyContent:'flex-end', alignSelf:'center' }}>
        <Pressable>
          <MaterialIcons name="search" color={Colors.primaryTextColor} size={25} />
        </Pressable>
        <Pressable>
          <MaterialCommunityIcons name="bell-outline" color={Colors.primaryTextColor} size={25} />
        </Pressable>
      </View>
    </View>
  );
}

function Profile({route, navigation}: ProfileProps): React.JSX.Element {

  return (
    <SafeAreaView style={{backgroundColor:Colors.primaryBgColor}}>
      <ContentHeader style={{height: 0.12*height}}/>
      <ScrollView style={{height: height-(0.30*height ), }}></ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default Profile;