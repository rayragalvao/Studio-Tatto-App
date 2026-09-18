import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CustomDrawerContent from '../components/CustomDrawerContent';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import OrcamentosScreen from '../screens/orcamento/OrcamentosScreen';
import AgendamentosScreen from '../screens/agendamentos/AgendamentosScreen';
import EstoqueListScreen from '../screens/estoque/EstoqueListScreen';
import HistoricoClientesScreen from '../screens/clientes/HistoricoClientesScreen';
import DetalhesClienteScreen from '../screens/clientes/DetalhesClienteScreen';
import FlashScreen from '../screens/flash/FlashScreen';
import { View, Text, StyleSheet } from 'react-native';
import Header from '../components/Header';
import { colors } from '../theme/colors';
import PipelineETLScreen from '../screens/integracao/PipelineETLScreen';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

function PlaceholderScreen({ route }) {
  return (
    <View style={styles.placeholder}>
      <Header title={route.name} />
      <Text style={styles.placeholderText}>{route.name}</Text>
    </View>
  );
}

function makeStack(name, Component) {
  return function StackScreen() {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          fullScreenGestureEnabled: true,
        }}
      >
        <Stack.Screen name={name} component={Component} />
      </Stack.Navigator>
    );
  };
}

function HistoricoClientesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Historico" component={HistoricoClientesScreen} />
      <Stack.Screen name="DetalhesCliente" component={DetalhesClienteScreen} />
    </Stack.Navigator>
  );
}

function FlashTattoosStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FlashTattoos" component={FlashScreen} />
      <Stack.Screen name="FlashTattoosDetalhe" component={FlashScreen} />
    </Stack.Navigator>
  );
}

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      id="RootDrawer"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      backBehavior="history"
      screenOptions={{
        headerShown: false,
        drawerStyle: { width: 280 },
        overlayColor: 'rgba(0,0,0,0.6)',
        swipeEdgeWidth: 20, // reduz a faixa de captura do Drawer, liberando a borda pro swipe-back do Stack
      }}
    >
      <Drawer.Screen name="Dashboard" component={makeStack('Dashboard', DashboardScreen)} />
      <Drawer.Screen name="Orcamentos" component={makeStack('Orcamentos', OrcamentosScreen)} />
      <Drawer.Screen name="Agendamentos" component={makeStack('Agendamentos', AgendamentosScreen)} />
      <Drawer.Screen name="FlashTattoos" component={FlashTattoosStack} />
      <Drawer.Screen name="Estoque" component={makeStack('Estoque', EstoqueListScreen)} />
      <Drawer.Screen name="Historico" component={HistoricoClientesStack} />
      {/* <Drawer.Screen
        name="PipelineETL"
        component={makeStack('PipelineETL', PipelineETLScreen)}
        options={{ drawerLabel: 'Sincronização de Dados' }}
      /> */}
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  placeholder: { flex: 1, backgroundColor: colors.background },
  placeholderText: { color: colors.text, fontSize: 20, fontWeight: '700', textAlign: 'center', marginTop: 40 },
});