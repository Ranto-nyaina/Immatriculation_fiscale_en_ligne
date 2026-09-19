import React, { useState } from 'react';
import { createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from './accueil';
import HistogramScreen from './histogramme';
import HistoriqueScreen from './historique';
import { TabBarIcon } from '../../components/navigation/TabBarIcon';

const Tab = createBottomTabNavigator();

function BarreView(){
    
return(
    
    <Tab.Navigator>
    <Tab.Screen name="Civisme Fiscal" component={HomeScreen} 
      options={{
        tabBarIcon: ({ color, focused }) => (
        <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
      ),
    }}/>
    <Tab.Screen name="Historique" component={HistoriqueScreen}
     
      options={{
        tabBarIcon: ({ color, focused }) => (
        <TabBarIcon name={focused ? 'list-circle' : 'list-circle-outline'} color={color} />
      ),
    }}/>
    <Tab.Screen name="Historigramme" component={HistogramScreen}
     
     options={{
      tabBarIcon: ({ color, focused }) => (
      <TabBarIcon name={focused ? 'disc' : 'disc-outline'} color={color} />
    ),
  }}
    />
  </Tab.Navigator>
);
}

export default BarreView;